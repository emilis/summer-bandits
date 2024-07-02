import {useEffect, useState} from 'preact/hooks'
import {HydraEditor} from './hydraEditor/HydraEditor'
import {QlcClient} from './qlcEditor/QlcClient'
import {QlcEditor} from './qlcEditor/QlcEditor'

const qlcClient = new QlcClient('ws://127.0.0.1:9999/qlcplusWS')

qlcClient.connect()

const audioNodePromise = navigator.mediaDevices
  .getUserMedia({audio: true}) //
  .then((inputStream) => {
    const context = new AudioContext({
      latencyHint: 'interactive',
      sampleRate: 44100, // doesn't work on FF
    })

    return context.createMediaStreamSource(inputStream)
  })

export const App = () => {
  const [audioSource, setAudioSource] = useState<AudioNode>()

  useEffect(() => {
    audioNodePromise.then(setAudioSource)
  }, [])

  return (
    <div class="app" style={{display: 'flex', gap: '32px', flexDirection: 'column'}}>
      <HydraEditor />
      <QlcEditor qlcClient={qlcClient} audioNode={audioSource} />
    </div>
  )
}
