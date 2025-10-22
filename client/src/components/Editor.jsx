import { SandpackLayout, SandpackCodeEditor, SandpackPreview, useSandpack } from "@codesandbox/sandpack-react";
import { useEffect, useRef, useCallback, useState } from "react";
import { debounce } from "lodash";

export default function Editor({ onFilesChange }) {
  const { sandpack } = useSandpack();
  const prevFilesRef = useRef(sandpack.files);
  const [editorSettings, setEditorSettings] = useState({
    fontSize: 14,
    tabSize: 2,
    wordWrap: 'on',
    minimap: true,
    lineNumbers: 'on',
    folding: true,
    bracketPairColorization: true,
    autoClosingBrackets: 'always',
    autoClosingQuotes: 'always',
    formatOnPaste: true,
    formatOnType: true,
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnEnter: 'on',
    quickSuggestions: true,
    parameterHints: { enabled: true },
    hover: { enabled: true },
    lightbulb: { enabled: true }
  });

  const debouncedOnChange = useCallback(
    debounce((files) => {
      prevFilesRef.current = files;
      onFilesChange?.(files);
    }, 1300),
    [onFilesChange]
  );

  useEffect(() => {
    const currentFiles = sandpack.files;
    let hasChanged = false;
    for (let key in currentFiles) {
      if (!prevFilesRef.current[key] || prevFilesRef.current[key].code !== currentFiles[key].code) {
        hasChanged = true;
        break;
      }
    }
    if (hasChanged) {
      debouncedOnChange(currentFiles);
    }
  }, [sandpack.files, debouncedOnChange]);

  const handleEditorSettingsChange = (newSettings) => {
    setEditorSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <div className="editor-wrapper">
      <div className="editor-toolbar">
        <div className="editor-controls">
          <button 
            className="toolbar-btn"
            onClick={() => handleEditorSettingsChange({ fontSize: editorSettings.fontSize + 1 })}
            title="Increase font size"
          >
            A+
          </button>
          <button 
            className="toolbar-btn"
            onClick={() => handleEditorSettingsChange({ fontSize: Math.max(10, editorSettings.fontSize - 1) })}
            title="Decrease font size"
          >
            A-
          </button>
          <button 
            className={`toolbar-btn ${editorSettings.wordWrap === 'on' ? 'active' : ''}`}
            onClick={() => handleEditorSettingsChange({ wordWrap: editorSettings.wordWrap === 'on' ? 'off' : 'on' })}
            title="Toggle word wrap"
          >
            ⇄
          </button>
          <button 
            className={`toolbar-btn ${editorSettings.minimap ? 'active' : ''}`}
            onClick={() => handleEditorSettingsChange({ minimap: !editorSettings.minimap })}
            title="Toggle minimap"
          >
            🗺️
          </button>
          <button 
            className="toolbar-btn"
            onClick={() => {
              const currentCode = sandpack.files[sandpack.activeFile]?.code || '';
              navigator.clipboard.writeText(currentCode);
            }}
            title="Copy current file"
          >
            📋
          </button>
        </div>
        <div className="editor-info">
          <span className="file-info">
            📄 {sandpack.activeFile?.split('/').pop() || 'No file'}
          </span>
          <span className="line-info">
            Line {sandpack.activeFile ? '1' : '0'} of {sandpack.activeFile ? '1' : '0'}
          </span>
        </div>
      </div>
      
      <SandpackLayout className="editor-sandpack">
        <SandpackCodeEditor
          showLineNumbers={editorSettings.lineNumbers === 'on'}
          showInlineErrors
          wrapContent={editorSettings.wordWrap === 'on'}
          closableTabs
          style={{
            minHeight: '100%',
            maxHeight: '100%',
            overflow: 'auto',
            fontSize: `${editorSettings.fontSize}px`,
          }}
          initMode="lazy"
          extensions={[]}
        />
        <SandpackPreview 
          style={{
            minHeight: '100%',
            maxHeight: '100%',
            overflow: 'auto',
          }}
          showNavigator={false}
          showRefreshButton={true}
          showOpenInCodeSandbox={false}
        />
      </SandpackLayout>
    </div>
  );
}
