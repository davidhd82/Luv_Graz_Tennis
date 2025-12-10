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

export default function Settings() {
    const [user, setUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<Partial<User>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
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
            setFormData(userData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            //const response = await fetch('http://localhost:8080/api/user/update', {
            const response = await fetch('https://kainhaus.uber.space/api/user/update', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Fehler beim Aktualisieren der Benutzerdaten');
            }

            const updatedUser = await response.json();
            setUser(updatedUser);
            setSuccess('Profil erfolgreich aktualisiert!');

            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const userObj = JSON.parse(storedUser);
                userObj.firstName = updatedUser.firstName;
                userObj.lastName = updatedUser.lastName;
                localStorage.setItem('user', JSON.stringify(userObj));
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="profile-container">
                <div className="loading">Lädt...</div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <button className="back-btn" onClick={() => navigate('/profile')}>
                    ← Zurück
                </button>
                <h1>Profil bearbeiten</h1>
            </div>

            <form className="profile-card" onSubmit={handleSubmit}>
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <div className="profile-section">
                    <h3>Persönliche Informationen</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Anrede:</label>
                            <select
                                name="salutation"
                                value={formData.salutation || ''}
                                onChange={handleChange}
                            >
                                <option value="">Bitte wählen</option>
                                <option value="Herr">Herr</option>
                                <option value="Frau">Frau</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Titel:</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title || ''}
                                onChange={handleChange}
                                placeholder="Optional"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Vorname:*</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName || ''}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Nachname:*</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName || ''}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="profile-section">
                    <h3>Kontaktinformationen</h3>
                    <div className="form-group">
                        <label>E-Mail:*</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email || ''}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Mobiltelefon:</label>
                        <input
                            type="tel"
                            name="mobile"
                            value={formData.mobile || ''}
                            onChange={handleChange}
                            placeholder="+43 ..."
                        />
                    </div>
                </div>

                <div className="profile-section">
                    <h3>Adresse</h3>
                    <div className="form-group">
                        <label>Straße und Hausnummer:</label>
                        <input
                            type="text"
                            name="street"
                            value={formData.street || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Postleitzahl:</label>
                            <input
                                type="text"
                                name="postalCode"
                                value={formData.postalCode || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Stadt:</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city || ''}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="profile-actions">
                    <button type="button" className="cancel-btn" onClick={() => navigate('/profile')}>
                        Abbrechen
                    </button>
                    <button type="submit" className="save-btn" disabled={saving}>
                        {saving ? 'Speichert...' : 'Änderungen speichern'}
                    </button>
                </div>
            </form>
        </div>
    );
}