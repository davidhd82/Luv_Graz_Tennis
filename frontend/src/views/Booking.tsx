import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useNavigate } from 'react-router-dom';
import "../css/Booking.css";
import { colors } from "@mui/material";

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
    entryId?: number;
}

interface CreateEntryRequest {
    entryDate: string;
    startHour: number;
    tennisCourtId: number;
    entryTypeId: number;
}

interface UpdateEntryRequest {
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
    const [selectedEntryType, setSelectedEntryType] = useState<number>(1);
    const [courtBookings, setCourtBookings] = useState<CourtBookings>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [showEntryTypeSelector, setShowEntryTypeSelector] = useState(false);
    const [editingExistingEntry, setEditingExistingEntry] = useState<EntryDto | null>(null);

    const entryTypes: EntryType[] = [
        {
            entryTypeId: 1,
            name: "Buchung",
            colorClass: "booking-type",
            icon: "B",
            description: "Platzbuchung für Mitglieder"
        },
        {
            entryTypeId: 2,
            name: "Kurs",
            colorClass: "course-type",
            icon: "K",
            description: "Tennis-Kurs"
        },
        {
            entryTypeId: 3,
            name: "Turnier",
            colorClass: "tournament-type",
            icon: "T",
            description: "Turnier"
        },
        {
            entryTypeId: 4,
            name: "Gesperrt",
            colorClass: "locked-type",
            icon: "G",
            description: "Platz gesperrt (nicht buchbar)"
        }
    ];

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

    const getEntryTypeForSlot = (courtId: number, time: string): EntryType | null => {
        if (!selectedDate || !courtBookings[courtId]) return null;
        const hour = parseInt(time.split(':')[0]);
        const bookingsForCourt = courtBookings[courtId] || [];
        const entry = bookingsForCourt.find(entry => entry.startHour === hour);
        if (!entry) return null;
        return entryTypes.find(type =>
            type.name === entry.entryTypeName ||
            (type.entryTypeId === 4 && entry.entryTypeName === 'Gesperrt')
        ) || null;
    };

    const getEntryForSlot = (courtId: number, time: string): EntryDto | null => {
        if (!selectedDate || !courtBookings[courtId]) return null;
        const hour = parseInt(time.split(':')[0]);
        const bookingsForCourt = courtBookings[courtId] || [];
        return bookingsForCourt.find(entry => entry.startHour === hour) || null;
    };

    const isTimeBooked = (courtId: number, time: string) => {
        if (!selectedDate || !courtBookings[courtId]) return false;
        const hour = parseInt(time.split(':')[0]);
        const bookingsForCourt = courtBookings[courtId] || [];
        return bookingsForCourt.some(entry => entry.startHour === hour);
    };

    const isMyBooking = (courtId: number, time: string) => {
        if (!selectedDate || !courtBookings[courtId] || !currentUser) return false;
        const hour = parseInt(time.split(':')[0]);
        const bookingsForCourt = courtBookings[courtId] || [];
        return bookingsForCourt.some(entry =>
            entry.startHour === hour &&
            entry.userEmail === currentUser.email &&
            entry.entryTypeName === 'Buchung'
        );
    };

    const isOtherUsersBooking = (courtId: number, time: string) => {
        if (!selectedDate || !courtBookings[courtId] || !currentUser) return false;
        const hour = parseInt(time.split(':')[0]);
        const bookingsForCourt = courtBookings[courtId] || [];
        return bookingsForCourt.some(entry =>
            entry.startHour === hour &&
            entry.userEmail !== currentUser.email &&
            entry.entryTypeName === 'Buchung'
        );
    };

    const isTimeLocked = (courtId: number, time: string) => {
        const entryType = getEntryTypeForSlot(courtId, time);
        return entryType?.entryTypeId === 4;
    };

    const isCourse = (courtId: number, time: string) => {
        const entryType = getEntryTypeForSlot(courtId, time);
        return entryType?.entryTypeId === 2;
    };

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

