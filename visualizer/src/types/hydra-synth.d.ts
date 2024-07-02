declare module 'hydra-synth' {
  export type HydraOptions = {
    /** Canvas element to render to. If none is supplied, a canvas will be created and appended to the screen */
    canvas?: HTMLCanvasElement | null

    /** defaults to canvas width when included, 1280 if not */
    width?: number

    /** defaults to canvas height when included, 720 if not */
    height?: number

    /** if true, will automatically loop using requestAnimationFrame.If set to false, you must implement your own loop function using the tick() method (below) */
    autoLoop?: boolean

    /** if false, will not pollute global namespace (note: there are currently bugs with this) */
    makeGlobal?: boolean

    /** recommend setting this to false to avoid asking for microphone */
    detectAudio?: boolean

    /** number of source buffers to create initially */
    numSources?: number

    /** number of output buffers to use. Note: untested with numbers other than 4. render() method might behave unpredictably */
    numOutputs?: number

    // /**An array of transforms to be added to the synth, or an object representing a single transform */
    // extendTransforms?: []

    /** force precision of shaders, can be 'highp', 'mediump', or 'lowp' (recommended for ios). When no precision is specified, will use highp for ios, and mediump for everything else. */
    precision?: 'highp' | 'mediump' | 'lowp'
  }

  export default class Hydra {
    constructor(options: HydraOptions)

    tick(dt: number): void

    synth: any
  }
}
