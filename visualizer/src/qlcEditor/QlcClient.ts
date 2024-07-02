import {signal} from '@preact/signals'

import {clamp} from '../common/math'
import {Socket, SocketStatus} from '../common/socket'

const clampInt = (value: number, min: number, max: number) => clamp(value, min, max) | 0

const clampUint8 = (value: number) => clamp(value, 0, 255) | 0

export class QlcClient {
  #socket?: Socket
  readonly statusSignal = signal<SocketStatus>({type: 'closed'})

  constructor(readonly url: string) {}

  connect = () => {
    if (this.#socket) {
      return
    }

    this.#socket = new Socket(this.url)

    this.#socket
      .on('status', (status) => {
        this.statusSignal.value = status
      })
      .on('close', () => {
        this.#socket = undefined
      })
      .on('message', (event) => {
        // FIXME:
        // eslint-disable-next-line no-console
        console.log('QCL+', event.data)
      })
      .on('error', (error) => {
        console.error('QCL+', error)
      })

    this.statusSignal.value = this.#socket.status
  }

  disconnect = () => {
    this.#socket?.close({timeout: 1000}) // QLC+ doesn't support graceful disconnects
  }

  /**
   * @param address DMX address `[1..512]`
   * @param value Value `[0,1]`
   */
  sendChannelValue = (address: number, value: number) => {
    address = clampInt(address, 1, 512) // TODO: allow addressing universes
    value = clampUint8(value * 255)
    this.#socket?.send(`CH|${address}|${value}`)
  }

  /**
   * @param value Value `[0,1]`
   */
  sendGrandMasterValue = (value: number) => {
    value = clampUint8(value * 255)
    this.#socket?.send(`GM_VALUE|${value}`)
  }
}
