import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function UserProfile() {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  if (!user) return null;

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="user-profile">
      <button 
        className="user-avatar"
        onClick={() => setShowDropdown(!showDropdown)}
        title={user.name}
      >
        <span className="avatar-text">{getInitials(user.name)}</span>
      </button>

      {showDropdown && (
        <div className="user-dropdown">
          <div className="user-info">
            <div className="user-avatar-large">
              <span className="avatar-text-large">{getInitials(user.name)}</span>
            </div>
            <div className="user-details">
              <h3>{user.name}</h3>
              <p>{user.email}</p>
            </div>
          </div>
          
          <div className="user-actions">
            <button className="dropdown-item">
              <span className="action-icon">👤</span>
              Profile Settings
            </button>
            <button className="dropdown-item">
              <span className="action-icon">⚙️</span>
              Preferences
            </button>
            <button className="dropdown-item">
              <span className="action-icon">📊</span>
              My Projects
            </button>
            <div className="dropdown-divider"></div>
            <button 
              className="dropdown-item logout"
              onClick={logout}
            >
              <span className="action-icon">🚪</span>
              Sign Out
            </button>
          </div>
        </div>
      )}

      {showDropdown && (
        <div 
          className="dropdown-overlay"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}
