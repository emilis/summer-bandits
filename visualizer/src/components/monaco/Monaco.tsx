import * as monaco from 'monaco-editor'
import {useCallback, useEffect, useRef} from 'preact/hooks'

import './workers'
import customTheme from './theme.json'
import classes from './Monaco.module.css'

monaco.editor.defineTheme('custom-theme', customTheme as monaco.editor.IStandaloneThemeData)

export type Monaco = {
  props: {
    value: string
    language: string
    typedefs?: string
    onChange?: (value: string) => void
  }
}

export const Monaco = ({value, language, typedefs, onChange}: Monaco['props']) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const modelRef = useRef<monaco.editor.ITextModel | null>(null)

  const editorElementRef = useCallback((element: HTMLDivElement | null) => {
    if (!element) {
      editorRef.current?.dispose()
      return
    }

    editorRef.current = monaco.editor.create(element, {
      theme: 'custom-theme',
      tabSize: 2,
      minimap: {enabled: false},
      automaticLayout: true,
    })
  }, [])

  useEffect(() => {
    if (!editorRef.current) {
      return
    }

    const model = monaco.editor.createModel('', language)
    editorRef.current.setModel(model)
    modelRef.current = model

    return () => {
      model.dispose()
    }
  }, [language])

  useEffect(() => {
    if (value === modelRef.current?.getValue()) {
      return
    }

    modelRef.current?.setValue(value)
  }, [value, language])

  useEffect(() => {
    const disposable = editorRef.current?.onDidChangeModelContent(() => {
      onChange?.(editorRef.current?.getValue() ?? '')
    })

    return () => {
      disposable?.dispose()
    }
  }, [onChange])

  useEffect(() => {
    if (!typedefs) {
      return
    }

    const disposable = monaco.languages.typescript.typescriptDefaults.addExtraLib(typedefs)

    return () => {
      disposable.dispose()
    }
  }, [typedefs])

  return (
    <div className={classes.monaco}>
      <div ref={editorElementRef} style={{height: 300}} />
    </div>
  )
}
