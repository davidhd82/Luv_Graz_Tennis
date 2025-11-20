import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Auth.css';

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
            setError('Passwörter stimmen nicht überein');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/auth/register', {
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

            // Erfolgreiche Registrierung - zur Verifizierungsseite navigieren
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
        <div className="auth-container">
            <div className="auth-form">
                <h2>Registrieren</h2>
                <form onSubmit={handleRegister}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Anrede:</label>
                            <select
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
                            <label>Titel:</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
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
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Nachname:*</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>E-Mail:*</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Passwort:*</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Passwort bestätigen:*</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Straße und Hausnummer:</label>
                        <input
                            type="text"
                            name="street"
                            value={formData.street}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Postleitzahl:</label>
                            <input
                                type="text"
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Stadt:</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Mobiltelefon:</label>
                        <input
                            type="tel"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            placeholder="+43 ..."
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="verification-notice">
                        <p>Nach der Registrierung erhalten Sie eine E-Mail zur Bestätigung Ihres Kontos.</p>
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? 'Lädt...' : 'Registrieren'}
                    </button>
                </form>
                <p>
                    Bereits ein Konto?{' '}
                    <span className="auth-link" onClick={() => navigate('/login')}>
                        Anmelden
                    </span>
                </p>
            </div>
        </div>
    );
}