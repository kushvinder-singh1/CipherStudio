import { useState, useRef } from "react";
import { useSandpack } from "@codesandbox/sandpack-react";

export default function FileExplorer({ theme, files, activeFile, onFilesChange }) {
  const { sandpack } = useSandpack();
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, file: null });
  const [renamingFile, setRenamingFile] = useState(null);
  const [newFileName, setNewFileName] = useState("");
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [newFileType, setNewFileType] = useState("js");
  const [newFileNameInput, setNewFileNameInput] = useState("");
  const fileInputRef = useRef(null);

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
        return '📄';
      case 'ts':
      case 'tsx':
        return '📘';
      case 'css':
        return '🎨';
      case 'html':
        return '🌐';
      case 'json':
        return '📋';
      case 'md':
        return '📝';
      default:
        return '📄';
    }
  };

  const handleFileClick = (fileName) => {
    sandpack.setActiveFile(fileName);
  };

  const handleContextMenu = (e, fileName) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      file: fileName
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, file: null });
  };

  const handleRename = () => {
    setRenamingFile(contextMenu.file);
    setNewFileName(contextMenu.file.split('/').pop());
    closeContextMenu();
  };

  const handleDelete = () => {
    if (contextMenu.file && Object.keys(files).length > 1) {
      const newFiles = { ...files };
      delete newFiles[contextMenu.file];
      onFilesChange(newFiles);
      
      if (activeFile === contextMenu.file) {
        const remainingFiles = Object.keys(newFiles);
        if (remainingFiles.length > 0) {
          sandpack.setActiveFile(remainingFiles[0]);
        }
      }
    }
    closeContextMenu();
  };

  const handleRenameSubmit = () => {
    if (newFileName && newFileName !== renamingFile.split('/').pop()) {
      const path = renamingFile.substring(0, renamingFile.lastIndexOf('/'));
      const newPath = path ? `${path}/${newFileName}` : `/${newFileName}`;
      
      const newFiles = { ...files };
      newFiles[newPath] = newFiles[renamingFile];
      delete newFiles[renamingFile];
      onFilesChange(newFiles);
      
      if (activeFile === renamingFile) {
        sandpack.setActiveFile(newPath);
      }
    }
    setRenamingFile(null);
    setNewFileName("");
  };

  const handleNewFile = () => {
    setShowNewFileDialog(true);
    setNewFileNameInput("");
  };

  const handleNewFileSubmit = () => {
    if (newFileNameInput.trim()) {
      const fileName = newFileNameInput.includes('.') ? newFileNameInput : `${newFileNameInput}.${newFileType}`;
      const filePath = `/${fileName}`;
      
      const defaultContent = getDefaultContent(fileName, newFileType);
      const newFiles = { ...files, [filePath]: { code: defaultContent } };
      onFilesChange(newFiles);
      sandpack.setActiveFile(filePath);
    }
    setShowNewFileDialog(false);
    setNewFileNameInput("");
  };

  const getDefaultContent = (fileName, type) => {
    switch (type) {
      case 'js':
        return `function ${fileName.split('.')[0]}() {
  return <div>Hello World!</div>;
}

export default ${fileName.split('.')[0]};`;
      case 'jsx':
        return `import React from 'react';

function ${fileName.split('.')[0]}() {
  return (
    <div>
      <h1>Hello World!</h1>
    </div>
  );
}

export default ${fileName.split('.')[0]};`;
      case 'css':
        return `/* ${fileName} */
body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
}`;
      case 'html':
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <h1>Hello World!</h1>
</body>
</html>`;
      case 'json':
        return `{
  "name": "project",
  "version": "1.0.0"
}`;
      default:
        return `// ${fileName}`;
    }
  };

  const fileList = Object.keys(files).sort();

  return (
    <div className="file-explorer" onClick={closeContextMenu}>
      <div className="file-explorer-header">
        <h3>📁 Files</h3>
        <button 
          className="new-file-btn"
          onClick={handleNewFile}
          title="Create new file"
        >
          ➕
        </button>
      </div>
      
      <div className="file-list">
        {fileList.map((fileName) => (
          <div
            key={fileName}
            className={`file-item ${activeFile === fileName ? 'active' : ''}`}
            onClick={() => handleFileClick(fileName)}
            onContextMenu={(e) => handleContextMenu(e, fileName)}
          >
            {renamingFile === fileName ? (
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onBlur={handleRenameSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameSubmit();
                  if (e.key === 'Escape') setRenamingFile(null);
                }}
                autoFocus
                className="rename-input"
              />
            ) : (
              <>
                <span className="file-icon">{getFileIcon(fileName)}</span>
                <span className="file-name">{fileName.split('/').pop()}</span>
              </>
            )}
          </div>
        ))}
      </div>

      {contextMenu.visible && (
        <div
          className="context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={handleRename}>✏️ Rename</button>
          <button onClick={handleDelete} className="danger">
            🗑️ Delete
          </button>
        </div>
      )}

      {showNewFileDialog && (
        <div className="new-file-dialog" onClick={(e) => e.stopPropagation()}>
          <div className="dialog-content">
            <h4>Create New File</h4>
            <div className="form-group">
              <label>File Name:</label>
              <input
                type="text"
                value={newFileNameInput}
                onChange={(e) => setNewFileNameInput(e.target.value)}
                placeholder="Enter file name"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Type:</label>
              <select
                value={newFileType}
                onChange={(e) => setNewFileType(e.target.value)}
              >
                <option value="js">JavaScript</option>
                <option value="jsx">React Component</option>
                <option value="css">CSS</option>
                <option value="html">HTML</option>
                <option value="json">JSON</option>
              </select>
            </div>
            <div className="dialog-actions">
              <button onClick={() => setShowNewFileDialog(false)}>Cancel</button>
              <button onClick={handleNewFileSubmit} className="primary">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}