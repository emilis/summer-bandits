type WorkerModule = typeof import('*?worker')

const construct = (module: WorkerModule) => new module.default()

self.MonacoEnvironment = {
  async getWorker(_workerId, label) {
    switch (label) {
      case 'editorWorkerService':
        return construct(await import('monaco-editor/esm/vs/editor/editor.worker?worker'))

      case 'json':
        return construct(await import('monaco-editor/esm/vs/language/json/json.worker?worker'))

      case 'css':
        return construct(await import('monaco-editor/esm/vs/language/css/css.worker?worker'))

      case 'html':
        return construct(await import('monaco-editor/esm/vs/language/html/html.worker?worker'))

      case 'typescript':
      case 'javascript':
        return construct(await import('monaco-editor/esm/vs/language/typescript/ts.worker?worker'))

      default:
        throw new Error(`Unknown worker label: ${label}`)
    }
  },
}
