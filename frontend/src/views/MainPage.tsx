import { useState } from 'react';
import '../css/MainPage.css';

function MainPage() {
    const [activeTab, setActiveTab] = useState('info');

    return (
        <div className="app">
            <header className="header">
                <div className="container">
                    <div className="logo">
                        <h1>TC LUV GRAZ</h1>
                    </div>
                    <nav className="nav">
                        <ul>
                            <li><a href="#home">Home</a></li>
                            <li><a href="#about">Über uns</a></li>
                            <li><a href="#services">Leistungen</a></li>
                            <li><a href="#contact">Kontakt</a></li>
                        </ul>
                    </nav>
                </div>
            </header>

            <section className="hero">
                <div className="hero-content">
                    <h1>TC LUV GRAZ</h1>
                    <p>Ihr Tennispartner in Graz</p>
                    <button className="cta-button">Jetzt kontaktieren</button>
                </div>
            </section>

            <main className="main-content">
                <div className="container">
                    <div className="tabs">
                        <button
                            className={activeTab === 'info' ? 'tab active' : 'tab'}
                            onClick={() => setActiveTab('info')}
                        >
                            Informationen
                        </button>
                        <button
                            className={activeTab === 'services' ? 'tab active' : 'tab'}
                            onClick={() => setActiveTab('services')}
                        >
                            Leistungen
                        </button>
                        <button
                            className={activeTab === 'contact' ? 'tab active' : 'tab'}
                            onClick={() => setActiveTab('contact')}
                        >
                            Kontakt
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="tab-content">
                        {activeTab === 'info' && (
                            <div className="info-section">
                                <h2>Willkommen beim TC LUV GRAZ</h2>
                                <p>
                                    Wir sind ein etablierter Tennisclub in Graz mit langjähriger Erfahrung
                                    und bieten erstklassige Tennisplätze, Training und Events für alle Altersgruppen
                                    und Spielniveaus.
                                </p>
                                <div className="features">
                                    <div className="feature">
                                        <h3>Erfahrung</h3>
                                        <p>Mehr als 20 Jahre Erfahrung im Tennisbereich</p>
                                    </div>
                                    <div className="feature">
                                        <h3>Qualität</h3>
                                        <p>Höchste Qualitätsstandards bei Plätzen und Training</p>
                                    </div>
                                    <div className="feature">
                                        <h3>Community</h3>
                                        <p>Aktive Tennis-Community mit regelmäßigen Events</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'services' && (
                            <div className="services-section">
                                <h2>Unsere Leistungen</h2>
                                <div className="services-grid">
                                    <div className="service-card">
                                        <h3>Tennisplätze</h3>
                                        <p>6 moderne Sandplätze und 2 Hallenplätze für ganzjähriges Spielvergnügen.</p>
                                    </div>
                                    <div className="service-card">
                                        <h3>Training</h3>
                                        <p>Individuelles Training für Anfänger, Fortgeschrittene und Wettkampfspieler.</p>
                                    </div>
                                    <div className="service-card">
                                        <h3>Events</h3>
                                        <p>Regelmäßige Turniere, Social Days und Events für Mitglieder.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'contact' && (
                            <div className="contact-section">
                                <h2>Kontaktieren Sie uns</h2>
                                <form className="contact-form">
                                    <div className="form-group">
                                        <label htmlFor="name">Name</label>
                                        <input type="text" id="name" placeholder="Ihr Name" />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="email">E-Mail</label>
                                        <input type="email" id="email" placeholder="Ihre E-Mail Adresse" />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="message">Nachricht</label>
                                        <textarea id="message" rows={5} placeholder="Ihre Nachricht"></textarea>
                                    </div>
                                    <button type="submit" className="submit-button">Nachricht senden</button>
                                </form>
                                <div className="contact-info">
                                    <h3>Kontaktinformationen</h3>
                                    <p>Adresse: Tennisparkstraße 123, 8010 Graz</p>
                                    <p>Telefon: +43 316 123 456</p>
                                    <p>E-Mail: info@tcluvgraz.at</p>
                                    <p>Öffnungszeiten: Mo-Fr 8:00-22:00, Sa-So 9:00-20:00</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <footer className="footer">
                <div className="container">
                    <p>&copy; {new Date().getFullYear()} TC LUV GRAZ. Alle Rechte vorbehalten.</p>
                </div>
            </footer>
        </div>
    );
}

export default MainPage;