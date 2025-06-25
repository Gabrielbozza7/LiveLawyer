import { ConnectedLawyerIdentity, ConnectedObserverIdentity } from '../IdentityMap'

export default class Queues {
  private readonly _waitingObservers: ConnectedObserverIdentity[]
  private readonly _waitingLawyers: Map<string, ConnectedLawyerIdentity[]>

  constructor() {
    this._waitingObservers = []
    this._waitingLawyers = new Map()
  }

  private stateQueue(state: string): ConnectedLawyerIdentity[] {
    let waitingLawyersInState = this._waitingLawyers.get(state)
    if (waitingLawyersInState === undefined) {
      waitingLawyersInState = []
      this._waitingLawyers.set(state, waitingLawyersInState)
    }
    return waitingLawyersInState
  }

  public inAnyQueue(worker: ConnectedObserverIdentity | ConnectedLawyerIdentity): boolean {
    if (worker.type === 'Observer') {
      return this._waitingObservers.find(value => worker === value) !== undefined
    } else {
      const waitingLawyers = this.stateQueue(worker.state)
      return waitingLawyers.find(value => worker === value) !== undefined
    }
  }

  public enqueue(worker: ConnectedObserverIdentity | ConnectedLawyerIdentity): boolean {
    if (this.inAnyQueue(worker)) {
      return false
    }
    if (worker.type === 'Observer') {
      this._waitingObservers.push(worker)
      console.log(`Enqueued an observer, new length: ${this._waitingObservers.length}`)
    } else {
      const waitingLawyers = this.stateQueue(worker.state)
      waitingLawyers.push(worker)
      console.log(`Enqueued a lawyer (${worker.state}), new length: ${waitingLawyers.length}`)
    }
    return true
  }

  public dequeueObserver(): ConnectedObserverIdentity | undefined {
    const observer = this._waitingObservers.shift()
    if (observer !== undefined) {
      console.log(`Dequeued an observer, new length: ${this._waitingObservers.length}`)
    }
    return observer
  }

  public dequeueLawyer(state: string): ConnectedLawyerIdentity | undefined {
    const waitingLawyers = this.stateQueue(state)
    const lawyer = waitingLawyers.shift()
    if (lawyer !== undefined) {
      console.log(`Dequeued a lawyer (${state}), new length: ${waitingLawyers.length}`)
    }
    return lawyer
  }

  public kick(worker: ConnectedObserverIdentity | ConnectedLawyerIdentity): boolean {
    let index = -1
    if (worker.type === 'Observer') {
      if (
        this._waitingObservers.find((value, i) => {
          index = i
          return worker === value
        }) !== undefined
      ) {
        this._waitingObservers.splice(index)
        console.log(`Kicked an observer, new length: ${this._waitingObservers.length}`)
        return true
      } else {
        return false
      }
    } else {
      const waitingLawyers = this.stateQueue(worker.state)
      if (
        waitingLawyers.find((value, i) => {
          index = i
          return worker === value
        }) !== undefined
      ) {
        waitingLawyers.splice(index)
        console.log(`Kicked a lawyer (${worker.state}), new length: ${waitingLawyers.length}`)
        return true
      } else {
        return false
      }
    }
  }
}
