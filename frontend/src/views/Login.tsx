import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Auth.css';

interface LoginProps {
    onAuthSuccess: (token: string, user: any) => void;
}

export default function Login({ onAuthSuccess }: LoginProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            //const response = await fetch('http://localhost:8080/api/auth/login', {
            const response = await fetch('https://kainhaus.uber.space/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error('Login fehlgeschlagen');
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName
            }));

            onAuthSuccess(data.token, data);
            navigate('/');
        } catch (err) {
            setError('Ungültige Anmeldedaten');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form">
                <h2>Anmelden</h2>
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>E-Mail:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Passwort:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <button type="submit" disabled={loading}>
                        {loading ? 'Lädt...' : 'Anmelden'}
                    </button>
                </form>
                <p>
                    Noch kein Konto?{' '}
                    <span className="auth-link" onClick={() => navigate('/register')}>
            Registrieren
          </span>
                </p>
            </div>
        </div>
    );
}