export class LinkedQueue<T> {
  private _length: number
  private _lengthDecrementor: () => void
  private readonly _head: LinkedQueueNode<T>
  private readonly _tail: LinkedQueueNode<T>

  constructor() {
    this._length = 0
    this._lengthDecrementor = () => this._length--
    this._head = new LinkedQueueNode<T>(undefined, this._lengthDecrementor)
    this._tail = new LinkedQueueNode<T>(undefined, this._lengthDecrementor)
    this._head.next = this._tail
    this._tail.prev = this._head
  }

  public get length(): number {
    return this._length
  }

  public pushBack(value: T): LinkedQueueNode<T> {
    const beforeTail = this._tail.prev!
    const newNode = new LinkedQueueNode<T>(value, this._lengthDecrementor)
    beforeTail.next = newNode
    newNode.prev = beforeTail
    newNode.next = this._tail
    this._tail.prev = newNode
    this._length++
    return newNode
  }

  public popFront(): T | undefined {
    if (this._head.next === this._tail) {
      return undefined
    }
    const targetNode = this._head.next!
    targetNode.remove()
    return targetNode.value
  }
}

export class LinkedQueueNode<T> {
  protected readonly _value: T | undefined
  private _lengthDecrementor: () => void
  public prev: LinkedQueueNode<T> | undefined
  public next: LinkedQueueNode<T> | undefined

  constructor(value: T | undefined, lengthDecrementor: () => void) {
    this._value = value
    this._lengthDecrementor = lengthDecrementor
  }

  public get value(): T {
    if (this._value === undefined) {
      throw new Error('Cannot extract value from bounds of linked queue')
    }
    return this._value
  }

  public remove(): boolean {
    if (this.prev === undefined || this.next === undefined) {
      return false
    }
    this.prev.next = this.next
    this.next.prev = this.prev
    this.prev = undefined
    this.next = undefined
    this._lengthDecrementor()
    return true
  }
}
