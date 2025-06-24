import { UserSocket } from './server-types'
import { authenticate } from './database/supabase'

export default class IdentityMap {
  // Maps socket.io Socket IDs to socket tokens and user IDs
  private readonly _map: Map<string, { socketToken: string; userId: string }>
  private readonly _userIds: Set<string>

  constructor() {
    this._map = new Map()
    this._userIds = new Set()
  }

  public async register(socket: UserSocket, accessToken: string): Promise<string | false> {
    let userId: string
    try {
      userId = await authenticate(accessToken)
    } catch {
      return false
    }
    if (this._userIds.has(userId)) {
      return false
    }
    const socketToken = crypto.randomUUID()
    this._userIds.add(userId)
    this._map.set(socket.id, { socketToken, userId })
    return socketToken
  }

  public remove(socket: UserSocket): string | false {
    const userId = this._map.get(socket.id)?.userId
    if (userId === undefined) {
      return false
    }
    this._map.delete(socket.id)
    this._userIds.delete(userId)
    return userId
  }

  public userIdOf(socket: UserSocket): string | undefined {
    return this._map.get(socket.id)?.userId
  }
}
