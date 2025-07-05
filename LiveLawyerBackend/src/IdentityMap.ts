import { UserSocket } from './server-types'
import { authenticate, getSupabaseClient } from './database/supabase'
import { Coordinates } from 'livelawyerlibrary/socket-event-definitions'
import ActiveRoom from './calls/ActiveRoom'
import { UserType } from 'livelawyerlibrary'
import { stateFromCoordinates } from './coord2state'
import { Database } from 'livelawyerlibrary/database-types'
import { LinkedQueueNode } from './calls/LinkedQueue'

export default class IdentityMap {
  // Maps socket.io socket IDs to identities
  private readonly _map: Map<string, ConnectedUserIdentity>
  private readonly _userIds: Set<string>

  constructor() {
    this._map = new Map()
    this._userIds = new Set()
  }

  public async register(
    socket: UserSocket,
    accessToken: string,
    location: Coordinates | null,
  ): Promise<string | false> {
    let id: string
    try {
      id = await authenticate(accessToken)
    } catch {
      return false
    }
    if (this._userIds.has(id)) {
      return false
    }
    const supabase = await getSupabaseClient()
    const { data, error } = await supabase.from('User').select('userType').eq('id', id).single()
    if (error) {
      console.log('Error when trying to determine the type of a user for authentication:')
      console.error(error)
      return false
    }
    if (
      data === null ||
      !(data.userType === 'Client' || data.userType === 'Observer' || data.userType === 'Lawyer')
    ) {
      return false
    }
    const socketToken = crypto.randomUUID()
    const type = data.userType
    if (type === 'Observer') {
      this._map.set(socket.id, { socket, socketToken, id, type, room: null, queueNode: null })
    } else if (type === 'Client') {
      if (location === null) {
        return false
      }
      const state = stateFromCoordinates(location.lat, location.lon)
      if (state === null) {
        return false
      }
      this._map.set(socket.id, {
        socket,
        socketToken,
        id,
        type,
        room: null,
        location,
        state,
      })
    } else if (type === 'Lawyer') {
      const { data, error } = await supabase.from('UserLawyer').select().eq('id', id).single()
      if (error || data === null || data.licensedStates.length < 1) {
        return false
      }
      this._map.set(socket.id, {
        socket,
        socketToken,
        id,
        type,
        room: null,
        licensedStates: data.licensedStates,
        queueNodes: [],
      })
    }
    this._userIds.add(id)
    return socketToken
  }

  public remove(socket: UserSocket): string | false {
    const userId = this._map.get(socket.id)?.id
    if (userId === undefined) {
      return false
    }
    this._map.delete(socket.id)
    this._userIds.delete(userId)
    return userId
  }

  public userFromSocket(socket: UserSocket): ConnectedUserIdentity | undefined {
    return this._map.get(socket.id)
  }

  public userFromSocketWithToken(
    socket: UserSocket,
    socketToken: string,
  ): ConnectedUserIdentity | undefined {
    const user = this._map.get(socket.id)
    if (user === undefined || user.socketToken !== socketToken) {
      return undefined
    } else {
      return user
    }
  }
}

export type ConnectedUserIdentity =
  | ConnectedClientIdentity
  | ConnectedObserverIdentity
  | ConnectedLawyerIdentity

interface ConnectedAnyIdentity {
  socket: UserSocket
  socketToken: string
  id: string
  type: UserType
  room: ActiveRoom | null
}

export type ConnectedClientIdentity = ConnectedAnyIdentity & {
  type: 'Client'
  location: Coordinates
  state: Database['public']['Enums']['UsState']
}

export type ConnectedObserverIdentity = ConnectedAnyIdentity & {
  type: 'Observer'
  queueNode: LinkedQueueNode<ConnectedObserverIdentity> | null
}

export type ConnectedLawyerIdentity = ConnectedAnyIdentity & {
  type: 'Lawyer'
  licensedStates: Database['public']['Enums']['UsState'][]
  queueNodes: LinkedQueueNode<ConnectedLawyerIdentity>[]
}
