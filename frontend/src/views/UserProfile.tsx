import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/UserProfile.css';

interface UserProfileProps {
    user: any;
    onLogout: () => void;
}

export default function UserProfile({ user, onLogout }: UserProfileProps) {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        onLogout();
        setIsOpen(false);
        navigate('/');
    };

    return (
        <div className="user-profile">
            <div className="user-menu" onClick={() => setIsOpen(!isOpen)}>
        <span className="user-greeting">
          Hallo, {user.firstName}!
        </span>
                <span className="dropdown-arrow">▼</span>
            </div>

            {isOpen && (
                <div className="dropdown-menu">
                    <div className="user-info">
                        <strong>{user.firstName} {user.lastName}</strong>
                        <br />
                        {user.email}
                    </div>
                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                    >
                        Abmelden
                    </button>
                </div>
            )}
        </div>
    );
}