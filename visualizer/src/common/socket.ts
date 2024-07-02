export type SocketStatus =
  | {type: 'connecting'} //
  | {type: 'open'}
  | {type: 'closing'}
  | {type: 'closed'; reason?: string}

export type SocketCloseOptions = {
  code?: number
  reason?: string
  timeout?: number
}

export class Socket {
  #socket: WebSocket
  #status: SocketStatus = {type: 'connecting'}
  #listenerMap = new Map<string, Set<Function>>()
  #closeTimeoutId?: ReturnType<typeof setTimeout>

  get status() {
    return this.#status
  }

  constructor(url: string | URL, protocols?: string | string[]) {
    const socket = new WebSocket(url, protocols)
    this.#socket = socket

    socket.onopen = (event: Event) => {
      this.#status = {type: 'open'}
      this.#dispatch('open', event)
      this.#dispatch('status', this.#status)
    }

    socket.onclose = (event: CloseEvent) => {
      this.#cleanup()

      // https://www.rfc-editor.org/rfc/rfc6455.html#section-7.4.1
      const whoopsie = !event.wasClean || event.code === 1006

      this.#status = {
        type: 'closed',
        reason: whoopsie ? 'Connection closed unexpectedly' : undefined,
      }

      this.#dispatch('close', event)
      this.#dispatch('status', this.#status)
    }

    socket.onmessage = (event: MessageEvent) => {
      this.#dispatch('message', event)
    }

    socket.onerror = (error: Event) => {
      this.#dispatch('error', error)
    }
  }

  #cleanup() {
    if (this.#closeTimeoutId !== undefined) {
      clearTimeout(this.#closeTimeoutId)
    }

    this.#socket.onopen = null
    this.#socket.onclose = null
    this.#socket.onmessage = null
    this.#socket.onerror = null
  }

  #dispatch(event: string, ...args: any[]) {
    this.#listenerMap.get(event)?.forEach((listener) => {
      try {
        listener(...args)
      } catch (error) {
        console.error(error)
      }
    })
  }

  on(event: 'status', callback: (status: SocketStatus) => void): this
  on(event: 'open', callback: (even: Event) => void): this
  on(event: 'close', callback: (event?: CloseEvent) => void): this
  on(event: 'message', callback: (event: MessageEvent) => void): this
  on(event: 'error', callback: (event: Event) => void): this
  on(event: string, callback: (event: any) => void): this {
    const listeners = this.#listenerMap.get(event)

    if (listeners === undefined) {
      this.#listenerMap.set(event, new Set([callback]))
    } else {
      listeners.add(callback)
    }

    return this
  }

  off(event: string, callback: Function): this {
    this.#listenerMap.get(event)?.delete(callback)
    return this
  }

  send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
    this.#socket.send(data)
  }

  close(options: SocketCloseOptions) {
    if (this.#status.type === 'closed' || this.#status.type === 'closing') {
      return
    }

    this.#status = {type: 'closing'}
    this.#dispatch('status', this.#status)

    this.#socket.close(options.code, options.reason)

    if (options.timeout !== undefined) {
      this.#closeTimeoutId = setTimeout(() => {
        this.#cleanup()
        this.#status = {type: 'closed'}
        this.#dispatch('close')
        this.#dispatch('status', this.#status)
      }, options.timeout)
    }
  }
}
