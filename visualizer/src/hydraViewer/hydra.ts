import Hydra from 'hydra-synth'

export const createHydra = (canvas: HTMLCanvasElement) => {
  const hydra = new Hydra({
    canvas,
    autoLoop: true,
    makeGlobal: false,
    detectAudio: true,
  })

  const evalCode = (code: string) => {
    try {
      new Function(
        `{${Object.keys(hydra.synth).join(',')}}`, // destructuring the synth object
        code,
      )(hydra.synth)
    } catch (error) {
      console.error(error)
    }
  }

  return {hydra, evalCode}
}
