import { Database } from 'livelawyerlibrary/database-types'
import { ConnectedLawyerIdentity, ConnectedObserverIdentity } from '../IdentityMap'
import { LinkedQueue } from './LinkedQueue'

export default class Queues {
  private readonly _waitingObservers: LinkedQueue<ConnectedObserverIdentity>
  private readonly _waitingLawyers: Map<
    Database['public']['Enums']['UsState'],
    LinkedQueue<ConnectedLawyerIdentity>
  >

  constructor() {
    this._waitingObservers = new LinkedQueue()
    this._waitingLawyers = new Map()
  }

  private stateQueue(
    state: Database['public']['Enums']['UsState'],
  ): LinkedQueue<ConnectedLawyerIdentity> {
    let waitingLawyersInState = this._waitingLawyers.get(state)
    if (waitingLawyersInState === undefined) {
      waitingLawyersInState = new LinkedQueue()
      this._waitingLawyers.set(state, waitingLawyersInState)
    }
    return waitingLawyersInState
  }

  public inAnyQueue(worker: ConnectedObserverIdentity | ConnectedLawyerIdentity): boolean {
    if (worker.type === 'Observer') {
      return worker.queueNode !== null
    } else {
      return worker.queueNodes.length > 0
    }
  }

  public enqueue(worker: ConnectedObserverIdentity | ConnectedLawyerIdentity): boolean {
    if (this.inAnyQueue(worker)) {
      return false
    }
    if (worker.type === 'Observer') {
      worker.queueNode = this._waitingObservers.pushBack(worker)
      console.log(`Enqueued an observer, new length: ${this._waitingObservers.length}`)
    } else {
      worker.licensedStates.forEach(state => {
        const waitingLawyers = this.stateQueue(state)
        worker.queueNodes.push(waitingLawyers.pushBack(worker))
        console.log(`Enqueued a lawyer (${state}), new length: ${waitingLawyers.length}`)
      })
    }
    return true
  }

  public dequeueObserver(): ConnectedObserverIdentity | undefined {
    const observer = this._waitingObservers.popFront()
    if (observer !== undefined) {
      observer.queueNode = null
      console.log(`Dequeued an observer, new length: ${this._waitingObservers.length}`)
    }
    return observer
  }

  public dequeueLawyer(
    state: Database['public']['Enums']['UsState'],
  ): ConnectedLawyerIdentity | undefined {
    const waitingLawyers = this.stateQueue(state)
    const lawyer = waitingLawyers.popFront()
    if (lawyer !== undefined) {
      lawyer.queueNodes.forEach(node => {
        node.remove()
        console.log(`Dequeued a lawyer (${state}), new length: ${waitingLawyers.length}`)
      })
      lawyer.queueNodes = []
    }
    return lawyer
  }

  public kick(worker: ConnectedObserverIdentity | ConnectedLawyerIdentity): boolean {
    if (worker.type === 'Observer') {
      if (worker.queueNode !== null) {
        worker.queueNode.remove()
        worker.queueNode = null
        console.log(`Kicked an observer, new length: ${this._waitingObservers.length}`)
        return true
      } else {
        return false
      }
    } else {
      if (worker.queueNodes.length > 0) {
        worker.queueNodes.forEach(node => {
          node.remove()
          console.log(`Kicked a lawyer (new length not easily acquirable with implementation)`)
        })
        worker.queueNodes = []
        return true
      } else {
        return false
      }
    }
  }
}
