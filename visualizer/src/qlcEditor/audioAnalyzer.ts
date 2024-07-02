import Meyda, {MeydaAudioFeature, MeydaFeaturesObject} from 'meyda'
import {MeydaAnalyzerOptions} from 'meyda/dist/esm/meyda-wa'

import {remap} from '../common/math'

export type AudioFeatures = {
  fft: number[]
  loudness: number[]
  energy: number[]
}

export type AudioFrameCallback = (dt: number, features: AudioFeatures) => void

export type AudioAnalyzer = {
  addCallback: (callback: AudioFrameCallback) => void
  removeCallback: (callback: AudioFrameCallback) => void
  dispose: () => void
}

export const createAudioAnalyzer = (audioNode: AudioNode): AudioAnalyzer => {
  const {context} = audioNode

  if (!(context instanceof AudioContext)) {
    throw new Error('Node must be connected to an AudioContext')
  }

  const callbacks = new Set<AudioFrameCallback>()
  const {sampleRate} = context
  const bufferSize = 512
  const dt = bufferSize / sampleRate
  const features: MeydaAudioFeature[] = ['energy', 'loudness']

  // FFT
  const analyzerNode = context.createAnalyser()
  analyzerNode.fftSize = 32
  analyzerNode.smoothingTimeConstant = 0
  analyzerNode.minDecibels = -100
  analyzerNode.maxDecibels = 0
  audioNode.connect(analyzerNode)

  const options: MeydaAnalyzerOptions = {
    audioContext: context,
    source: audioNode,
    sampleRate,
    bufferSize,
    featureExtractors: features,
    inputs: 2,
    numberOfBarkBands: 6,
    numberOfMFCCCoefficients: 64,
    startImmediately: true,
    callback: (meydaFeatures: Partial<MeydaFeaturesObject>) => {
      const fft = Array.from(readFrequencyData(analyzerNode))
      const energy = meydaFeatures.energy ? [meydaFeatures.energy / bufferSize] : [0] // normalized
      const loudness = meydaFeatures.loudness ? Array.from(meydaFeatures.loudness.specific) : [0]
      callbacks.forEach((callback) => callback(dt, {fft, energy, loudness}))
    },
  }

  const analyzer = Meyda.createMeydaAnalyzer(options)

  return {
    addCallback: (callback: AudioFrameCallback) => {
      callbacks.add(callback)
    },
    removeCallback: (callback: AudioFrameCallback) => {
      callbacks.delete(callback)
    },
    dispose: () => {
      audioNode.disconnect(analyzerNode)
      analyzer.stop()
    },
  }
}

const readFrequencyData = (node: AnalyserNode) => {
  const {minDecibels, maxDecibels} = node
  const bins = new Float32Array(node.frequencyBinCount)
  node.getFloatFrequencyData(bins)

  for (let i = 0; i < bins.length; i++) {
    bins[i] = remap(bins[i], minDecibels, maxDecibels, 0, 1)
  }

  return bins
}
