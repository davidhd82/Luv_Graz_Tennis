import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Auth.css';
import { API_BASE_URL } from '../api';

interface LoginProps {
    onAuthSuccess: (token: string, user: any) => void;
}

export default function Login({ onAuthSuccess }: LoginProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, rememberMe }),
            });

            if (!response.ok) {
                throw new Error('Login fehlgeschlagen');
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);
            if (data.tokenExpiry) {
                localStorage.setItem('tokenExpiry', String(data.tokenExpiry));
            }

            const userData = {
                userId: data.userId || data.id,
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                isAdmin: data.isAdmin || data.admin || false
            };

            localStorage.setItem('user', JSON.stringify(userData));
            onAuthSuccess(data.token, userData);
            navigate('/');
        } catch (err) {
            setError('Ungültige E-Mail-Adresse oder Passwort.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <button className="auth-back-btn" onClick={() => navigate(-1)}>← Zurück</button>
            <div className="auth-container">
                <div className="auth-logo">
                    <span className="auth-logo-title">TC LUV Graz</span>
                </div>

                <div className="auth-card">
                    <h2>Anmelden</h2>
                    <p className="auth-subtitle">Willkommen zurück</p>

                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label htmlFor="email">E-Mail</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ihre@email.at"
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Passwort</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Passwort eingeben"
                                required
                                autoComplete="current-password"
                            />
                            <span
                                className="forgot-password-link"
                                onClick={() => navigate('/forgot-password')}
                            >
                                Passwort vergessen?
                            </span>
                        </div>

                        <div className="remember-me-group">
                            <label className="remember-me-label">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="remember-me-checkbox"
                                />
                                <span>Angemeldet bleiben (24 Stunden)</span>
                            </label>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <button type="submit" className="auth-btn-primary" disabled={loading}>
                            {loading ? 'Lädt…' : 'Anmelden'}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Noch kein Konto?{' '}
                        <span className="auth-link" onClick={() => navigate('/register')}>
                            Registrieren
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}
