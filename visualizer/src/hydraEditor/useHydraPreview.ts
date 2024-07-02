import {useCallback, useEffect, useState} from 'preact/hooks'

type HydraWindowState =
  | {type: 'closed'; reason?: 'blocked'} //
  | {type: 'loading'; window: Window}
  | {type: 'open'; window: Window}

export const useHydraPreview = () => {
  const [code, setCode] = useState<string | undefined>()
  const [state, setState] = useState<HydraWindowState>({type: 'closed'})

  useEffect(() => {
    if (state.type === 'open' && code !== undefined) {
      state.window.postMessage({type: 'eval', code})
    }
  }, [code, state])

  const evalCode = useCallback(
    (code: string) => {
      setCode(code)

      if (state.type !== 'closed') {
        return
      }

      const hydraWindow = openHydraWindow()

      if (hydraWindow) {
        setState({type: 'loading', window: hydraWindow})
        hydraWindow.addEventListener('load', () => setState({type: 'open', window: hydraWindow}), {once: true})
        hydraWindow.addEventListener('unload', () => setState({type: 'closed'}))
      } else {
        setState({type: 'closed', reason: 'blocked'})
      }
    },
    [state],
  )

  return evalCode
}

const openHydraWindow = () =>
  window.open(`${window.location.origin}/viewer`, '_blank', 'popup=true,width=800,height=600')
