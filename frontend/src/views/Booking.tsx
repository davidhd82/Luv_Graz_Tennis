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
    entryDate: string;
    startHour: number;
    tennisCourtId: number;
    tennisCourtName: string;
    entryTypeName: string;
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

    const courts = [1, 2, 3, 4, 5];

    const fetchEntriesForCourtAndDate = async (courtId: number, date: Date) => {
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

            console.log(`🔄 Lade Buchungen für Platz ${courtId} am ${dateKey}`);

            const response = await fetch(`http://localhost:8080/api/entries/${courtId}/${dateKey}`, {
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
                console.error('API Fehler:', errorText);
                throw new Error('Fehler beim Laden der Buchungen: ' + response.status);
            }

            const entries: EntryDto[] = await response.json();
            console.log(`Geladene Buchungen für Platz ${courtId}:`, entries);
            setBookedEntries(entries);

        } catch (err: any) {
            console.error('Error fetching entries:', err);
            setError(err.message);
            setBookedEntries([]);
        } finally {
            setLoading(false);
        }
    };

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

            console.log('📤 Sende Buchungsrequest:', request);

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
                console.error('Buchung Fehler:', errorText);
                throw new Error(errorText || 'Buchung fehlgeschlagen');
            }

            const result = await response.json();
            console.log('Buchung erfolgreich:', result);
            return result;

        } catch (err: any) {
            console.error('Error in createBooking:', err);
            throw new Error(err.message);
        }
    };

    const deleteBooking = async (courtId: number, date: string, hour: number) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Nicht eingeloggt');
            }

            console.log(`Lösche Buchung: Platz ${courtId}, ${date}, ${hour}:00`);

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

            console.log('Buchung erfolgreich gelöscht');

        } catch (err: any) {
            console.error('Error in deleteBooking:', err);
            throw new Error(err.message);
        }
    };

    useEffect(() => {
        if (selectedDate && selectedCourt && isAuthenticated) {
            console.log('Platz und Datum ausgewählt, lade Buchungen...');
            fetchEntriesForCourtAndDate(selectedCourt, selectedDate);
        } else {
            console.log('Kein Platz/Datum ausgewählt, leere Buchungen');
            setBookedEntries([]);
        }
    }, [selectedDate, selectedCourt, isAuthenticated]);

    const isTimeBooked = (time: string) => {
        if (!selectedDate || !selectedCourt) return false;

        const hour = parseInt(time.split(':')[0]);

        console.log('🔍 Prüfe ob Zeit gebucht ist:', {
            time,
            hour,
            selectedCourt,
            bookedEntries: bookedEntries.map(e => ({ court: e.tennisCourtId, hour: e.startHour }))
        });

        const isBooked = bookedEntries.some(entry =>
            entry.tennisCourtId === selectedCourt &&
            entry.startHour === hour
        );

        console.log(`⏰ Zeit ${time} ist ${isBooked ? 'GEBUCHT' : 'FREI'}`);
        return isBooked;
    };

    const isMyBooking = (time: string) => {
        if (!selectedDate || !selectedCourt || !currentUserEmail) return false;

        const hour = parseInt(time.split(':')[0]);

        const myBooking = bookedEntries.some(entry =>
            entry.tennisCourtId === selectedCourt &&
            entry.startHour === hour &&
            entry.userEmail === currentUserEmail
        );

        console.log(`👤 Zeit ${time} ist ${myBooking ? 'MEINE Buchung' : 'nicht meine'}`);
        return myBooking;
    };

    const myBookings = selectedDate && selectedCourt && currentUserEmail
        ? bookedEntries.filter(entry =>
            entry.userEmail === currentUserEmail
        )
        : [];

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

            console.log('🚀 Starte Buchung mit:', {
                tennisCourtId: selectedCourt,
                entryDate,
                startHour
            });

            await createBooking(selectedCourt, entryDate, startHour);

            console.log('🔄 Lade Buchungen nach Buchung neu...');
            await fetchEntriesForCourtAndDate(selectedCourt, selectedDate);

            alert(`Buchung erfolgreich!\n\nDatum: ${selectedDate.toLocaleDateString("de-DE")}\nPlatz: ${selectedCourt}\nUhrzeit: ${selectedTime}`);

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

            console.log('🔄 Lade Buchungen nach Löschung neu...');
            await fetchEntriesForCourtAndDate(selectedCourt!, selectedDate!);

            alert('Buchung erfolgreich gelöscht!');
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
        console.log('🖱️ Zeit geklickt:', { time, disabled });

        if (disabled) {
            console.log('Zeit ist gebucht - nicht klickbar');
            return;
        }

        if (!isAuthenticated) {
            setError('Bitte anmelden um eine Zeit auszuwählen');
            navigate('/login');
            return;
        }

        setSelectedTime(time);
        setError(null);
    };

    const handleCourtClick = (court: number) => {
        console.log('🖱️ Platz geklickt:', court);

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

            <section className="calendar-section">
                <h2>1. Wähle ein Datum</h2>
                <Calendar
                    onChange={(date) => {
                        console.log('📅 Datum ausgewählt:', date);
                        setSelectedDate(date as Date);
                        setSelectedCourt(null);
                        setSelectedTime(null);
                        setBookedEntries([]);
                        setError(null);
                    }}
                    value={selectedDate}
                    minDate={new Date()}
                />
                {selectedDate && (
                    <p className="selected-date-info">
                        Ausgewählt: <strong>{selectedDate.toLocaleDateString("de-DE")}</strong>
                    </p>
                )}
            </section>

            {selectedDate && (
                <section className="slots">
                    <h2>2. Wähle einen Tennisplatz</h2>
                    <div className="slots-grid courts-grid">
                        {courts.map((court) => (
                            <button
                                key={court}
                                className={`slot-btn court-btn ${
                                    selectedCourt === court ? "selected" : ""
                                }`}
                                onClick={() => handleCourtClick(court)}
                            >
                                <span className="court-number">Platz {court}</span>
                                <div className="status-label available">
                                    Verfügbar
                                </div>
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {selectedDate && selectedCourt && (
                <section className="slots">
                    <h2>3. Wähle eine Uhrzeit für Platz {selectedCourt}</h2>
                    <div className="slots-grid times-grid">
                        {hours.map((time) => {
                            const booked = isTimeBooked(time);
                            const myBooking = isMyBooking(time);

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

            {selectedDate && selectedCourt && isAuthenticated && myBookings.length > 0 && (
                <section className="slots">
                    <h2>Meine Buchungen an {selectedDate.toLocaleDateString("de-DE")}</h2>
                    <div className="my-bookings">
                        {myBookings.map((entry) => (
                            <div key={`${entry.tennisCourtId}-${entry.startHour}`} className="booking-item">
                                <span>Platz {entry.tennisCourtId} • {entry.startHour}:00 Uhr</span>
                                <button
                                    className="delete-booking-btn"
                                    onClick={() => handleDeleteBooking(entry.tennisCourtId, selectedDate, `${entry.startHour}:00`)}
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