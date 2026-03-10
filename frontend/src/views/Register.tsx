import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Auth.css';
import { API_BASE_URL } from '../api';

interface RegisterProps {
    onAuthSuccess: (token: string, user: any) => void;
}

export default function Register({ onAuthSuccess }: RegisterProps) {
    const [formData, setFormData] = useState({
        salutation: '',
        title: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        street: '',
        postalCode: '',
        city: '',
        mobile: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwörter stimmen nicht überein.');
            setLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            setError('Das Passwort muss mindestens 8 Zeichen lang sein.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    salutation: formData.salutation,
                    title: formData.title,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    password: formData.password,
                    street: formData.street,
                    postalCode: formData.postalCode,
                    city: formData.city,
                    mobile: formData.mobile
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Registrierung fehlgeschlagen');
            }

            localStorage.setItem('pendingVerificationEmail', formData.email);
            navigate('/verify-pending', {
                state: {
                    email: formData.email,
                    firstName: formData.firstName,
                    lastName: formData.lastName
                }
            });

        } catch (err: any) {
            setError(err.message || 'Registrierung fehlgeschlagen');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <button className="auth-back-btn" onClick={() => navigate(-1)}>← Zurück</button>
            <div className="auth-container" style={{ maxWidth: '480px' }}>
                <div className="auth-logo">
                    <span className="auth-logo-title">TC LUV Graz</span>
                </div>

                <div className="auth-card">
                    <h2>Registrieren</h2>
                    <p className="auth-subtitle">Konto erstellen und Plätze buchen</p>

                    <form onSubmit={handleRegister}>
                        <div className="form-group">
                            <label htmlFor="salutation">Anrede</label>
                            <select
                                id="salutation"
                                name="salutation"
                                value={formData.salutation}
                                onChange={handleChange}
                            >
                                <option value="">Bitte wählen</option>
                                <option value="Herr">Herr</option>
                                <option value="Frau">Frau</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="title">Titel</label>
                            <input
                                id="title"
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Optional (z. B. Dr., Mag.)"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="firstName">Vorname *</label>
                            <input
                                id="firstName"
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="Vorname"
                                required
                                autoComplete="given-name"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="lastName">Nachname *</label>
                            <input
                                id="lastName"
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Nachname"
                                required
                                autoComplete="family-name"
                            />
                        </div>

                        <div className="form-divider" />

                        <div className="form-group">
                            <label htmlFor="email">E-Mail *</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="ihre@email.at"
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Passwort *</label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Mindestens 8 Zeichen"
                                required
                                autoComplete="new-password"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Passwort bestätigen *</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Passwort wiederholen"
                                required
                                autoComplete="new-password"
                            />
                        </div>

                        <div className="form-divider" />

                        <div className="form-group">
                            <label htmlFor="street">Straße und Hausnummer</label>
                            <input
                                id="street"
                                type="text"
                                name="street"
                                value={formData.street}
                                onChange={handleChange}
                                placeholder="Musterstraße 12"
                                autoComplete="street-address"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="postalCode">Postleitzahl</label>
                            <input
                                id="postalCode"
                                type="text"
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={handleChange}
                                placeholder="8010"
                                autoComplete="postal-code"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="city">Stadt</label>
                            <input
                                id="city"
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="Graz"
                                autoComplete="address-level2"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="mobile">Mobiltelefon</label>
                            <input
                                id="mobile"
                                type="tel"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                placeholder="+43 664 123 4567"
                                autoComplete="tel"
                            />
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <div className="verification-notice">
                            Nach der Registrierung erhalten Sie eine E-Mail zur Bestätigung Ihres Kontos.
                        </div>

                        <button type="submit" className="auth-btn-primary" disabled={loading}>
                            {loading ? 'Lädt…' : 'Konto erstellen'}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Bereits ein Konto?{' '}
                        <span className="auth-link" onClick={() => navigate('/login')}>
                            Anmelden
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}
