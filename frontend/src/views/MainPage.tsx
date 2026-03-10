import { useState, useEffect } from 'react';
import '../css/MainPage.css';
import { useNavigate, Outlet } from 'react-router-dom';
import { API_BASE_URL } from '../api';

import UserProfile from './UserProfile';

import tcLuv02 from '../assets/tc_luv02.jpg';
import tcLuv05 from '../assets/tc_luv05-1024x768.jpg';
import tcluv01 from '../assets/tcluv_01-1024x768.jpg';
import tcluv03 from '../assets/tcluv_03.jpg';
import tcluv04 from '../assets/tcluv_04-1024x576.jpg';

interface MainPageProps {
    isLoggedIn: boolean;
    user: any;
    onLogout: () => void;
}

function MainPage({ isLoggedIn, user, onLogout }: MainPageProps) {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [tcLuv02, tcLuv05, tcluv01, tcluv03, tcluv04];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [slides.length]);

    const handleBookingClick = async () => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/user/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const userData = await response.json();

                const isAdmin = userData.isAdmin || userData.admin || false;
                const membershipPaid = userData.membershipPaid || false;

                if (!isAdmin && !membershipPaid) {
                    alert('Ihr Mitgliedsbeitrag ist noch nicht bezahlt. Bitte kontaktieren Sie den Administrator.');
                    return;
                }

                localStorage.setItem('user', JSON.stringify({
                    userId: userData.userId || userData.id,
                    email: userData.email,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    isAdmin: isAdmin,
                    membershipPaid: membershipPaid,
                    maxDailyBookingHours: userData.maxDailyBookingHours || 2
                }));

                navigate('/booking');
            } else {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
            }
        } catch (error) {
            console.error('Fehler beim Prüfen des Benutzerstatus:', error);
            alert('Fehler beim Laden Ihrer Daten. Bitte versuchen Sie es erneut.');
        }
    };

    return (
        <div className="app">
            <header className="full-width-header">
                <div className="header-content">
                    <span className="club-title">TC LUV Graz</span>

                    <nav className="full-width-nav">
                        <a href="#anlage" className="nav-link">Anlage</a>
                        <a href="#kontakt" className="nav-link">Kontakt</a>
                        <a href="https://venuzle.at/anbieter-typ/sportstaetten/" className="nav-link" target="_blank" rel="noopener noreferrer">Sportstätten</a>
                    </nav>

                    <div className="nav-auth-section">
                        {isLoggedIn ? (
                            <UserProfile user={user} onLogout={onLogout} />
                        ) : (
                            <div className="nav-auth-buttons">
                                <button
                                    className="nav-login-btn"
                                    onClick={() => navigate('/login')}
                                >
                                    Anmelden
                                </button>
                                <button
                                    className="nav-register-btn"
                                    onClick={() => navigate('/register')}
                                >
                                    Registrieren
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <section className="full-hero">
                <div className="hero-carousel">
                    <div className="carousel-track">
                        {slides.map((slide, index) => (
                            <div
                                key={index}
                                className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
                                style={{ backgroundImage: `url(${slide})` }}
                            />
                        ))}
                    </div>
                    <div className="carousel-overlay" />
                </div>

                <div className="hero-cta">
                    <h2>TC LUV Graz</h2>
                    <p>Tennis in einer grünen Oase im Herzen von Graz-Wetzelsdorf</p>
                    <button className="hero-booking-btn" onClick={handleBookingClick}>
                        Platz jetzt buchen
                    </button>
                </div>
            </section>

            <section className="full-content">
                <div className="content-wrapper">
                    <div id="anlage" className="content-header">
                        <h1>TC LUV Graz</h1>
                    </div>

                    <div className="text-content">
                        <p>
                            Seit nunmehr 40 Jahren wird am TC LUV Tennis gespielt. Eingebettet in den Gesamtverein LUV liegen 5 Tennisplätze
                            in unmittelbarer Umgebung des Fußballstadions und der Eisschützenanlage in einer grünen Oase im Bezirk Wetzelsdorf.
                            Durch die Nähe zur Bushaltestelle der Linie 33 und ausreichend Parkmöglichkeiten ist die Anlage für Jedermann leicht erreichbar.
                        </p>
                        <p>
                            Der TC LUV war von jeher sehr sportlich ausgerichtet und nimmt mit 18 Mannschaften an den Mannschaftsmeisterschaften
                            des STTV und des ÖTV teil. Aber auch unsere Hobbyspieler sind eine wichtige, tragende Säule unseres Vereinslebens,
                            genauso wie ein bequemes Ambiente, heimische Kulinarik und unsere Feste und Veranstaltungen.
                        </p>
                    </div>

                    <div className="features-container">
                        <div className="feature-section">
                            <h3>Unsere Anlage</h3>
                            <div className="feature-list">
                                <span className="feature-item">5 Sandplätze</span>
                                <span className="feature-item">Kantine</span>
                                <span className="feature-item">Gastgarten</span>
                                <span className="feature-item">Eigene Parkplätze</span>
                            </div>
                        </div>

                        <div id="kontakt" className="contact-section">
                            <h3>Kontakt & Öffnungszeiten</h3>
                            <div className="contact-info">
                                <p><strong>Adresse:</strong> Kunssiegasse 16, 8063 Graz</p>
                                <p><strong>Telefon:</strong> +43 316 123 456</p>
                                <p><strong>E-Mail:</strong> info@tcluvgraz.at</p>
                                <p><strong>Öffnungszeiten:</strong> Mo–Fr 8:00–22:00, Sa–So 9:00–20:00</p>
                            </div>
                        </div>
                    </div>

                    <div className="booking-container-bottom">
                        <button
                            className="booking-btn-large"
                            onClick={handleBookingClick}
                        >
                            Online Buchen
                        </button>
                    </div>
                </div>
            </section>

            <Outlet />

            <footer className="full-footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <h4>Unterstützt von</h4>
                        <div className="support-logo">VENUZLE</div>
                    </div>

                    <div className="footer-section">
                        <h4>Folge uns</h4>
                        <div className="social-links">
                            <a href="https://www.facebook.com/Venuzle" className="social-link" target="_blank" rel="noopener noreferrer">
                                Facebook
                            </a>
                            <a href="https://www.instagram.com/venuzle" className="social-link" target="_blank" rel="noopener noreferrer">
                                Instagram
                            </a>
                            <a href="https://x.com/venuzle" className="social-link" target="_blank" rel="noopener noreferrer">
                                Twitter / X
                            </a>
                        </div>
                    </div>

                    <div className="footer-section">
                        <h4>Venuzle</h4>
                        <div className="venuzle-links">
                            <div className="link-column">
                                <a href="https://manager.venuzle.com/" className="footer-link" target="_blank" rel="noopener noreferrer">Für Sportanbieter</a>
                                <a href="https://venuzle.at/karriere/" className="footer-link" target="_blank" rel="noopener noreferrer">Karriere</a>
                                <a href="https://venuzle.at/agb/" className="footer-link" target="_blank" rel="noopener noreferrer">AGB</a>
                                <a href="https://venuzle.at/datenschutz/" className="footer-link" target="_blank" rel="noopener noreferrer">Datenschutz</a>
                                <a href="https://venuzle.at/impressum/" className="footer-link" target="_blank" rel="noopener noreferrer">Impressum</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} TC LUV GRAZ. Alle Rechte vorbehalten.</p>
                </div>
            </footer>
        </div>
    );
}

export default MainPage;
