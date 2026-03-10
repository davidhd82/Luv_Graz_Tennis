import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/Auth.css';
import { API_BASE_URL } from '../api';

interface VerificationState {
    email: string;
    firstName?: string;
    lastName?: string;
}

interface CheckVerificationResponse {
    enabled: boolean;
    email: string;
    firstName: string;
}

interface ResendVerificationResponse {
    message: string;
}

export default function EmailVerificationPending() {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [checking, setChecking] = useState(false);
    const [resending, setResending] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const state = location.state as VerificationState;
        const storedEmail = localStorage.getItem('pendingVerificationEmail');

        if (state?.email) {
            setEmail(state.email);
            setFirstName(state.firstName || '');
            localStorage.setItem('pendingVerificationEmail', state.email);
        } else if (storedEmail) {
            setEmail(storedEmail);
        } else {
            navigate('/register');
        }
    }, [location, navigate]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [countdown]);

    const handleResendVerification = async () => {
        if (!canResend) return;

        setResending(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data: ResendVerificationResponse = await response.json();

            if (response.ok) {
                setCountdown(60);
                setCanResend(false);
                alert(data.message || 'Verifizierungs-Email wurde erneut gesendet!');
            } else {
                alert(data.message || 'Fehler beim Senden der Verifizierungs-Email.');
            }
        } catch (error) {
            console.error('Error resending verification:', error);
            alert('Ein Fehler ist aufgetreten.');
        } finally {
            setResending(false);
        }
    };

    const handleCheckVerification = async () => {
        setChecking(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/check-verification?email=${encodeURIComponent(email)}`);

            if (response.ok) {
                const userData: CheckVerificationResponse = await response.json();
                if (userData.enabled) {
                    localStorage.removeItem('pendingVerificationEmail');
                    navigate('/login', {
                        state: {
                            message: 'Email erfolgreich verifiziert! Sie können sich jetzt anmelden.',
                            email: email
                        }
                    });
                } else {
                    alert('Email wurde noch nicht verifiziert. Bitte überprüfen Sie Ihr E-Mail-Postfach.');
                }
            } else if (response.status === 404) {
                alert('Benutzer nicht gefunden. Bitte registrieren Sie sich erneut.');
                navigate('/register');
            } else {
                alert('Fehler beim Überprüfen der Verifizierung.');
            }
        } catch (error) {
            console.error('Error checking verification:', error);
            alert('Verbindungsfehler. Bitte überprüfen Sie Ihre Internetverbindung.');
        } finally {
            setChecking(false);
        }
    };

    return (
        <div className="verification-container" style={{ position: 'relative' }}>
            <button className="auth-back-btn" onClick={() => navigate(-1)}>← Zurück</button>
            <div className="verification-card">
                <div className="verification-icon">📧</div>

                <h1>Bestätigen Sie Ihre E-Mail</h1>

                <div className="verification-message">
                    <p>Hallo {firstName ? firstName : 'there'},</p>
                    <p>Wir haben eine Bestätigungs-E-Mail an <strong>{email}</strong> gesendet.</p>
                    <p>Bitte klicken Sie auf den Link in der E-Mail, um Ihr Konto zu aktivieren.</p>
                </div>

                <div className="verification-actions">
                    <button
                        onClick={handleCheckVerification}
                        disabled={checking}
                        className="check-button"
                    >
                        {checking ? 'Überprüfe...' : 'Bestätigung überprüfen'}
                    </button>

                    <button
                        onClick={handleResendVerification}
                        disabled={!canResend || resending}
                        className={`resend-button ${!canResend ? 'disabled' : ''}`}
                    >
                        {resending ? 'Sendet...' :
                            canResend ? 'Email erneut senden' : `Erneut senden (${countdown}s)`}
                    </button>
                </div>

                <div className="verification-help">
                    <h3>Hilfe benötigt?</h3>
                    <ul>
                        <li>Überprüfen Sie Ihren Spam-Ordner</li>
                        <li>Stellen Sie sicher, dass die E-Mail-Adresse korrekt ist: {email}</li>
                    </ul>
                </div>

                <div className="verification-footer">
                    <button
                        onClick={() => navigate('/login')}
                        className="back-to-login"
                    >
                        Zurück zur Anmeldung
                    </button>
                </div>
            </div>
        </div>
    );
}