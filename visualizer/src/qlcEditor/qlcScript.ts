import {QlcClient} from './QlcClient'
import {AudioAnalyzer, AudioFeatures, AudioFrameCallback} from './audioAnalyzer'

type QlcState = {
  gm: number
  [channel: number]: number
}

const asArrayIndex = (key: string) => {
  const index = parseInt(key, 10)
  return index.toString() === key && index >= 0 ? index : undefined
}

export const createQlcStateProxy = (onChange: (key: string, value: number) => void) => {
  const record = Object.create(null) as Record<string, number>

  return new Proxy(record, {
    set: (target, key: string, value: number) => {
      target[key] = value
      onChange(key, value)
      return true
    },
  }) as QlcState
}

export const createQlcScriptFn = (qlcState: QlcState, code: string) => {
  const callbacks: AudioFrameCallback[] = []

  const registerCallback = (callback: AudioFrameCallback) => {
    callbacks.push(callback)
  }

  new Function('onTick', 'qlc', code)(registerCallback, qlcState)

  return (dt: number, features: AudioFeatures) => {
    callbacks.forEach((callback) => {
      callback(dt, features)
    })
  }
}

export const createQlcScriptRunner = (qlcClient: QlcClient, audioAnalyzer: AudioAnalyzer) => {
  let scriptFn: ReturnType<typeof createQlcScriptFn> | null = null

  const qlcState = createQlcStateProxy((key, value) => {
    if (key === 'gm') {
      qlcClient.sendGrandMasterValue(value)
      return
    }

    const index = asArrayIndex(key)

    if (index !== undefined) {
      qlcClient.sendChannelValue(index, value)
      return
    }

    // TODO: qlc functions?
  })

  const handleAudioFrame = (dt: number, features: AudioFeatures) => {
    scriptFn?.(dt, features)
  }

  audioAnalyzer.addCallback(handleAudioFrame)

  return {
    setScript: (code: string) => {
      scriptFn = createQlcScriptFn(qlcState, code)
    },
    dispose: () => {
      audioAnalyzer.removeCallback(handleAudioFrame)
    },
  }
}

export const qlcScriptTypedef = `
type AudioFeatures = {
  fft: number[]
  loudness: number[]
  energy: number[]
}

type AudioFrameCallback = (dt: number, features: AudioFeatures) => void

type QlcState = {
  gm: number
  [channel: number]: number
}

declare const onTick: (callback: AudioFrameCallback) => void

declare const qlc: QlcState
`
