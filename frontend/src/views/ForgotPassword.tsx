import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Auth.css';
import { API_BASE_URL } from '../api';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                throw new Error('Anfrage fehlgeschlagen');
            }

            setSubmitted(true);
        } catch (err) {
            setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
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
                    {submitted ? (
                        <>
                            <h2>E-Mail gesendet</h2>
                            <p className="auth-subtitle">Prüfen Sie Ihr Postfach</p>
                            <div className="success-message">
                                Falls ein Konto mit der E-Mail <strong>{email}</strong> existiert, erhalten Sie in Kürze einen Link zum Zurücksetzen Ihres Passworts. Der Link ist 1 Stunde gültig.
                            </div>
                            <button
                                className="auth-btn-primary"
                                onClick={() => navigate('/login')}
                                style={{ marginTop: '0.5rem' }}
                            >
                                Zurück zur Anmeldung
                            </button>
                        </>
                    ) : (
                        <>
                            <h2>Passwort zurücksetzen</h2>
                            <p className="auth-subtitle">
                                Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Reset-Link.
                            </p>

                            <form onSubmit={handleSubmit}>
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

                                {error && <div className="error-message">{error}</div>}

                                <button type="submit" className="auth-btn-primary" disabled={loading}>
                                    {loading ? 'Sendet…' : 'Reset-Link senden'}
                                </button>
                            </form>

                            <p className="auth-footer">
                                <span className="auth-link" onClick={() => navigate('/login')}>
                                    ← Zurück zur Anmeldung
                                </span>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
