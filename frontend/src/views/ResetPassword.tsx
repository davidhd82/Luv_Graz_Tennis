import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../css/Auth.css';
import { API_BASE_URL } from '../api';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setError('Ungültiger Reset-Link. Bitte fordern Sie einen neuen an.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!token) {
            setError('Ungültiger Reset-Link.');
            return;
        }

        if (newPassword.length < 8) {
            setError('Das Passwort muss mindestens 8 Zeichen lang sein.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwörter stimmen nicht überein.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, newPassword }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || 'Zurücksetzen fehlgeschlagen. Der Link könnte abgelaufen sein.');
            }

            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Ein Fehler ist aufgetreten. Bitte fordern Sie einen neuen Reset-Link an.');
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
                    {success ? (
                        <>
                            <h2>Passwort geändert</h2>
                            <p className="auth-subtitle">Ihr Passwort wurde erfolgreich zurückgesetzt.</p>
                            <div className="success-message">
                                Sie können sich jetzt mit Ihrem neuen Passwort anmelden.
                            </div>
                            <button
                                className="auth-btn-primary"
                                onClick={() => navigate('/login')}
                                style={{ marginTop: '0.5rem' }}
                            >
                                Zur Anmeldung
                            </button>
                        </>
                    ) : (
                        <>
                            <h2>Neues Passwort</h2>
                            <p className="auth-subtitle">Geben Sie Ihr neues Passwort ein.</p>

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="newPassword">Neues Passwort</label>
                                    <input
                                        id="newPassword"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Mindestens 8 Zeichen"
                                        required
                                        autoComplete="new-password"
                                        disabled={!token}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="confirmPassword">Passwort bestätigen</label>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Passwort wiederholen"
                                        required
                                        autoComplete="new-password"
                                        disabled={!token}
                                    />
                                </div>

                                {error && <div className="error-message">{error}</div>}

                                <button
                                    type="submit"
                                    className="auth-btn-primary"
                                    disabled={loading || !token}
                                >
                                    {loading ? 'Lädt…' : 'Passwort speichern'}
                                </button>
                            </form>

                            <p className="auth-footer">
                                <span className="auth-link" onClick={() => navigate('/forgot-password')}>
                                    Neuen Reset-Link anfordern
                                </span>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
