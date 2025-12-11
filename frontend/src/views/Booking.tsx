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

interface CourtBookings {
    [courtId: number]: EntryDto[];
}

interface User {
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
    isAdmin: boolean;
    enabled: boolean;
    membershipPaid: boolean;
}

export default function BookingPage() {
    const navigate = useNavigate();

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedCourt, setSelectedCourt] = useState<number | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [courtBookings, setCourtBookings] = useState<CourtBookings>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    // Lade User-Daten vom Backend
    const fetchCurrentUser = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsAuthenticated(false);
                setCurrentUser(null);
                return;
            }

            const response = await fetch('http://localhost:8080/api/user/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const userData = await response.json();

                const user: User = {
                    userId: userData.userId || userData.id,
                    email: userData.email,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    isAdmin: userData.isAdmin || userData.admin || false,
                    enabled: userData.enabled || true,
                    membershipPaid: userData.membershipPaid || false
                };

                setCurrentUser(user);
                setIsAuthenticated(true);

                localStorage.setItem('user', JSON.stringify({
                    userId: user.userId,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    isAdmin: user.isAdmin,
                    membershipPaid: user.membershipPaid
                }));
            } else if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setIsAuthenticated(false);
                setCurrentUser(null);
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
            const userData = JSON.parse(userStr);
            setCurrentUser({
                userId: userData.userId || userData.id,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                isAdmin: userData.isAdmin || userData.admin || false,
                enabled: userData.enabled || true,
                membershipPaid: userData.membershipPaid || false
            });
            setIsAuthenticated(true);
            fetchCurrentUser();
        } else {
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

    const fetchEntriesForAllCourts = async (date: Date) => {
        if (!isAuthenticated || !currentUser) return;

        try {
            setLoading(true);
            setError(null);
            const dateKey = formatDateKey(date);
            const token = localStorage.getItem('token');

            if (!token) {
                setError('Nicht eingeloggt');
                setCourtBookings({});
                return;
            }

            console.log(`🔄 Lade Buchungen für alle Plätze am ${dateKey}`);

            const fetchPromises = courts.map(async (courtId) => {
                try {
                    const response = await fetch(`http://localhost:8080/api/entries/${courtId}/${dateKey}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.status === 401) {
                        throw new Error('UNAUTHORIZED');
                    }

                    if (!response.ok) {
                        console.warn(`Fehler beim Laden von Platz ${courtId}:`, response.status);
                        return { courtId, entries: [] };
                    }

                    const entries: EntryDto[] = await response.json();
                    return { courtId, entries };
                } catch (err) {
                    console.error(`Fehler beim Laden von Platz ${courtId}:`, err);
                    return { courtId, entries: [] };
                }
            });

            const results = await Promise.all(fetchPromises);
            const newCourtBookings: CourtBookings = {};
            results.forEach(result => {
                newCourtBookings[result.courtId] = result.entries;
            });

            setCourtBookings(newCourtBookings);

        } catch (err: any) {
            console.error('Error fetching entries:', err);
            if (err.message === 'UNAUTHORIZED') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setIsAuthenticated(false);
                setCurrentUser(null);
                setError('Sitzung abgelaufen. Bitte neu anmelden.');
            } else {
                setError(err.message);
            }
            setCourtBookings({});
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

            // Prüfe Mitgliedsbeitrag
            if (currentUser && !currentUser.membershipPaid) {
                throw new Error('Ihr Mitgliedsbeitrag ist noch nicht bezahlt. Buchen ist erst möglich, nachdem der Mitgliedsbeitrag beglichen wurde. Bitte wenden Sie sich an den Administrator.');
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
                setCurrentUser(null);
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
                setCurrentUser(null);
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
        if (selectedDate && isAuthenticated) {
            console.log('Datum ausgewählt, lade Buchungen für alle Plätze...');
            fetchEntriesForAllCourts(selectedDate);
        } else {
            setCourtBookings({});
        }
    }, [selectedDate, isAuthenticated]);

    const isTimeBooked = (courtId: number, time: string) => {
        if (!selectedDate || !courtBookings[courtId]) return false;

        const hour = parseInt(time.split(':')[0]);
        const bookingsForCourt = courtBookings[courtId] || [];

        const isBooked = bookingsForCourt.some(entry => entry.startHour === hour);
        return isBooked;
    };

    const isMyBooking = (courtId: number, time: string) => {
        if (!selectedDate || !courtBookings[courtId] || !currentUser) return false;

        const hour = parseInt(time.split(':')[0]);
        const bookingsForCourt = courtBookings[courtId] || [];

        const myBooking = bookingsForCourt.some(entry =>
            entry.startHour === hour &&
            entry.userEmail === currentUser.email
        );

        return myBooking;
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

            console.log('🚀 Starte Buchung mit:', {
                tennisCourtId: selectedCourt,
                entryDate,
                startHour
            });

            await createBooking(selectedCourt, entryDate, startHour);

            console.log('🔄 Lade Buchungen nach Buchung neu...');
            await fetchEntriesForAllCourts(selectedDate);

            alert(`Buchung erfolgreich!\n\nDatum: ${selectedDate.toLocaleDateString("de-DE")}\nPlatz: ${selectedCourt}\nUhrzeit: ${selectedTime}`);

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

            console.log('🔄 Lade Buchungen nach Löschung neu...');
            await fetchEntriesForAllCourts(date);

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

    const handleTimeClick = (courtId: number, time: string) => {
        console.log('🖱️ Zeit geklickt:', { courtId, time });

        if (!isAuthenticated) {
            setError('Bitte anmelden um eine Zeit auszuwählen');
            navigate('/login');
            return;
        }

        // Prüfe Mitgliedsbeitrag
        if (currentUser && !currentUser.membershipPaid) {
            setError('Ihr Mitgliedsbeitrag ist noch nicht bezahlt. Buchen ist erst möglich, nachdem der Mitgliedsbeitrag beglichen wurde.');
            return;
        }

        // Prüfe ob die Zeit verfügbar ist
        const booked = isTimeBooked(courtId, time);
        const myBooking = isMyBooking(courtId, time);

        if (booked && !myBooking) {
            console.log('Zeit ist bereits gebucht - nicht verfügbar');
            setError('Dieser Zeitpunkt ist bereits belegt.');
            return;
        }

        setSelectedCourt(courtId);
        setSelectedTime(time);
        setError(null);
    };

    const getMyBookings = () => {
        if (!selectedDate || !currentUser) return [];

        const allBookings: Array<{courtId: number, entry: EntryDto}> = [];
        courts.forEach(courtId => {
            const bookingsForCourt = courtBookings[courtId] || [];
            bookingsForCourt.forEach(entry => {
                if (entry.userEmail === currentUser.email) {
                    allBookings.push({ courtId, entry });
                }
            });
        });

        return allBookings;
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
                    <div className="error-actions">
                        {error.includes('anmelden') && (
                            <button onClick={handleLoginRedirect} className="inline-login-btn">
                                Jetzt anmelden
                            </button>
                        )}
                        <button onClick={() => setError(null)} className="inline-clear-btn">
                            ✕
                        </button>
                    </div>
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
                        setCourtBookings({});
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

            {selectedDate && isAuthenticated && currentUser?.membershipPaid && (
                <section className="all-courts-section">
                    <h2>2. Verfügbarkeit aller Plätze</h2>
                    <div className="all-courts-container">
                        {courts.map((courtId) => (
                            <div key={courtId} className="court-column">
                                <div className="court-header">
                                    <h3>Platz {courtId}</h3>
                                </div>
                                <div className="court-times">
                                    {hours.map((time) => {
                                        const booked = isTimeBooked(courtId, time);
                                        const myBooking = isMyBooking(courtId, time);
                                        const isSelected = selectedCourt === courtId && selectedTime === time;

                                        return (
                                            <button
                                                key={time}
                                                className={`time-slot ${
                                                    booked && !myBooking
                                                        ? "disabled"
                                                        : myBooking
                                                            ? "my-booking"
                                                            : isSelected
                                                                ? "selected"
                                                                : ""
                                                }`}
                                                onClick={() => handleTimeClick(courtId, time)}
                                                disabled={booked && !myBooking}
                                                title={
                                                    booked && !myBooking
                                                        ? "Belegt"
                                                        : myBooking
                                                            ? "Meine Buchung"
                                                            : "Frei"
                                                }
                                            >
                                                <span className="time-label">{time}</span>
                                                <span className="slot-status">
                                                    {booked && !myBooking ? "❌" :
                                                        myBooking ? "⭐" : "✓"}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {selectedDate && selectedCourt && selectedTime && isAuthenticated && currentUser?.membershipPaid && (
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

            {selectedDate && isAuthenticated && getMyBookings().length > 0 && (
                <section className="my-bookings-section">
                    <h2>Meine Buchungen an {selectedDate.toLocaleDateString("de-DE")}</h2>
                    <div className="my-bookings-list">
                        {getMyBookings().map(({ courtId, entry }) => (
                            <div key={`${courtId}-${entry.startHour}`} className="booking-item">
                                <span>Platz {courtId} • {entry.startHour}:00 Uhr</span>
                                <button
                                    className="delete-booking-btn"
                                    onClick={() => handleDeleteBooking(courtId, selectedDate, `${entry.startHour}:00`)}
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