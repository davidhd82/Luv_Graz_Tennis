import { useState } from 'react';
import '../css/MainPage.css';

function MainPage() {
    const [activeTab, setActiveTab] = useState('info');

    return (
        <div className="app">
            <header className="header">
                <div className="logo">
                    <h1>TC LUV GRAZ</h1>
                </div>
            </header>

            <section className="hero">
                <div className="hero-content">
                    <h1>TC LUV GRAZ</h1>
                    <p>Ihr Tennispartner in Graz</p>
                    <button className="cta-button">Jetzt buchen</button>
                </div>
            </section>

            <div className="main-tabs">
                <button
                    className={activeTab === 'info' ? 'main-tab active' : 'main-tab'}
                    onClick={() => setActiveTab('info')}
                >
                    Allgemein
                </button>
                <button
                    className={activeTab === 'services' ? 'main-tab active' : 'main-tab'}
                    onClick={() => setActiveTab('services')}
                >
                    Informationen
                </button>
                <button
                    className={activeTab === 'contact' ? 'main-tab active' : 'main-tab'}
                    onClick={() => setActiveTab('contact')}
                >
                    Kontakt
                </button>
            </div>

            <main className="main-content">
                <div className="tab-content">
                    {activeTab === 'info' && (
                        <div className="info-section">
                            <h2>Willkommen beim TC LUV GRAZ</h2>
                            <p>
                                Wir sind ein etablierter Tennisclub in Graz mit langjähriger Erfahrung
                                und bieten erstklassige Tennisplätze, Training und Events für alle Altersgruppen
                                und Spielniveaus.
                            </p>
                        </div>
                    )}

                    {activeTab === 'services' && (
                        <div className="services-section">
                            <h2>Unsere Infos</h2>
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
                            <div className="contact-container">
                                <div>
                                    <p>Seit nunmehr 40 Jahren wird am TC LUV Tennis gespielt. Eingebettet in den Gesamtverein LUV liegen 5 Tennisplätze in unmittelbarer Umgebung des Fußballstadions und der Eisschützenanlage in einer grünen Oase im Bezirk Wetzelsdorf. Durch die Nähe zur Bushaltestelle der Linie 33 und ausreichend Parkmöglichkeiten ist die Anlage für Jedermann leicht erreichbar.</p>

                                    <p>Der TC LUV war von jeher sehr sportlich ausgerichtet und nimmt mit 18 Mannschaften an den Mannschaftsmeisterschaften des STTV und des ÖTV teil. Aber auch unsere Hobbyspieler sind eine wichtige, tragende Säule unseres Vereinslebens, genauso wie ein bequemes Ambiente, heimische Kulinarik und unsere Feste und Veranstaltungen.</p>

                                    <h3>Unsere Anlage umfasst:</h3>
                                    <ul>
                                        <li>5 Sandplätze</li>
                                        <li>Kantine</li>
                                        <li>Gastgarten</li>
                                        <li>Eigene Parkplätze</li>
                                    </ul>

                                    <div className="tags">
                                        <span>Tagged as:</span>
                                        <span className="tag">Gastgarten</span>,
                                        <span className="tag">Kantine</span>,
                                        <span className="tag">Parkplatz</span>
                                    </div>
                                </div>
                                <div className="contact-info">
                                    <h3>Kontaktinformationen</h3>
                                    <p>Adresse: Tennisparkstraße 123, 8010 Graz</p>
                                    <p>Telefon: +43 316 123 456</p>
                                    <p>E-Mail: info@tcluvgraz.at</p>
                                    <p>Öffnungszeiten: Mo-Fr 8:00-22:00, Sa-So 9:00-20:00</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <footer className="footer">
                <p>&copy; {new Date().getFullYear()} TC LUV GRAZ. Alle Rechte vorbehalten.</p>
            </footer>
        </div>
    );
}

export default MainPage;