            const fetchPromises = courts.map(async (courtId) => {
                try {
                    const response = await fetch(`http://localhost:8080/api/entries/${courtId}/${dateKey}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.status === 401) throw new Error('UNAUTHORIZED');
                    if (!response.ok) return { courtId, entries: [] };

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

    const createOrUpdateEntry = async (tennisCourtId: number, entryDate: string, startHour: number) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Bitte melden Sie sich an um zu buchen');

            if (currentUser && !currentUser.isAdmin && !currentUser.membershipPaid && selectedEntryType === 1) {
                throw new Error('Ihr Mitgliedsbeitrag ist noch nicht bezahlt.');
            }

            if (!currentUser?.isAdmin && selectedEntryType !== 1) {
                throw new Error('Nur Administratoren können Kurse, Turniere oder Sperrungen erstellen.');
            }

            const request: CreateEntryRequest = {
                entryDate: entryDate,
                startHour: startHour,
                tennisCourtId: tennisCourtId,
                entryTypeId: selectedEntryType
            };

            let response: Response;
            let method = 'POST';
            let url = 'http://localhost:8080/api/entries';

            if (editingExistingEntry && editingExistingEntry.entryId) {
                const updateRequest: UpdateEntryRequest = { entryTypeId: selectedEntryType };
                method = 'PUT';
                url = `http://localhost:8080/api/entries/${editingExistingEntry.entryId}`;
                response = await fetch(url, {
                    method: method,
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updateRequest),
                });
            } else {
                const booked = isTimeBooked(tennisCourtId, `${startHour}:00`);
                if (!currentUser?.isAdmin && booked) {
                    throw new Error('Dieser Platz ist für diese Stunde bereits belegt.');
                }

                if (currentUser?.isAdmin && booked) {
                    const existingEntry = getEntryForSlot(tennisCourtId, `${startHour}:00`);
                    if (existingEntry) {
                        await deleteBooking(tennisCourtId, entryDate, startHour);
                    }
                }

                response = await fetch(url, {
                    method: method,
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(request),
                });
            }

            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setIsAuthenticated(false);
                setCurrentUser(null);
                throw new Error('Sitzung abgelaufen. Bitte neu anmelden.');
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Buchung fehlgeschlagen');
            }

            return await response.json();
        } catch (err: any) {
            throw new Error(err.message);
        }
    };

    const deleteBooking = async (courtId: number, date: string, hour: number) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Nicht eingeloggt');

            const entries = courtBookings[courtId] || [];
            const entryToDelete = entries.find(entry =>
                entry.startHour === hour &&
                formatDateKey(selectedDate!) === date
            );

            let response;
            if (entryToDelete?.entryId) {
                response = await fetch(`http://localhost:8080/api/entries/${entryToDelete.entryId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
            } else {
                response = await fetch(`http://localhost:8080/api/entries/${courtId}/${date}/${hour}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
            }

            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setIsAuthenticated(false);
                setCurrentUser(null);
                throw new Error('Sitzung abgelaufen.');
            }

            if (!response.ok) throw new Error('Löschen fehlgeschlagen');
        } catch (err: any) {
            throw new Error(err.message);
        }
    };

    useEffect(() => {
        if (selectedDate && isAuthenticated) {
            fetchEntriesForAllCourts(selectedDate);
        } else {
            setCourtBookings({});
        }
    }, [selectedDate, isAuthenticated]);

    const handleBooking = async () => {
        if (!selectedDate || !selectedCourt || !selectedTime) return;
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        try {
            setLoading(true);
            const startHour = parseInt(selectedTime.split(':')[0]);
            const entryDate = formatDateKey(selectedDate);

            await createOrUpdateEntry(selectedCourt, entryDate, startHour);
            await fetchEntriesForAllCourts(selectedDate);

            const entryTypeName = entryTypes.find(t => t.entryTypeId === selectedEntryType)?.name || 'Buchung';
            const action = editingExistingEntry ? 'aktualisiert' : 'erstellt';
            alert(`${entryTypeName} erfolgreich ${action}!`);

            resetSelection();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetSelection = () => {
        setSelectedCourt(null);
        setSelectedTime(null);
        setShowEntryTypeSelector(false);
        setEditingExistingEntry(null);
        if (currentUser?.isAdmin) setSelectedEntryType(1);
    };

    const handleDeleteBooking = async (courtId: number, date: Date, time: string) => {
        try {
            setLoading(true);
            const hour = parseInt(time.split(':')[0]);
            const dateKey = formatDateKey(date);

            await deleteBooking(courtId, dateKey, hour);
            await fetchEntriesForAllCourts(date);

            alert('Eintrag erfolgreich gelöscht!');

            if (selectedCourt === courtId && selectedTime === time) {
                resetSelection();
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLoginRedirect = () => navigate('/login');

    const handleTimeClick = (courtId: number, time: string) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (currentUser?.isAdmin) {
            setSelectedCourt(courtId);
            setSelectedTime(time);
            const existingEntry = getEntryForSlot(courtId, time);
            setEditingExistingEntry(existingEntry || null);

            if (existingEntry) {
                const entryType = entryTypes.find(type =>
                    type.name === existingEntry.entryTypeName ||
                    (type.entryTypeId === 4 && existingEntry.entryTypeName === 'Gesperrt')
                );
                setSelectedEntryType(entryType?.entryTypeId || 1);
            } else {
                setSelectedEntryType(1);
            }

            setShowEntryTypeSelector(true);
            return;
        }

        if (isTimeLocked(courtId, time)) {
            setError('Dieser Platz ist für diese Stunde gesperrt.');
            return;
        }

        if (isCourse(courtId, time) || isTournament(courtId, time)) {
            setError('Dieser Platz ist für einen Kurs/Turnier reserviert.');
            return;
        }

        if (isOtherUsersBooking(courtId, time)) {
            setError('Dieser Zeitpunkt ist bereits durch einen anderen Benutzer gebucht.');
            return;
        }

        if (isMyBooking(courtId, time)) {
            setError('Dies ist deine eigene Buchung. Du kannst sie löschen, aber nicht neu buchen.');
            return;
        }

        setSelectedCourt(courtId);
        setSelectedTime(time);
        setShowEntryTypeSelector(false);
        setSelectedEntryType(1);
        setEditingExistingEntry(null);
    };

    // Meine Buchungen
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

    // Kurse
    const getCourses = () => {
        if (!selectedDate) return [];
        const courses: Array<{courtId: number, entry: EntryDto}> = [];
        courts.forEach(courtId => {
            const bookingsForCourt = courtBookings[courtId] || [];
            bookingsForCourt.forEach(entry => {
                if (entry.entryTypeName === 'Kurs') {
                    courses.push({ courtId, entry });
                }
            });
        });
        return courses;
    };

    // Turniere
    const getTournaments = () => {
        if (!selectedDate) return [];
        const tournaments: Array<{courtId: number, entry: EntryDto}> = [];
        courts.forEach(courtId => {
            const bookingsForCourt = courtBookings[courtId] || [];
            bookingsForCourt.forEach(entry => {
                if (entry.entryTypeName === 'Turnier') {
                    tournaments.push({ courtId, entry });
                }
            });
        });
        return tournaments;
    };

    // Platzsperrungen
    const getLockedCourts = () => {
        if (!selectedDate) return [];
        const locked: Array<{courtId: number, entry: EntryDto}> = [];
        courts.forEach(courtId => {
            const bookingsForCourt = courtBookings[courtId] || [];
            bookingsForCourt.forEach(entry => {
                if (entry.entryTypeName === 'Gesperrt') {
                    locked.push({ courtId, entry });
                }
            });
        });
        return locked;
    };

    const getCurrentEntryType = () => {
        return entryTypes.find(t => t.entryTypeId === selectedEntryType) || entryTypes[0];
    };

    return (
        <div className="page">
            <header className="header">
                <h1>Tennis Luv – Terminbuchung</h1>
                {currentUser?.isAdmin && (
                    <span className="admin-badge">Administrator Modus</span>
                )}
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
                            X
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
                        setSelectedDate(date as Date);
                        resetSelection();
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
                        <table className="courts-table">
                            <thead>
                            <tr className="table-header-row">
                                <th className="table-header">Platz</th>
                                {hours.map((time) => (
                                    <th key={time} className="table-header">
                                        {time}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {courts.map((courtId) => (
                                <tr key={courtId}>
                                    <td className="court-label-cell">
                                        <div className="court-label">
                                            Platz {courtId}
                                        </div>
                                    </td>
                                    {hours.map((time) => {
                                        const locked = isTimeLocked(courtId, time);
                                        const course = isCourse(courtId, time);
                                        const tournament = isTournament(courtId, time);
                                        const myBooking = isMyBooking(courtId, time);
                                        const otherBooking = isOtherUsersBooking(courtId, time);
                                        const isSelected = selectedCourt === courtId && selectedTime === time;

                                        let typeClass = "";
                                        let titleText = "";
                                        let icon = "Frei";

                                        if (locked) {
                                            typeClass = "locked-type";
                                            titleText = "Gesperrt";
                                            icon = "G";
                                        } else if (course) {
                                            typeClass = "course-type";
                                            titleText = "Kurs";
                                            icon = "K";
                                        } else if (tournament) {
                                            typeClass = "tournament-type";
                                            titleText = "Turnier";
                                            icon = "T";
                                        } else if (myBooking) {
                                            typeClass = "my-booking";
                                            titleText = "Meine Buchung";
                                            icon = "B";
                                        } else if (otherBooking) {
                                            typeClass = "other-booking";
                                            titleText = "Durch andere gebucht";
                                            icon = "B";
                                        } else if (isSelected) {
                                            typeClass = "selected";
                                            titleText = "Ausgewählt";
                                            icon = "✓";
                                        }

                                        return (
                                            <td key={time} className="time-slot-cell">
                                                <button
                                                    className={`time-slot ${typeClass} ${currentUser?.isAdmin ? 'admin-clickable' : ''}`}
                                                    onClick={() => handleTimeClick(courtId, time)}
                                                    disabled={!currentUser?.isAdmin && (locked || course || tournament || otherBooking || myBooking)}
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
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {showEntryTypeSelector && currentUser?.isAdmin && selectedCourt && selectedTime && (
                <div className="entry-type-selector">
                    <h3>{editingExistingEntry ? 'Eintrag bearbeiten' : 'Neuen Eintrag erstellen'}</h3>
                    <p className="selector-description">
                        {editingExistingEntry ?
                            `Bearbeite Platz ${selectedCourt} um ${selectedTime} (Aktuell: ${editingExistingEntry.entryTypeName})` :
                            `Wählen Sie den Typ für Platz ${selectedCourt} um ${selectedTime}:`
                        }
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

                    <div className="slots">
                        <button
                            className="confirm-btn"
                            onClick={handleBooking}
                            disabled={loading}
                        >
                            {loading ? 'Wird verarbeitet...' :
                                editingExistingEntry ?
                                    `${getCurrentEntryType().name} aktualisieren` :
                                    `${getCurrentEntryType().name} erstellen`}
                        </button>

                        {editingExistingEntry && (
                            <button
                                className="delete-admin-btn"
                                onClick={() => handleDeleteBooking(selectedCourt!, selectedDate!, selectedTime!)}
                                disabled={loading}
                            >
                                Löschen
                            </button>
                        )}

                        <button
                            className="cancel-selector-btn"
                            onClick={resetSelection}
                        >
                            Abbrechen
                        </button>
                    </div>
                </div>
            )}

            {selectedDate && selectedCourt && selectedTime && isAuthenticated && currentUser?.membershipPaid && !currentUser?.isAdmin && (
                <div className="slots">
                    <h2>Buchungsbestätigung</h2>
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
                        </div>
                    </div>

                    <button
                        className="confirm-btn"
                        onClick={handleBooking}
                        disabled={loading}
                    >
                        {loading ? 'Wird erstellt...' : 'Jetzt buchen'}
                    </button>

                    <button
                        className="cancel-selector-btn"
                        onClick={resetSelection}
                    >
                        Auswahl abbrechen
                    </button>
                </div>
            )}

            {/* MEINE BUCHUNGEN - Original bleibt */}
            {selectedDate && isAuthenticated && getMyBookings().length > 0 && (
                <section className="my-bookings-section">
                    <h2>Meine Buchungen an {selectedDate.toLocaleDateString("de-DE")}</h2>
                    <div className="my-bookings-list">
                        {getMyBookings().map(({ courtId, entry }) => (
                            <div key={`${courtId}-${entry.startHour}`} className="booking-item">
                                <span>Platz {courtId} • {entry.startHour}:00 Uhr</span>
                                <button
                                    className="delete-booking-btn"
                                    onClick={() => handleDeleteBooking(courtId, selectedDate!, `${entry.startHour}:00`)}
                                    disabled={loading}
                                >
                                    Löschen
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {selectedDate && isAuthenticated && currentUser?.isAdmin && getCourses().length > 0 && (
                <section className="my-bookings-section">
                    <h2>Kurse am {selectedDate.toLocaleDateString("de-DE")}</h2>
                    <div className="my-bookings-list">
                        {getCourses().map(({ courtId, entry }) => (
                            <div key={`${courtId}-${entry.startHour}`} className="booking-item course-item">
                                <span>Platz {courtId} • {entry.startHour}:00 Uhr</span>
                                <div>
                                    <button
                                        className="delete-booking-btn"
                                        onClick={() => handleDeleteBooking(courtId, selectedDate!, `${entry.startHour}:00`)}
                                        disabled={loading}
                                    >
                                        Löschen
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {selectedDate && isAuthenticated && currentUser?.isAdmin && getTournaments().length > 0 && (
                <section className="my-bookings-section">
                    <h2>Turniere am {selectedDate.toLocaleDateString("de-DE")}</h2>
                    <div className="my-bookings-list">
                        {getTournaments().map(({ courtId, entry }) => (
                            <div key={`${courtId}-${entry.startHour}`} className="booking-item tournament-item">
                                <span>Platz {courtId} • {entry.startHour}:00 Uhr</span>
                                <div>
                                    <button
                                        className="delete-booking-btn"
                                        onClick={() => handleDeleteBooking(courtId, selectedDate!, `${entry.startHour}:00`)}
                                        disabled={loading}
                                    >
                                        Löschen
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {selectedDate && isAuthenticated && currentUser?.isAdmin && getLockedCourts().length > 0 && (
                <section className="my-bookings-section">
                    <h2>Platzsperrungen am {selectedDate.toLocaleDateString("de-DE")}</h2>
                    <div className="my-bookings-list">
                        {getLockedCourts().map(({ courtId, entry }) => (
                            <div key={`${courtId}-${entry.startHour}`} className="booking-item locked-item">
                                <span>Platz {courtId} • {entry.startHour}:00 Uhr</span>
                                <div>
                                    <button
                                        className="delete-booking-btn"
                                        onClick={() => handleDeleteBooking(courtId, selectedDate!, `${entry.startHour}:00`)}
                                        disabled={loading}
                                    >
                                        Löschen
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}