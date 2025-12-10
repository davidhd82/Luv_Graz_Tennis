import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Profile.css';

interface User {
    id: string;
    salutation: string;
    title: string;
    firstName: string;
    lastName: string;
    email: string;
    street: string;
    postalCode: string;
    city: string;
    mobile: string;
}

export default function Profile() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }


            //const response = await fetch('http://localhost:8080/api/user/me', {
            const response = await fetch('https://kainhaus.uber.space/api/user/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Fehler beim Laden der Benutzerdaten');
            }

            const userData = await response.json();
            setUser(userData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        navigate('/settings');
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Möchten Sie Ihr Konto wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            //const response = await fetch('http://localhost:8080/api/user/delete', {
            const response = await fetch('https://kainhaus.uber.space/api/user/delete', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                alert('Ihr Konto wurde erfolgreich gelöscht.');
                navigate('/');
                window.location.reload();
            } else {
                throw new Error('Löschen fehlgeschlagen');
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <div className="profile-container">
                <div className="loading">Lädt...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-container">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <button className="back-btn" onClick={() => navigate('/')}>
                    ← Zurück
                </button>
                <h1>Mein Profil</h1>
            </div>

            <div className="profile-card">
                <div className="profile-header-section">
                    <div className="profile-avatar">
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </div>
                    <div className="profile-name">
                        <h2>{user?.salutation} {user?.title} {user?.firstName} {user?.lastName}</h2>
                        <p>{user?.email}</p>
                    </div>
                </div>

                <div className="profile-section">
                    <h3>Persönliche Informationen</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Anrede:</label>
                            <span>{user?.salutation || 'Nicht angegeben'}</span>
                        </div>
                        <div className="info-item">
                            <label>Titel:</label>
                            <span>{user?.title || 'Kein Titel'}</span>
                        </div>
                        <div className="info-item">
                            <label>Vorname:</label>
                            <span>{user?.firstName}</span>
                        </div>
                        <div className="info-item">
                            <label>Nachname:</label>
                            <span>{user?.lastName}</span>
                        </div>
                    </div>
                </div>

                <div className="profile-section">
                    <h3>Kontaktinformationen</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>E-Mail:</label>
                            <span>{user?.email}</span>
                        </div>
                        <div className="info-item">
                            <label>Mobiltelefon:</label>
                            <span>{user?.mobile || 'Nicht angegeben'}</span>
                        </div>
                    </div>
                </div>

                <div className="profile-section">
                    <h3>Adresse</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Straße:</label>
                            <span>{user?.street || 'Nicht angegeben'}</span>
                        </div>
                        <div className="info-item">
                            <label>Postleitzahl:</label>
                            <span>{user?.postalCode || 'Nicht angegeben'}</span>
                        </div>
                        <div className="info-item">
                            <label>Stadt:</label>
                            <span>{user?.city || 'Nicht angegeben'}</span>
                        </div>
                    </div>
                </div>

                <div className="profile-actions">
                    <button className="edit-btn" onClick={handleEdit}>
                        Profil bearbeiten
                    </button>
                    <button className="delete-btn" onClick={handleDeleteAccount}>
                        Konto löschen
                    </button>
                </div>
            </div>
        </div>
    );
}