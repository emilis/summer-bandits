import {useEffect, useState} from 'preact/hooks'

import {Button, Monaco} from '../components'
import {QlcClient} from './QlcClient'
import {AudioAnalyzer, AudioFeatures, createAudioAnalyzer} from './audioAnalyzer'
import {createQlcScriptRunner, qlcScriptTypedef} from './qlcScript'
import {BarGraph, BoxedValues} from '../components/graph/BarGraph'
import {Signal, signal} from '@preact/signals'

const defaultCode = `
onTick((dt, features) => {
  const energy = features.energy[0] * 20
  console.log(energy)

  // Set grand master value
  qlc.gm = energy
})
`.trim()

export type QlcEditor = {
  props: {
    qlcClient: QlcClient
    audioNode?: AudioNode
  }
}

export const QlcEditor = ({qlcClient, audioNode}: QlcEditor['props']) => {
  const [code, setCode] = useState(defaultCode)
  const analyzer = useAudioAnalyzer(audioNode)
  const runScript = useQlcScriptRunner(qlcClient, analyzer)
  const signals = useAudioFeatureSignals(analyzer)

  const handleRunClick = () => {
    runScript?.(code)
  }

  const handleStopClick = () => {
    runScript?.('')
  }

  return (
    <div>
      <Button onClick={handleRunClick}>Run</Button>
      <Button onClick={handleStopClick}>Stop</Button>
      <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px'}}>
        {Object.entries(signals).map(([name, signal]) => (
          <BarGraph key={name} label={name} values={signal} />
        ))}
      </div>
      <Monaco value={code} language="typescript" typedefs={qlcScriptTypedef} onChange={setCode} />
    </div>
  )
}

const useAudioAnalyzer = (audioNode?: AudioNode) => {
  const [analyzer, setAnalyzer] = useState<AudioAnalyzer | null>(null)

  useEffect(() => {
    if (!audioNode) {
      return
    }

    const analyzer = createAudioAnalyzer(audioNode)
    setAnalyzer(analyzer)

    return () => {
      analyzer.dispose()
    }
  }, [audioNode])

  return analyzer
}

const useQlcScriptRunner = (qlcClient: QlcClient, audioAnalyzer?: AudioAnalyzer | null) => {
  const [runner, setRunner] = useState<ReturnType<typeof createQlcScriptRunner> | null>(null)

  useEffect(() => {
    if (!audioAnalyzer) {
      return
    }

    const runner = createQlcScriptRunner(qlcClient, audioAnalyzer)
    setRunner(runner)

    return () => {
      runner.dispose()
    }
  }, [qlcClient, audioAnalyzer])

  return runner?.setScript
}

const useAudioFeatureSignals = (analyzer?: AudioAnalyzer | null) => {
  const [signals, setSignals] = useState<Record<string, Signal<BoxedValues>>>({})

  useEffect(() => {
    if (!analyzer) {
      return
    }

    const fftSignal = signal<BoxedValues>({values: []})
    const energySignal = signal<BoxedValues>({values: []})
    const loudnessSignal = signal<BoxedValues>({values: []})

    const handleAudioFrame = (dt: number, features: AudioFeatures) => {
      fftSignal.value = {values: features.fft}
      energySignal.value = {values: features.energy.map((value) => value * 10)} // FIXME
      loudnessSignal.value = {values: features.loudness.map((value) => value / 5)} // FIXME
    }

    setSignals({
      fft: fftSignal,
      energy: energySignal,
      loudness: loudnessSignal,
    })

    analyzer.addCallback(handleAudioFrame)

    return () => {
      analyzer.removeCallback(handleAudioFrame)
    }
  }, [analyzer])

  return signals
}
