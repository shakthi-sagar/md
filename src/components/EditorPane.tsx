import { useRef, useCallback } from 'react'
import Editor, { OnMount } from '@monaco-editor/react'
import type * as MonacoType from 'monaco-editor'

interface EditorPaneProps {
  content: string
  onChange: (value: string) => void
  onEditorMount: (editor: MonacoType.editor.IStandaloneCodeEditor) => void
}

export default function EditorPane({ content, onChange, onEditorMount }: EditorPaneProps) {
  const editorRef = useRef<MonacoType.editor.IStandaloneCodeEditor | null>(null)

  const handleMount: OnMount = useCallback(
    (editor) => {
      editorRef.current = editor
      onEditorMount(editor)
    },
    [onEditorMount],
  )

  const handleChange = useCallback(
    (value: string | undefined) => {
      onChange(value ?? '')
    },
    [onChange],
  )

  return (
    <div className="h-full">
      <Editor
        defaultValue={content}
        language="markdown"
        theme="vs"
        onChange={handleChange}
        onMount={handleMount}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
          },
          wordWrap: 'on',
          hover: { enabled: false },
          quickSuggestions: false,
          suggestOnTriggerCharacters: false,
          folding: false,
        }}
      />
    </div>
  )
}
