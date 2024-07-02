import {EditorView, highlightSpecialChars, drawSelection, rectangularSelection} from '@codemirror/view'
import {HighlightStyle, syntaxHighlighting} from '@codemirror/language'
import {EditorState} from '@codemirror/state'
import {javascript} from '@codemirror/lang-javascript'
import {oneDark, oneDarkHighlightStyle} from '@codemirror/theme-one-dark'
import {tags as t} from '@lezer/highlight'

// https://github.com/hydra-synth/hydra/blob/main/src/views/cm6-editor/hydra-cm6-theme.js
export const syntaxStyle = HighlightStyle.define([
  {
    tag: t.keyword,
    color: 'white',
  },
  {
    tag: t.name,
    // color: 'pink',
    color: 'white',
  },
  {
    tag: [t.deleted, t.character, t.propertyName, t.macroName],
    color: 'white',
  },
  {
    tag: [t.function(t.variableName), t.labelName],
    color: 'white',
  },
  {
    tag: [t.color, t.constant(t.name), t.standard(t.name)],
    color: '#ff0',
  },
  {
    tag: [t.definition(t.name), t.separator],
    color: 'white',
  },
])

// https://github.com/hydra-synth/hydra/blob/main/src/views/cm6-editor/hydra-cm6-theme.js
export const theme = EditorView.theme({
  '&': {
    width: '100%',
    height: '100%',
    fontSize: '20px',
    fontFamily: `'Roboto Mono', monospace`,
    backgroundColor: 'transparent !important',
    pointerEvents: 'none',
    // color: 'white',
    // mixBlendMode: 'difference',
  },
  '& .cm-content': {
    width: '100%',
    whiteSpace: 'break-spaces',
    padding: '50px',
  },
  '& .cm-editor': {
    backgroundColor: 'transparent',
  },
  '& .cm-scroller': {
    fontFamily: `'Roboto Mono', monospace`,
    overflow: 'hidden',
  },
  '& .cm-focused': {
    background: 'rgba(0, 0, 0, 0.5)',
  },
  '& .cm-line': {
    maxWidth: 'fit-content',
    background: 'rgba(0, 0, 0, 0.5)',
    padding: '0px',
  },
  '& .cm-tooltip.cm-tooltip-autocomplete > ul': {
    minWidth: '80px',
    fontFamily: `'Roboto Mono', monospace`,
  },
  '&.cm-focused': {
    outline: 'none',
  },
  '& .cm-gutters': {
    background: 'none',
  },
  '& .cm-tooltip': {
    background: `rgba(0, 0, 0, 0.5)`,
  },
})

export const createCodePreview = (parent: Element) => {
  const editor = new EditorView({
    extensions: [
      highlightSpecialChars(),
      drawSelection(),
      syntaxHighlighting(syntaxStyle),
      syntaxHighlighting(oneDarkHighlightStyle, {fallback: true}),
      rectangularSelection(),
      oneDark,
      theme,
      EditorState.readOnly.of(true),
      EditorView.editable.of(false),
      javascript(),
    ],
    parent,
  })

  const setCode = (code: string) => {
    editor.dispatch({
      changes: {from: 0, to: editor.state.doc.length, insert: code},
    })
  }

  return {editor, setCode}
}
