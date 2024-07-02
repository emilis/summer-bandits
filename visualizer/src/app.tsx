import {useEffect, useState} from 'preact/hooks'
import {HydraEditor} from './hydraEditor/HydraEditor'
import {QlcClient} from './qlcEditor/QlcClient'
import {QlcEditor} from './qlcEditor/QlcEditor'

const qlcClient = new QlcClient('ws://127.0.0.1:9999/qlcplusWS')

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

// import {useEffect, useState} from 'preact/hooks'

// import {enumerateAudioInputs, getAudioStream, queryPermissionState} from './common/platform'
// import {Button, BarGraph, Select, Monaco} from './components'
// import {createMeydaAnalyzer} from './analyzer'
// import {QlcClient} from './QlcClient'

// const getDeviceName = (device: MediaDeviceInfo) => device.label || device.deviceId || 'Unknown Device'

// type AudioInputDeviceList = {
//   props: {
//     onClick?: (device: MediaDeviceInfo) => void
//   }
// }

// const AudioInputDeviceList = ({onClick}: AudioInputDeviceList['props']) => {
//   const [devices, setDevices] = useState<MediaDeviceInfo[]>()
//   const [selectedDevice, setSelectedDevice] = useState<MediaDeviceInfo>()

//   useEffect(() => {
//     enumerateAudioInputs().then(setDevices) // handle error
//   }, [])

//   const options =
//     devices?.map((device) => ({
//       value: device.deviceId,
//       label: getDeviceName(device),
//     })) || []

//   return (
//     <div>
//       <Select
//         aria-label="Select audio input"
//         value={selectedDevice?.deviceId}
//         placeholder="Select a device"
//         options={options}
//         onChange={(_event, value) => {
//           const device = devices?.find((device) => device.deviceId === value)

//           if (!device) {
//             return
//           }

//           setSelectedDevice(device)
//           onClick?.(device)
//         }}
//       />
//     </div>
//   )
// }

// const createAnalyser = (inputStream: MediaStream) => {
//   const context = new AudioContext({
//     latencyHint: 'interactive',
//     sampleRate: 44100, // FIXME: resampling doesn't work in FF
//   })

//   const sourceNode = context.createMediaStreamSource(inputStream)
//   const meydaAnalyzer = createMeydaAnalyzer(sourceNode)

//   return {
//     ...meydaAnalyzer,
//     dispose: () => {
//       meydaAnalyzer.dispose()
//       context.close()
//     },
//   }
// }

// const AudioAnalyzer = () => {
//   const analyser = useDisposable(() => getInputStream().then(createAnalyser), [])

//   return (
//     <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
//       {Object.keys(analyser?.signals || {}).map((key) => (
//         <BarGraph key={key} label={key} values={analyser?.signals[key] || []} />
//       ))}
//     </div>
//   )
// }

// type Disposable = {
//   dispose: () => void
// }

// const useDisposable = <T extends Disposable>(factory: () => Promise<T>, deps: any[]) => {
//   const [disposable, setDisposable] = useState<T>()

//   useEffect(() => {
//     const disposablePromise = factory()

//     disposablePromise.then(setDisposable)

//     return () => {
//       disposablePromise.then((disposable) => {
//         disposable.dispose()
//       })
//     }
//   }, deps)

//   return disposable
// }

// const useMicrophonePermissions = () => {
//   const [state, setState] = useState<PermissionState>()

//   useEffect(() => {
//     queryPermissionState('microphone').then(setState)
//   }, [])

//   const acquire = async () => {
//     try {
//       await navigator.mediaDevices.getUserMedia({audio: true})
//       setState('granted')
//     } catch (error) {
//       console.error(error)
//       setState('denied')
//     }
//   }

//   return [state, acquire] as const
// }

// const getInputStream = () => {
//   return navigator.mediaDevices.getUserMedia({audio: true})
// }

// const qcl = new QlcClient('ws://127.0.0.1:9999/qlcplusWS')

// export const App = () => {
//   // const [state, acquire] = useMicrophonePermissions()
//   const [deviceInfo, setDeviceInfo] = useState<MediaDeviceInfo>()

//   const qclStatus = qcl.statusSignal.value

//   return (
//     <div class="app" style={{display: 'flex', flexDirection: 'column', gap: 8}}>
//       {qclStatus.type === 'closed' ? (
//         <>
//           <Button onClick={qcl.connect}>Connect</Button>
//           {qclStatus.reason ? <div>{qclStatus.reason}</div> : null}
//         </>
//       ) : null}
//       {qclStatus.type === 'open' ? <Button onClick={qcl.disconnect}>Disconnect</Button> : null}
//       {qclStatus.type === 'connecting' ? <Button disabled>Connecting</Button> : null}
//       {qclStatus.type === 'closing' ? <Button disabled>Disconnecting</Button> : null}

//       {/* {state === undefined ? '...' : null}
//       {state === 'denied' ? 'Permission denied' : null}
//       {state === 'prompt' ? <Button onClick={acquire}>Grant permissions</Button> : null}
//       {state === 'granted' ? <AudioInputDeviceList onClick={setDeviceInfo} /> : null} */}
//       <AudioAnalyzer deviceInfo={deviceInfo} />
//       <Monaco value="// hello" language="typescript" />
//       <Button onClick={openViewerWindow}>Open viewer</Button>
//     </div>
//   )
// }

// const openViewerWindow = () => {
//   const viewerWindow = window.open(
//     `${window.location.origin}/viewer`,
//     'hydra-viewer',
//     stringifyWindowFeatures({
//       width: 800,
//       height: 600,
//       menubar: false,
//       toolbar: false,
//       location: false,
//       status: false,
//       resizable: true,
//       scrollbars: true,
//       popup: true,
//     }),
//   )

//   if (!viewerWindow) {
//     return
//   }

//   viewerWindow.addEventListener(
//     'load',
//     () => {
//       viewerWindow.postMessage({type: 'eval', code: snippet1})
//     },
//     {once: true},
//   )

//   // viewerWindow.addEventListener('unload', (event) => {
//   //   console.log('unloaded', event)
//   // })
// }

// type WindowFeatures = {
//   width?: number
//   height?: number
//   top?: number
//   left?: number
//   menubar?: boolean
//   toolbar?: boolean
//   location?: boolean
//   status?: boolean
//   resizable?: boolean
//   scrollbars?: boolean
//   popup?: boolean
// }

// const stringifyWindowFeatures = (features: WindowFeatures) =>
//   Object.entries(features)
//     .filter(([, value]) => value !== undefined)
//     .map(([key, value]) => `${key}=${value}`)
//     .join(',')

// const snippet1 = `
// // licensed with CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
// // by Zach Krall
// // http://zachkrall.online/

// osc(10, 0.9, 300)
// .color(0.9, 0.7, 0.8)
// .diff(
//   osc(45, 0.3, 100)
//   .color(0.9, 0.9, 0.9)
//   .rotate(0.18)
//   .pixelate(12)
//   .kaleid()
// )
// .scrollX(10)
// .colorama()
// .luma()
// .repeatX(4)
// .repeatY(4)
// .modulate(
//   osc(1, -0.9, 300)
// )
// .scale(2)
// .out()
// `
