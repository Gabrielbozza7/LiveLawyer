import { UserType } from 'livelawyerlibrary'
import { UserSocket } from './server-types'

export default class IdentityMap {
  // Maps socket.io Socket IDs to user IDs
  private readonly _map: Map<string, string>

  constructor() {
    this._map = new Map()
  }

  public async register(
    socket: UserSocket,
    userId: string,
    userSecret: string,
    userType: UserType,
  ): Promise<boolean> {
    const successfullyAuthenticated: boolean = ((userId, userSecret, userType) => {
      // This is where secret validation would eventually go, returning false if the user should not be authenticated.
      // (That is why the method is async.)
      return userId && userSecret && typeof userType === 'string'
    })(userId, userSecret, userType)
    if (!successfullyAuthenticated) {
      return false
    }

    this._map.set(socket.id, userId)
    return true
  }

  public remove(socket: UserSocket): boolean {
    return this._map.delete(socket.id)
  }

  public userIdOf(socket: UserSocket): string | undefined {
    return this._map.get(socket.id)
  }
}
