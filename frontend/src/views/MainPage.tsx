import { useState, useEffect } from 'react';
import '../css/MainPage.css';

import tcLuv02 from '../assets/tc_luv02.jpg';
import tcLuv05 from '../assets/tc_luv05-1024x768.jpg';
import tcluv01 from '../assets/tcluv_01-1024x768.jpg';
import tcluv03 from '../assets/tcluv_03.jpg';
import tcluv04 from '../assets/tcluv_04-1024x576.jpg';

function MainPage() {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [tcLuv02, tcLuv05, tcluv01, tcluv03, tcluv04];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [slides.length]);

    return (
        <div className="app">
            <header className="full-width-header">
                <div className="header-content">
                    <div className="header-top">
                        <h2 className="club-title">TC LUV Graz</h2>
                    </div>

                    <nav className="full-width-nav">
                        <a href="#regionen" className="nav-link">Regionen</a>
                        <a href="https://venuzle.at/anbieter-typ/sportstaetten/" className="nav-link">Sportstätten</a>
                        <a href="https://venuzle.at/anbieter-typ/kurse/" className="nav-link">Kurse & Camps</a>
                    </nav>
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

                    <div className="carousel-overlay"></div>
                </div>
            </section>

            <section className="full-content">
                <div className="content-header">
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
                        <h3>Unsere Anlage umfasst:</h3>
                        <div className="feature-list">
                            <span className="feature-item">5 Sandplätze</span>
                            <span className="feature-item">Kantine</span>
                            <span className="feature-item">Gastgarten</span>
                            <span className="feature-item">Eigene Parkplätze</span>
                        </div>
                    </div>

                    <div className="contact-section">
                        <h3>Kontakt & Öffnungszeiten</h3>
                        <div className="contact-info">
                            <p><strong>Adresse:</strong> Kunssiegasse 16, 8063 Graz</p>
                            <p><strong>Telefon:</strong> +43 316 123 456</p>
                            <p><strong>E-Mail:</strong> info@tcluvgraz.at</p>
                            <p><strong>Öffnungszeiten:</strong> Mo-Fr 8:00-22:00, Sa-So 9:00-20:00</p>
                        </div>
                    </div>
                </div>

                {/* Online Buchen Button vor dem Footer */}
                <div className="booking-container-bottom">
                    <button className="booking-btn-large">Online Buchen</button>
                </div>
            </section>

            <footer className="full-footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <div className="support-section">
                            <h4>UNTERSTÜTZT VON</h4>
                            <div className="support-logo">
                                <span>VENUZLE</span>
                            </div>
                        </div>
                    </div>

                    <div className="footer-section">
                        <div className="social-section">
                            <h4>FOLGE UNS</h4>
                            <div className="social-links">
                                <a href="https://www.facebook.com/Venuzle" className="social-link">
                                    <span className="social-icon">f</span> Facebook
                                </a>
                                <a href="https://www.instagram.com/venuzle" className="social-link">
                                    <span className="social-icon">☒</span> Instagram
                                </a>
                                <a href="https://x.com/venuzle" className="social-link">
                                    <span className="social-icon">▶</span> Twitter
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="footer-section">
                        <div className="venuzle-links">
                            <h4>VENUZLE</h4>
                            <div className="link-column">
                                <a href="https://manager.venuzle.com/" className="footer-link">Für Sportanbieter</a>
                                <a href="https://venuzle.at/karriere/" className="footer-link">Karriere</a>
                                <a href="https://venuzle.at/agb/" className="footer-link">AGB</a>
                                <a href="https://venuzle.at/datenschutz/" className="footer-link">Datenschutz</a>
                                <a href="https://venuzle.at/mangopay/" className="footer-link">Nutzungsbedingungen Mangopay</a>
                                <a href="https://venuzle.at/impressum/" className="footer-link">Impressum</a>
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