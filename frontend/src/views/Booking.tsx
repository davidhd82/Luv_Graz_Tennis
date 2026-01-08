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

// Interface für Entry-Types
interface EntryType {
    entryTypeId: number;
    name: string;
    colorClass: string;
    icon: string;
    description: string;
}

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
    const [selectedEntryType, setSelectedEntryType] = useState<number>(1); // Default: Buchung (1)
    const [courtBookings, setCourtBookings] = useState<CourtBookings>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [showEntryTypeSelector, setShowEntryTypeSelector] = useState(false);

    // Definition der Entry-Types mit allen Details
    const entryTypes: EntryType[] = [
        {
            entryTypeId: 1,
            name: "Buchung",
            colorClass: "booking-type",
            icon: "📅",
            description: "Normale Platzbuchung für Mitglieder"
        },
        {
            entryTypeId: 2,
            name: "Kurs",
            colorClass: "course-type",
            icon: "🎓",
            description: "Tennis-Kurs oder Training"
        },
        {
            entryTypeId: 3,
            name: "Turnier",
            colorClass: "tournament-type",
            icon: "🏆",
            description: "Turnier oder Wettkampf"
        },
        {
            entryTypeId: 4,
            name: "Gesperrt",
            colorClass: "locked-type",
            icon: "🔒",
            description: "Platz gesperrt (nicht buchbar)"
        }
    ];

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

    // Funktion zum Ermitteln des Entry-Types für einen Slot
    const getEntryTypeForSlot = (courtId: number, time: string): EntryType | null => {
        if (!selectedDate || !courtBookings[courtId]) return null;

        const hour = parseInt(time.split(':')[0]);
        const bookingsForCourt = courtBookings[courtId] || [];

        const entry = bookingsForCourt.find(entry => entry.startHour === hour);
        if (!entry) return null;

        // Finde den passenden Entry-Type
        return entryTypes.find(type =>
            type.name === entry.entryTypeName ||
            (type.entryTypeId === 4 && entry.entryTypeName === 'Gesperrt')
        ) || null;
    };

    // Prüft ob ein Slot belegt ist (beliebiger Type)
    const isTimeBooked = (courtId: number, time: string) => {
        if (!selectedDate || !courtBookings[courtId]) return false;

        const hour = parseInt(time.split(':')[0]);
        const bookingsForCourt = courtBookings[courtId] || [];

        const isBooked = bookingsForCourt.some(entry => entry.startHour === hour);
        return isBooked;
    };

    // WICHTIG: Prüft ob es eine Buchung (Type 1) vom aktuellen User ist
    const isMyBooking = (courtId: number, time: string) => {
        if (!selectedDate || !courtBookings[courtId] || !currentUser) return false;

        const hour = parseInt(time.split(':')[0]);
        const bookingsForCourt = courtBookings[courtId] || [];

        const myBooking = bookingsForCourt.some(entry =>
            entry.startHour === hour &&
            entry.userEmail === currentUser.email &&
            entry.entryTypeName === 'Buchung'
        );

        return myBooking;
    };

    // Prüft ob es eine Buchung von einem ANDEREN User ist (nur Type 1)
    const isOtherUsersBooking = (courtId: number, time: string) => {
        if (!selectedDate || !courtBookings[courtId] || !currentUser) return false;

        const hour = parseInt(time.split(':')[0]);
        const bookingsForCourt = courtBookings[courtId] || [];

        const otherBooking = bookingsForCourt.some(entry =>
            entry.startHour === hour &&
            entry.userEmail !== currentUser.email &&
            entry.entryTypeName === 'Buchung'
        );

        return otherBooking;
    };

    // Prüft ob der Slot gesperrt ist (Type 4: Gesperrt)
    const isTimeLocked = (courtId: number, time: string) => {
        const entryType = getEntryTypeForSlot(courtId, time);
        return entryType?.entryTypeId === 4;
    };

    // Prüft ob es ein Kurs (Type 2) ist
    const isCourse = (courtId: number, time: string) => {
        const entryType = getEntryTypeForSlot(courtId, time);
        return entryType?.entryTypeId === 2;
    };

    // Prüft ob es ein Turnier (Type 3) ist
    const isTournament = (courtId: number, time: string) => {
        const entryType = getEntryTypeForSlot(courtId, time);
        return entryType?.entryTypeId === 3;
    };

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

            // Prüfe Mitgliedsbeitrag (nur für normale Buchungen)
            if (currentUser && !currentUser.membershipPaid && selectedEntryType === 1) {
                throw new Error('Ihr Mitgliedsbeitrag ist noch nicht bezahlt. Buchen ist erst möglich, nachdem der Mitgliedsbeitrag beglichen wurde. Bitte wenden Sie sich an den Administrator.');
            }

            // Prüfe ob der Slot bereits belegt ist
            const booked = isTimeBooked(tennisCourtId, `${startHour}:00`);
            if (booked) {
                throw new Error('Dieser Platz ist für diese Stunde bereits belegt.');
            }

            // Für Nicht-Admins: Nur Buchung (Type 1) erlauben
            if (!currentUser?.isAdmin && selectedEntryType !== 1) {
                throw new Error('Nur Administratoren können Kurse, Turniere oder Sperrungen erstellen.');
            }

            const request: CreateEntryRequest = {
                entryDate: entryDate,
                startHour: startHour,
                tennisCourtId: tennisCourtId,
                entryTypeId: selectedEntryType
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
                startHour,
                entryTypeId: selectedEntryType
            });

            await createBooking(selectedCourt, entryDate, startHour);

            console.log('🔄 Lade Buchungen nach Buchung neu...');
            await fetchEntriesForAllCourts(selectedDate);

            const entryTypeName = entryTypes.find(t => t.entryTypeId === selectedEntryType)?.name || 'Buchung';
            const entryTypeIcon = entryTypes.find(t => t.entryTypeId === selectedEntryType)?.icon || '📅';

            alert(`${entryTypeIcon} ${entryTypeName} erfolgreich erstellt!\n\nDatum: ${selectedDate.toLocaleDateString("de-DE")}\nPlatz: ${selectedCourt}\nUhrzeit: ${selectedTime}`);

            // Zurücksetzen auf Buchung (Type 1) nach erfolgreicher Buchung
            if (currentUser?.isAdmin) {
                setSelectedEntryType(1);
            }
            setSelectedCourt(null);
            setSelectedTime(null);
            setShowEntryTypeSelector(false);

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

        // Prüfe ob der Slot gesperrt ist
        const locked = isTimeLocked(courtId, time);
        if (locked) {
            setError('Dieser Platz ist für diese Stunde gesperrt.');
            return;
        }

        // Prüfe ob es ein Kurs oder Turnier ist
        const course = isCourse(courtId, time);
        const tournament = isTournament(courtId, time);
        if (course || tournament) {
            setError('Dieser Platz ist für einen Kurs/Turnier reserviert.');
            return;
        }

        // Prüfe ob der Slot durch andere User belegt ist
        const otherBooking = isOtherUsersBooking(courtId, time);
        if (otherBooking) {
            setError('Dieser Zeitpunkt ist bereits durch einen anderen Benutzer gebucht.');
            return;
        }

        // Prüfe ob es deine eigene Buchung ist
        const myBooking = isMyBooking(courtId, time);
        if (myBooking) {
            // Eigene Buchung kann gelöscht werden, nicht neu gebucht
            setError('Dies ist deine eigene Buchung. Du kannst sie löschen, aber nicht neu buchen.');
            return;
        }

        setSelectedCourt(courtId);
        setSelectedTime(time);

        // Für Admins: Entry-Type Selector anzeigen, für normale User direkt Type 1 setzen
        if (currentUser?.isAdmin) {
            setShowEntryTypeSelector(true);
        } else {
            setSelectedEntryType(1); // Immer Buchung für normale User
            setShowEntryTypeSelector(false);
        }

        setError(null);
    };

    const getMyBookings = () => {
        if (!selectedDate || !currentUser) return [];

        const allBookings: Array<{courtId: number, entry: EntryDto}> = [];
        courts.forEach(courtId => {
            const bookingsForCourt = courtBookings[courtId] || [];
            bookingsForCourt.forEach(entry => {
                if (entry.userEmail === currentUser.email && entry.entryTypeName === 'Buchung') {
                    allBookings.push({ courtId, entry });
                }
            });
        });

        return allBookings;
    };

    // Get the current entry type
    const getCurrentEntryType = () => {
        return entryTypes.find(t => t.entryTypeId === selectedEntryType) || entryTypes[0];
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
                        setShowEntryTypeSelector(false);
                        setSelectedEntryType(1);
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
                                        const locked = isTimeLocked(courtId, time);
                                        const course = isCourse(courtId, time);
                                        const tournament = isTournament(courtId, time);
                                        const myBooking = isMyBooking(courtId, time);
                                        const otherBooking = isOtherUsersBooking(courtId, time);
                                        const isSelected = selectedCourt === courtId && selectedTime === time;

                                        // Bestimme die CSS-Klasse basierend auf Status
                                        let typeClass = "";
                                        let titleText = "";
                                        let icon = "✓";

                                        if (locked) {
                                            typeClass = "locked-type";
                                            titleText = "🔒 Gesperrt";
                                            icon = "🔒";
                                        } else if (course) {
                                            typeClass = "course-type";
                                            titleText = "🎓 Kurs";
                                            icon = "🎓";
                                        } else if (tournament) {
                                            typeClass = "tournament-type";
                                            titleText = "🏆 Turnier";
                                            icon = "🏆";
                                        } else if (myBooking) {
                                            typeClass = "my-booking";
                                            titleText = "⭐ Meine Buchung";
                                            icon = "⭐";
                                        } else if (otherBooking) {
                                            typeClass = "other-booking";
                                            titleText = "❌ Durch andere gebucht";
                                            icon = "❌";
                                        } else if (isSelected) {
                                            typeClass = "selected";
                                            titleText = "✓ Ausgewählt";
                                            icon = "✓";
                                        }

                                        return (
                                            <button
                                                key={time}
                                                className={`time-slot ${typeClass}`}
                                                onClick={() => handleTimeClick(courtId, time)}
                                                disabled={locked || course || tournament || otherBooking || myBooking}
                                                title={titleText}
                                            >
                                                <span className="time-label">{time}</span>
                                                <span className="slot-status">
                                                    {icon}
                                                </span>
                                                {typeClass && (
                                                    <span className="slot-status-text">
                                                        {locked ? "Gesperrt" :
                                                            course ? "Kurs" :
                                                                tournament ? "Turnier" :
                                                                    myBooking ? "Meine Buchung" :
                                                                        otherBooking ? "Belegt" : ""}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* VERBESSERTER ENTRY-TYPE SELECTOR FÜR ADMINS */}
            {showEntryTypeSelector && currentUser?.isAdmin && selectedCourt && selectedTime && (
                <div className="entry-type-selector">
                    <h3>📋 Buchungstyp auswählen für Platz {selectedCourt} um {selectedTime}</h3>
                    <p className="selector-description">
                        Wählen Sie den Typ der Buchung aus:
                    </p>

                    <div className="entry-type-options">
                        {entryTypes.map((type) => (
                            <div
                                key={type.entryTypeId}
                                className={`entry-type-card ${selectedEntryType === type.entryTypeId ? 'selected' : ''}`}
                                onClick={() => setSelectedEntryType(type.entryTypeId)}
                            >
                                <div className={`entry-type-icon ${type.colorClass}`}>
                                    {type.icon}
                                </div>
                                <div className="entry-type-content">
                                    <h4>{type.name}</h4>
                                    <p>{type.description}</p>
                                </div>
                                <div className="entry-type-radio">
                                    <input
                                        type="radio"
                                        name="entryType"
                                        checked={selectedEntryType === type.entryTypeId}
                                        onChange={() => setSelectedEntryType(type.entryTypeId)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="selected-entry-type-info">
                        <div className="current-selection">
                            <span className="selection-icon">
                                {getCurrentEntryType().icon}
                            </span>
                            <div>
                                <strong>Aktuell ausgewählt:</strong>
                                <div className="selection-name">{getCurrentEntryType().name}</div>
                                <div className="selection-description">{getCurrentEntryType().description}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Buchungsbestätigung */}
            {selectedDate && selectedCourt && selectedTime && isAuthenticated && currentUser?.membershipPaid && (
                <footer className="footer">
                    <div className="booking-summary">
                        <h3>Buchungsübersicht</h3>
                        <div className="summary-details">
                            <div className="summary-item">
                                <span className="summary-label">Datum:</span>
                                <span className="summary-value">{selectedDate.toLocaleDateString("de-DE")}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Platz:</span>
                                <span className="summary-value">{selectedCourt}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Uhrzeit:</span>
                                <span className="summary-value">{selectedTime}</span>
                            </div>
                            {currentUser?.isAdmin && (
                                <div className="summary-item">
                                    <span className="summary-label">Typ:</span>
                                    <span className={`summary-value ${getCurrentEntryType().colorClass}`}>
                                        {getCurrentEntryType().icon} {getCurrentEntryType().name}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        className="confirm-btn"
                        onClick={handleBooking}
                        disabled={loading}
                        style={{
                            backgroundColor: currentUser?.isAdmin
                                ? getCurrentEntryType().colorClass === 'booking-type' ? '#10b981'
                                    : getCurrentEntryType().colorClass === 'course-type' ? '#f97316'
                                        : getCurrentEntryType().colorClass === 'tournament-type' ? '#a855f7'
                                            : '#3b82f6'
                                : '#10b981'
                        }}
                    >
                        {loading ? 'Wird erstellt...' :
                            currentUser?.isAdmin
                                ? `${getCurrentEntryType().icon} ${getCurrentEntryType().name} erstellen`
                                : '📅 Jetzt buchen'}
                    </button>

                    {currentUser?.isAdmin && (
                        <button
                            className="cancel-selector-btn"
                            onClick={() => {
                                setSelectedCourt(null);
                                setSelectedTime(null);
                                setShowEntryTypeSelector(false);
                                setSelectedEntryType(1);
                            }}
                        >
                            Auswahl abbrechen
                        </button>
                    )}
                </footer>
            )}

            {selectedDate && isAuthenticated && getMyBookings().length > 0 && (
                <section className="my-bookings-section">
                    <h2>📋 Meine Buchungen an {selectedDate.toLocaleDateString("de-DE")}</h2>
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