import { useState } from "react";
import { SandpackProvider } from "@codesandbox/sandpack-react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Editor from "./components/Editor";
import FileExplorer from "./components/FileExplorer";
import AuthModal from "./components/AuthModal";
import UserProfile from "./components/UserProfile";
import { saveProject, loadProject, generateId } from "./services/api";

import "./components/App.css";

function AppContent() {
  const { user, loading } = useAuth();
  
  // Debug log
  console.log('User state:', { user, loading });
  
  const [files, setFiles] = useState({
    active: "/App.js",
    content: {
      "/App.js": `function App() {
  return <h1>Hello CipherStudio! 🎉</h1>;
}
export default App;`,
      "/index.js": `import ReactDOM from 'react-dom/client';
import App from './App';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`,
    },
  });

  const [projectId, setProjectId] = useState(() => {
    const savedId = localStorage.getItem("currentProjectId");
    if (savedId) return savedId;
    const newId = generateId();
    localStorage.setItem("currentProjectId", newId);
    return newId;
  });

  const [theme, setTheme] = useState("dark");
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });
  const [showWelcome, setShowWelcome] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSandpackChange = (newFiles) => {
    setFiles((prev) => ({
      active: prev.active,
      content: newFiles,
    }));
  };

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 3000);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      localStorage.setItem("currentProjectId", projectId);
      const result = await saveProject(projectId, files.content);
      showNotification(`Project saved successfully! ID: ${result.project.projectId.slice(-8)}`, "success");
    } catch (error) {
      showNotification("Failed to save project!", "error");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoad = async () => {
    setIsLoading(true);
    try {
      const loaded = await loadProject(projectId);
      if (loaded) {
        setFiles({ active: Object.keys(loaded)[0], content: loaded });
        showNotification(`Project loaded successfully! ID: ${projectId.slice(-8)}`, "success");
      } else {
        showNotification("No project found with this ID!", "error");
      }
    } catch (error) {
      showNotification("Failed to load project!", "error");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <SandpackProvider
      template="react"
      files={files.content}
      activeFile={files.active}
      customSetup={{ entry: "/index.js" }}
      theme={theme}
      onChange={handleSandpackChange}
    >
      <div className={`app-container ${theme}`}>
        {/* Topbar */}
        <div className="topbar">
          <h1>🧩 CipherStudio</h1>
          <div className="controls">
            <button 
              onClick={handleSave} 
              disabled={isLoading}
              className={isLoading ? 'loading' : ''}
            >
              {isLoading ? '⏳' : '💾'} Save
            </button>
            <button 
              onClick={handleLoad} 
              disabled={isLoading}
              className={isLoading ? 'loading' : ''}
            >
              {isLoading ? '⏳' : '📂'} Load
            </button>
            <button onClick={toggleTheme}>
              {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
            </button>
            {loading ? (
              <div className="auth-loading">⏳</div>
            ) : user ? (
              <UserProfile />
            ) : (
              <button 
                className="auth-btn"
                onClick={() => {
                  console.log('Sign in clicked');
                  setShowAuthModal(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                🔐 Sign In
              </button>
            )}
            <span className="project-id">ID: {projectId.slice(-8)}</span>
          </div>
        </div>

        {/* Workspace: File Explorer Left, Editor Right */}
        <div className="workspace">
          <FileExplorer
            files={files.content}
            activeFile={files.active}
            onFilesChange={handleSandpackChange}
            theme={theme}
          />
          <Editor
            files={files.content}
            activeFile={files.active}
            onFilesChange={handleSandpackChange}
          />
        </div>

        {/* Welcome Screen */}
        {showWelcome && (
          <div className="welcome-overlay" onClick={() => setShowWelcome(false)}>
            <div className="welcome-content" onClick={(e) => e.stopPropagation()}>
              <div className="welcome-header">
                <h2>🎉 Welcome to CipherStudio!</h2>
                <button 
                  className="welcome-close"
                  onClick={() => setShowWelcome(false)}
                >
                  ✕
                </button>
              </div>
              <div className="welcome-features">
                <div className="feature-item">
                  <span className="feature-icon">📁</span>
                  <div>
                    <h3>File Management</h3>
                    <p>Create, delete, and organize your project files with ease</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">⚡</span>
                  <div>
                    <h3>Rich Code Editor</h3>
                    <p>Advanced syntax highlighting and intelligent code completion</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🎨</span>
                  <div>
                    <h3>Modern UI</h3>
                    <p>Beautiful, responsive interface with dark/light themes</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">💾</span>
                  <div>
                    <h3>Auto-Save</h3>
                    <p>Your work is automatically saved and synced</p>
                  </div>
                </div>
              </div>
              <div className="welcome-actions">
                <button 
                  className="welcome-btn primary"
                  onClick={() => setShowWelcome(false)}
                >
                  Get Started
                </button>
                <button 
                  className="welcome-btn secondary"
                  onClick={() => setShowWelcome(false)}
                >
                  Skip Tour
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Authentication Modal */}
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />

        {/* Notification */}
        {notification.show && (
          <div className={`notification ${notification.type}`}>
            <span className="notification-icon">
              {notification.type === 'success' ? '✅' : '❌'}
            </span>
            <span className="notification-message">{notification.message}</span>
            <button 
              className="notification-close"
              onClick={() => setNotification({ show: false, message: "", type: "success" })}
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </SandpackProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
