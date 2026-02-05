import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Profile.css';
import { API_BASE_URL } from '../api';

interface User {
    userId: number; // Geändert von id zu userId
    salutation: string;
    title: string;
    firstName: string;
    lastName: string;
    email: string;
    street: string;
    postalCode: string;
    city: string;
    mobile: string;
    isAdmin: boolean; // Geändert von admin zu isAdmin
    enabled?: boolean; // Optional
    membershipPaid?: boolean; // Optional
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

            const response = await fetch(`${API_BASE_URL}/api/user/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                    return;
                }
                throw new Error('Fehler beim Laden der Benutzerdaten');
            }

            const userData = await response.json();
            console.log('User data from /api/user/me:', userData); // Debug log

            // Stelle sicher, dass die Felder korrekt gemappt werden
            const formattedUser: User = {
                userId: userData.userId || userData.id || 0,
                salutation: userData.salutation || '',
                title: userData.title || '',
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                email: userData.email || '',
                street: userData.street || '',
                postalCode: userData.postalCode || '',
                city: userData.city || '',
                mobile: userData.mobile || '',
                isAdmin: userData.isAdmin || userData.admin || false,
                enabled: userData.enabled,
                membershipPaid: userData.membershipPaid
            };

            setUser(formattedUser);

            // Update localStorage user data
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const userObj = JSON.parse(storedUser);
                userObj.userId = formattedUser.userId;
                userObj.isAdmin = formattedUser.isAdmin;
                localStorage.setItem('user', JSON.stringify(userObj));
            } else {
                // Falls kein user im localStorage existiert, erstelle einen
                localStorage.setItem('user', JSON.stringify({
                    userId: formattedUser.userId,
                    email: formattedUser.email,
                    firstName: formattedUser.firstName,
                    lastName: formattedUser.lastName,
                    isAdmin: formattedUser.isAdmin
                }));
            }
        } catch (err: any) {
            console.error('Error fetching user:', err);
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
            const response = await fetch(`${API_BASE_URL}/api/user/delete`, {
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
                if (response.status === 403) {
                    throw new Error('Keine Berechtigung zum Löschen des Kontos');
                }
                if (response.status === 404) {
                    throw new Error('Konto nicht gefunden');
                }
                throw new Error('Löschen fehlgeschlagen');
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleAdminDashboard = () => {
        if (user?.isAdmin) {
            navigate('/admin');
        }
    };

    const handleMembershipInfo = () => {
        if (user?.membershipPaid === false) {
            alert('Ihr Mitgliedsbeitrag ist noch nicht bezahlt. Bitte wenden Sie sich an den Administrator, um Buchungen vornehmen zu können.');
        } else if (user?.membershipPaid === true) {
            alert('Ihr Mitgliedsbeitrag ist bezahlt. Sie können Tennisplätze buchen!');
        } else {
            alert('Mitgliedsstatus konnte nicht überprüft werden.');
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
                <button className="back-btn" onClick={() => navigate('/')} style={{ marginTop: '20px' }}>
                    ← Zurück zur Startseite
                </button>
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
                        {user?.isAdmin && (
                            <div className="admin-tag">
                                <span className="admin-badge">ADMIN</span>
                            </div>
                        )}
                        {user?.membershipPaid !== undefined && (
                            <div className="membership-tag">
                                <span className={`membership-badge ${user.membershipPaid ? 'paid' : 'not-paid'}`}>
                                    {user.membershipPaid ? 'Mitgliedsbeitrag bezahlt' : 'Mitgliedsbeitrag offen'}
                                </span>
                            </div>
                        )}
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

                <div className="profile-section">
                    <h3>Konto-Status</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Konto aktiv:</label>
                            <span className={`status-badge ${user?.enabled ? 'active' : 'inactive'}`}>
                                {user?.enabled ? 'Aktiv' : 'Inaktiv'}
                            </span>
                        </div>
                        <div className="info-item">
                            <label>Mitgliedsstatus:</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span className={`membership-status-badge ${user?.membershipPaid ? 'paid' : 'not-paid'}`}>
                                    {user?.membershipPaid ? 'Bezahlt' : 'Offen'}
                                </span>
                            </div>
                        </div>
                        {user?.isAdmin && (
                            <div className="info-item">
                                <label>Rolle:</label>
                                <span className="admin-role-badge">Administrator</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="profile-actions">
                    {user?.isAdmin && (
                        <button className="admin-btn" onClick={handleAdminDashboard}>
                            Admin Dashboard
                        </button>
                    )}
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