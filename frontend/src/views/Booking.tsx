import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useNavigate } from 'react-router-dom';
import "../css/Booking.css";

const hours = [
    "08:00", "09:00", "10:00", "11:00",
    "12:00", "13:00", "14:00", "15:00",
    "16:00", "17:00", "18:00", "19:00", "20:00"
];

interface EntryDto {
    id: number;
    courtId: number;
    date: string;
    hour: number;
    userEmail: string;
}

interface CreateEntryRequest {
    entryDate: string;
    startHour: number;
    tennisCourtId: number;
    entryTypeId: number;
}

export default function BookingPage() {
    const navigate = useNavigate();

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedCourt, setSelectedCourt] = useState<number | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [bookedEntries, setBookedEntries] = useState<EntryDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

    // Prüfe ob User eingeloggt ist
    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        setIsAuthenticated(!!token && !!user);

        if (user) {
            try {
                const userData = JSON.parse(user);
                setCurrentUserEmail(userData.email);
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }

        if (!token || !user) {
            setError('Bitte melden Sie sich an um Buchungen zu sehen');
        }
    }, []);

    const formatDateKey = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const totalCourts = 5;
    const courts = [1, 2, 3, 4, 5];

    // API: Buchungen für ein bestimmtes Datum abrufen
    const fetchEntriesForDate = async (date: Date) => {
        try {
            setLoading(true);
            setError(null);
            const dateKey = formatDateKey(date);
            const token = localStorage.getItem('token');

            if (!token) {
                setError('Nicht eingeloggt');
                setBookedEntries([]);
                return;
            }

            console.log('🔄 Lade Buchungen für:', dateKey);

            const response = await fetch(`http://localhost:8080/api/entries/${dateKey}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setIsAuthenticated(false);
                setCurrentUserEmail(null);
                setError('Sitzung abgelaufen. Bitte neu anmelden.');
                setBookedEntries([]);
                return;
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Fehler:', errorText);
                throw new Error('Fehler beim Laden der Buchungen: ' + response.status);
            }

            const entries: EntryDto[] = await response.json();
            console.log('✅ Geladene Buchungen:', entries);
            setBookedEntries(entries);

        } catch (err: any) {
            console.error('❌ Error fetching entries:', err);
            setError(err.message);
            setBookedEntries([]);
        } finally {
            setLoading(false);
        }
    };

    // API: Neue Buchung erstellen
    const createBooking = async (tennisCourtId: number, entryDate: string, startHour: number) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Bitte melden Sie sich an um zu buchen');
            }

            const request: CreateEntryRequest = {
                entryDate: entryDate,
                startHour: startHour,
                tennisCourtId: tennisCourtId,
                entryTypeId: 1
            };

            const response = await fetch('http://localhost:8080/api/entries', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setIsAuthenticated(false);
                setCurrentUserEmail(null);
                throw new Error('Sitzung abgelaufen. Bitte neu anmelden.');
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Buchung fehlgeschlagen');
            }

            const result = await response.json();
            return result;

        } catch (err: any) {
            throw new Error(err.message);
        }
    };

    // API: Buchung löschen
    const deleteBooking = async (courtId: number, date: string, hour: number) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Nicht eingeloggt');
            }

            const response = await fetch(`http://localhost:8080/api/entries/${courtId}/${date}/${hour}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setIsAuthenticated(false);
                setCurrentUserEmail(null);
                throw new Error('Sitzung abgelaufen. Bitte neu anmelden.');
            }

            if (!response.ok) {
                throw new Error('Löschen fehlgeschlagen');
            }

        } catch (err: any) {
            throw new Error(err.message);
        }
    };

    // Buchungen laden wenn Datum ausgewählt wird
    useEffect(() => {
        if (selectedDate && isAuthenticated) {
            fetchEntriesForDate(selectedDate);
        } else {
            setBookedEntries([]);
        }
    }, [selectedDate, isAuthenticated]);

    // KORRIGIERT: Prüft ob ein bestimmter Platz zu einer bestimmten Zeit belegt ist (durch irgendjemanden)
    const isCourtBooked = (courtId: number, time: string) => {
        if (!selectedDate) return false;

        const hour = parseInt(time.split(':')[0]);
        const dateKey = formatDateKey(selectedDate);

        const isBooked = bookedEntries.some(entry =>
            entry.courtId === courtId &&
            entry.date === dateKey &&
            entry.hour === hour
        );

        return isBooked;
    };

    // NEU: Prüft ob der aktuelle Benutzer diesen Slot gebucht hat
    const isMyBooking = (courtId: number, time: string) => {
        if (!selectedDate || !currentUserEmail) return false;

        const hour = parseInt(time.split(':')[0]);
        const dateKey = formatDateKey(selectedDate);

        const myBooking = bookedEntries.some(entry =>
            entry.courtId === courtId &&
            entry.date === dateKey &&
            entry.hour === hour &&
            entry.userEmail === currentUserEmail
        );

        return myBooking;
    };

    // Prüft ob ein Platz für ein Datum komplett ausgebucht ist
    const isCourtFullyBooked = (courtId: number) => {
        return hours.every(time => isCourtBooked(courtId, time));
    };

    // Verfügbare Plätze für das ausgewählte Datum
    const availableCourts = selectedDate
        ? courts.map((court) => {
            const disabled = isCourtFullyBooked(court);
            return {
                court: court,
                disabled: disabled
            };
        })
        : [];

    // VERBESSERT: Verfügbare Zeiten für ausgewählten Platz und Datum
    const availableTimes = selectedDate && selectedCourt
        ? hours.map((time) => {
            const booked = isCourtBooked(selectedCourt, time);
            const myBooking = isMyBooking(selectedCourt, time);

            return {
                time: time,
                disabled: booked && !myBooking, // Nur disabled wenn von jemand anderem gebucht
                isMyBooking: myBooking
            };
        })
        : [];

    // NEU: Eigene Buchungen für das ausgewählte Datum filtern
    const myBookings = selectedDate && currentUserEmail
        ? bookedEntries.filter(entry =>
            entry.date === formatDateKey(selectedDate) &&
            entry.userEmail === currentUserEmail
        )
        : [];

    const tileClassName = ({ date, view }: { date: Date; view: string }) => {
        if (view === 'month') {
            const dateKey = formatDateKey(date);
            const hasBookings = bookedEntries.some(entry => entry.date === dateKey);
            return hasBookings ? "partially-booked" : "";
        }
        return "";
    };

    const handleBooking = async () => {
        if (!selectedDate || !selectedCourt || !selectedTime) return;

        if (!isAuthenticated) {
            setError('Bitte melden Sie sich an um zu buchen');
            navigate('/login');
            return;
        }

        try {
            setLoading(true);
            const startHour = parseInt(selectedTime.split(':')[0]);
            const entryDate = formatDateKey(selectedDate);

            await createBooking(selectedCourt, entryDate, startHour);

            setTimeout(async () => {
                await fetchEntriesForDate(selectedDate);
            }, 500);

            alert(`✅ Buchung erfolgreich!\n\nDatum: ${selectedDate.toLocaleDateString("de-DE")}\nPlatz: ${selectedCourt}\nUhrzeit: ${selectedTime}`);

            setSelectedCourt(null);
            setSelectedTime(null);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBooking = async (courtId: number, date: Date, time: string) => {
        try {
            setLoading(true);
            const hour = parseInt(time.split(':')[0]);
            const dateKey = formatDateKey(date);

            await deleteBooking(courtId, dateKey, hour);
            await fetchEntriesForDate(selectedDate!);

            alert('✅ Buchung erfolgreich gelöscht!');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLoginRedirect = () => {
        navigate('/login');
    };

    const handleTimeClick = (time: string, disabled: boolean) => {
        if (disabled) return;

        if (!isAuthenticated) {
            setError('Bitte anmelden um eine Zeit auszuwählen');
            navigate('/login');
            return;
        }

        setSelectedTime(time);
        setError(null);
    };

    const handleCourtClick = (court: number, disabled: boolean) => {
        if (disabled) return;

        if (!isAuthenticated) {
            setError('Bitte anmelden um einen Platz auszuwählen');
            navigate('/login');
            return;
        }

        setSelectedCourt(court);
        setSelectedTime(null);
        setError(null);
    };

    return (
        <div className="page">
            <header className="header">
                <h1>🎾 Tennis Luv – Terminbuchung</h1>
                {!isAuthenticated && (
                    <button className="login-redirect-btn" onClick={handleLoginRedirect}>
                        Anmelden
                    </button>
                )}
            </header>

            <div>
                <button className="back-btn" onClick={() => navigate('/')}>
                    Zurück
                </button>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                    {error.includes('anmelden') && (
                        <button onClick={handleLoginRedirect} className="inline-login-btn">
                            Jetzt anmelden
                        </button>
                    )}
                </div>
            )}

            {loading && (
                <div className="loading-message">
                    Lädt...
                </div>
            )}

            {!isAuthenticated && (
                <div className="auth-warning">
                    <h3>Buchung nur für Mitglieder</h3>
                    <p>Melden Sie sich an um Plätze zu buchen und Ihre Reservierungen zu verwalten.</p>
                    <button onClick={handleLoginRedirect} className="auth-btn">
                        Jetzt anmelden
                    </button>
                </div>
            )}

            {/* Schritt 1: Datum auswählen */}
            <section className="calendar-section">
                <h2>1. Wähle ein Datum</h2>
                <p className="section-info">
                    Tage mit Buchungen sind <span className="partially-booked-demo">orange markiert</span>
                </p>
                <Calendar
                    onChange={(date) => {
                        setSelectedDate(date as Date);
                        setSelectedCourt(null);
                        setSelectedTime(null);
                        setError(null);
                    }}
                    value={selectedDate}
                    minDate={new Date()}
                    tileClassName={tileClassName}
                />
                {selectedDate && (
                    <p className="selected-date-info">
                        Ausgewählt: <strong>{selectedDate.toLocaleDateString("de-DE")}</strong>
                        {isAuthenticated && (
                            <span> • {bookedEntries.length} Buchung(en) geladen</span>
                        )}
                    </p>
                )}
            </section>

            {/* Schritt 2: Tennisplatz auswählen (nur wenn Datum ausgewählt) */}
            {selectedDate && (
                <section className="slots">
                    <h2>2. Wähle einen Tennisplatz</h2>
                    <p className="section-info">
                        Wähle einen verfügbaren Platz für {selectedDate.toLocaleDateString("de-DE")}
                    </p>
                    <div className="slots-grid courts-grid">
                        {availableCourts.map((courtInfo) => (
                            <button
                                key={courtInfo.court}
                                className={`slot-btn court-btn ${
                                    courtInfo.disabled
                                        ? "disabled"
                                        : selectedCourt === courtInfo.court
                                            ? "selected"
                                            : ""
                                }`}
                                onClick={() => handleCourtClick(courtInfo.court, courtInfo.disabled)}
                                disabled={courtInfo.disabled}
                            >
                                <span className="court-number">Platz {courtInfo.court}</span>
                                {courtInfo.disabled ? (
                                    <div className="status-label">Ausgebucht</div>
                                ) : (
                                    <div className="status-label available">
                                        Verfügbar
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {/* Schritt 3: Uhrzeit auswählen (nur wenn Platz ausgewählt) */}
            {selectedDate && selectedCourt && (
                <section className="slots">
                    <h2>3. Wähle eine Uhrzeit</h2>
                    <p className="section-info">
                        Verfügbare Zeiten für Platz {selectedCourt} am {selectedDate.toLocaleDateString("de-DE")}
                    </p>
                    <div className="slots-grid times-grid">
                        {hours.map((time) => {
                            const booked = isCourtBooked(selectedCourt, time);
                            const myBooking = isMyBooking(selectedCourt, time);

                            return (
                                <button
                                    key={time}
                                    className={`slot-btn time-btn ${
                                        booked && !myBooking
                                            ? "disabled"
                                            : myBooking
                                                ? "my-booking"
                                                : selectedTime === time
                                                    ? "selected"
                                                    : ""
                                    }`}
                                    onClick={() => handleTimeClick(time, booked && !myBooking)}
                                    disabled={booked && !myBooking}
                                >
                                    {time}
                                    {booked && !myBooking ? (
                                        <div className="status-label">Belegt</div>
                                    ) : myBooking ? (
                                        <div className="status-label my-booking-label">Meine Buchung</div>
                                    ) : (
                                        <div className="status-label available">Frei</div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Schritt 4: Bestätigung (nur wenn alles ausgewählt) */}
            {selectedDate && selectedCourt && selectedTime && isAuthenticated && (
                <footer className="footer">
                    <div className="booking-summary">
                        <h3>Buchungsübersicht</h3>
                        <p>
                            <strong>Datum:</strong> {selectedDate.toLocaleDateString("de-DE")}<br />
                            <strong>Platz:</strong> {selectedCourt}<br />
                            <strong>Uhrzeit:</strong> {selectedTime}
                        </p>
                    </div>
                    <button
                        className="confirm-btn"
                        onClick={handleBooking}
                        disabled={loading}
                    >
                        {loading ? 'Bucht...' : 'Jetzt buchen'}
                    </button>
                </footer>
            )}

            {/* VERBESSERT: Zeigt nur die eigenen Buchungen an */}
            {selectedDate && isAuthenticated && myBookings.length > 0 && (
                <section className="slots">
                    <h2>Meine Buchungen an {selectedDate.toLocaleDateString("de-DE")}</h2>
                    <div className="my-bookings">
                        {myBookings.map((entry) => (
                            <div key={`${entry.courtId}-${entry.hour}`} className="booking-item">
                                <span>Platz {entry.courtId} • {entry.hour}:00 Uhr</span>
                                <button
                                    className="delete-booking-btn"
                                    onClick={() => handleDeleteBooking(entry.courtId, selectedDate, `${entry.hour}:00`)}
                                    disabled={loading}
                                >
                                    Löschen
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}