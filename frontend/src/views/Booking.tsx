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
    userFirstName?: string; // NEU: Optional
    userLastName?: string; // NEU: Optional
}

// NEU: Interface für erweiterte Buchungsinformationen
interface BookingDetails {
    email: string;
    firstName: string;
    lastName: string;
}

interface CreateEntryRequest {
    entryDate: string;
    startHour: number;
    endHour: number;
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
    maxDailyBookingHours: number;
}

interface SelectedSlot {
    courtId: number;
    time: string;
    hour: number;
}

export default function BookingPage() {
    const navigate = useNavigate();

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([]);
    const [selectedEntryType, setSelectedEntryType] = useState<number>(1);
    const [courtBookings, setCourtBookings] = useState<CourtBookings>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [showEntryTypeSelector, setShowEntryTypeSelector] = useState(false);
    const [editingExistingEntry, setEditingExistingEntry] = useState<EntryDto | null>(null);
    const [bookedHoursToday, setBookedHoursToday] = useState<number>(0);
    const [availableHoursToday, setAvailableHoursToday] = useState<number>(0);
    // NEU: State für erweiterte Buchungsdetails
    const [bookingDetails, setBookingDetails] = useState<{[key: string]: BookingDetails}>({});

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
                    membershipPaid: userData.membershipPaid || false,
                    maxDailyBookingHours: userData.maxDailyBookingHours || 2
                };

                setCurrentUser(user);
                setIsAuthenticated(true);
                localStorage.setItem('user', JSON.stringify({
                    userId: user.userId,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    isAdmin: user.isAdmin,
                    membershipPaid: user.membershipPaid,
                    maxDailyBookingHours: user.maxDailyBookingHours
                }));

                setAvailableHoursToday(user.maxDailyBookingHours);
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

        if (!token || !userStr) {
            navigate('/login');
            return;
        }

        const userData = JSON.parse(userStr);

        if (!userData.isAdmin && !userData.membershipPaid) {
            alert('Ihr Mitgliedsbeitrag ist noch nicht bezahlt. Bitte bezahlen Sie zuerst Ihren Beitrag, um Plätze buchen zu können.');
            navigate('/');
            return;
        }

        if (token && userStr) {
            const userData = JSON.parse(userStr);
            setCurrentUser({
                userId: userData.userId || userData.id,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                isAdmin: userData.isAdmin || userData.admin || false,
                enabled: userData.enabled || true,
                membershipPaid: userData.membershipPaid || false,
                maxDailyBookingHours: userData.maxDailyBookingHours || 2
            });
            setIsAuthenticated(true);
            setAvailableHoursToday(userData.maxDailyBookingHours || 2);
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

    // NEU: Funktion um Buchungsdetails für einen Slot zu erhalten
    const getBookingDetails = (courtId: number, time: string): BookingDetails | null => {
        if (!selectedDate || !courtBookings[courtId]) return null;
        const hour = parseInt(time.split(':')[0]);
        const bookingsForCourt = courtBookings[courtId] || [];
        const entry = bookingsForCourt.find(entry => entry.startHour === hour);

        if (!entry || entry.entryTypeName !== 'Buchung') return null;

        const firstName = entry.userFirstName || entry.userEmail.split('@')[0];
        const lastName = entry.userLastName || "";

        let initials = "";
        if (firstName && lastName) {
            initials = `${firstName.charAt(0)}.${lastName.charAt(0)}.`;
        } else if (firstName) {
            initials = `${firstName.charAt(0)}.`;
        } else {
            initials = entry.userEmail.split('@')[0].substring(0, 3);
        }

        return {
            email: entry.userEmail,
            firstName: firstName,
            lastName: lastName,
            initials: initials
        };
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
            calculateBookedHours(newCourtBookings, dateKey);
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
            setBookedHoursToday(0);
        } finally {
            setLoading(false);
        }
    };

    const calculateBookedHours = (bookings: CourtBookings, dateKey: string) => {
        if (!currentUser) {
            setBookedHoursToday(0);
            return;
        }

        let totalBookedHours = 0;
        Object.values(bookings).forEach(entries => {
            entries.forEach(entry => {
                if (entry.userEmail === currentUser.email &&
                    entry.entryTypeName === 'Buchung' &&
                    entry.entryDate === dateKey) {
                    totalBookedHours++;
                }
            });
        });

        setBookedHoursToday(totalBookedHours);

        if (currentUser.isAdmin) {
            setAvailableHoursToday(999);
        } else {
            const userLimit = currentUser.maxDailyBookingHours;
            const available = Math.max(0, userLimit - totalBookedHours);
            setAvailableHoursToday(available);
        }
    };

    const areSlotsConsecutive = (slots: SelectedSlot[]): boolean => {
        if (slots.length <= 1) return true;

        const sortedSlots = [...slots].sort((a, b) => a.hour - b.hour);

        for (let i = 1; i < sortedSlots.length; i++) {
            if (sortedSlots[i].hour !== sortedSlots[i-1].hour + 1) {
                return false;
            }
        }

        return true;
    };

    const createOrUpdateEntry = async (courtId: number, date: string, slots: SelectedSlot[]) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Bitte melden Sie sich an um zu buchen');

            if (currentUser && !currentUser.isAdmin && !currentUser.membershipPaid && selectedEntryType === 1) {
                throw new Error('Ihr Mitgliedsbeitrag ist noch nicht bezahlt.');
            }

            if (!currentUser?.isAdmin && selectedEntryType !== 1) {
                throw new Error('Nur Administratoren können Kurse, Turniere oder Sperrungen erstellen.');
            }

            if (!areSlotsConsecutive(slots)) {
                throw new Error('Die ausgewählten Stunden müssen nebeneinander liegen!');
            }

            const sortedSlots = [...slots].sort((a, b) => a.hour - b.hour);
            const startHour = sortedSlots[0].hour;
            const endHour = sortedSlots[sortedSlots.length - 1].hour + 1;

            const request: CreateEntryRequest = {
                entryDate: date,
                startHour: startHour,
                endHour: endHour,
                tennisCourtId: courtId,
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
                if (!currentUser?.isAdmin) {
                    for (const slot of slots) {
                        if (isTimeBooked(courtId, slot.time)) {
                            throw new Error(`Platz ${courtId} um ${slot.time} ist bereits belegt.`);
                        }
                    }
                }

                if (currentUser?.isAdmin) {
                    for (const slot of slots) {
                        const existingEntry = getEntryForSlot(courtId, slot.time);
                        if (existingEntry) {
                            await deleteBooking(courtId, date, slot.hour);
                        }
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

            if (response.status === 409) {
                throw new Error('Tägliches Buchungslimit erreicht');
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

            if (selectedDate) {
                const newBookedHours = Math.max(0, bookedHoursToday - 1);
                setBookedHoursToday(newBookedHours);

                if (currentUser && !currentUser.isAdmin) {
                    const userLimit = currentUser.maxDailyBookingHours;
                    const newAvailableHours = Math.max(0, userLimit - newBookedHours);
                    setAvailableHoursToday(newAvailableHours);
                }
            }
        } catch (err: any) {
            throw new Error(err.message);
        }
    };

    useEffect(() => {
        if (selectedDate && isAuthenticated) {
            fetchEntriesForAllCourts(selectedDate);
        } else {
            setCourtBookings({});
            setBookedHoursToday(0);
            if (currentUser) {
                if (currentUser.isAdmin) {
                    setAvailableHoursToday(999);
                } else {
                    setAvailableHoursToday(currentUser.maxDailyBookingHours);
                }
            } else {
                setAvailableHoursToday(2);
            }
        }
    }, [selectedDate, isAuthenticated]);

    const updateAvailableHoursAfterBooking = (numberOfBookings: number) => {
        if (currentUser?.isAdmin) return;

        const newBookedHours = bookedHoursToday + numberOfBookings;
        setBookedHoursToday(newBookedHours);

        const userLimit = currentUser?.maxDailyBookingHours || 2;
        const newAvailableHours = Math.max(0, userLimit - newBookedHours);
        setAvailableHoursToday(newAvailableHours);
    };

    const handleBooking = async () => {
        if (!selectedDate || selectedSlots.length === 0) return;
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        try {
            setLoading(true);
            const entryDate = formatDateKey(selectedDate);
            const courtId = selectedSlots[0].courtId;

            if (!currentUser?.isAdmin && selectedSlots.length > availableHoursToday) {
                throw new Error(`Sie können nur noch ${availableHoursToday} Stunde(n) buchen.`);
            }

            if (!areSlotsConsecutive(selectedSlots)) {
                throw new Error('Die ausgewählten Stunden müssen nebeneinander liegen!');
            }

            await createOrUpdateEntry(courtId, entryDate, selectedSlots);
            await fetchEntriesForAllCourts(selectedDate);

            updateAvailableHoursAfterBooking(selectedSlots.length);

            const entryTypeName = entryTypes.find(t => t.entryTypeId === selectedEntryType)?.name || 'Buchung';
            alert(`${selectedSlots.length} ${entryTypeName}(en) erfolgreich erstellt!`);

            resetSelection();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetSelection = () => {
        setSelectedSlots([]);
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

            setSelectedSlots(prev => prev.filter(slot =>
                !(slot.courtId === courtId && slot.time === time)
            ));
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

        const hour = parseInt(time.split(':')[0]);
        const clickedSlot = { courtId, time, hour };

        if (currentUser?.isAdmin) {
            const existingEntry = getEntryForSlot(courtId, time);
            if (existingEntry) {
                setSelectedSlots([clickedSlot]);
                setEditingExistingEntry(existingEntry);
                const entryType = entryTypes.find(type =>
                    type.name === existingEntry.entryTypeName ||
                    (type.entryTypeId === 4 && existingEntry.entryTypeName === 'Gesperrt')
                );
                setSelectedEntryType(entryType?.entryTypeId || 1);
                setShowEntryTypeSelector(true);
            } else {
                const isAlreadySelected = selectedSlots.some(slot =>
                    slot.courtId === courtId && slot.time === time
                );

                if (isAlreadySelected) {
                    setSelectedSlots(prev => prev.filter(slot =>
                        !(slot.courtId === courtId && slot.time === time)
                    ));
                } else {
                    if (selectedSlots.length > 0) {
                        if (selectedSlots[0].courtId !== courtId) {
                            setError('Sie können nur Slots auf demselben Platz auswählen!');
                            return;
                        }

                        const allSlots = [...selectedSlots, clickedSlot];
                        if (!areSlotsConsecutive(allSlots)) {
                            setError('Die Stunden müssen nebeneinander liegen!');
                            return;
                        }
                    }

                    setSelectedSlots(prev => [...prev, clickedSlot]);
                    setEditingExistingEntry(null);
                    setSelectedEntryType(1);
                }
                setShowEntryTypeSelector(true);
            }
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

        const isAlreadySelected = selectedSlots.some(slot =>
            slot.courtId === courtId && slot.time === time
        );

        if (isAlreadySelected) {
            setSelectedSlots(prev => prev.filter(slot =>
                !(slot.courtId === courtId && slot.time === time)
            ));
        } else {
            if (selectedSlots.length > 0 && selectedSlots[0].courtId !== courtId) {
                setError('Sie können nur Slots auf demselben Platz auswählen!');
                return;
            }

            const allSlots = [...selectedSlots, clickedSlot];
            if (!areSlotsConsecutive(allSlots)) {
                setError('Die Stunden müssen nebeneinander liegen!');
                return;
            }

            if (selectedSlots.length >= availableHoursToday) {
                const userLimit = currentUser?.maxDailyBookingHours || 2;
                setError(`Sie können nur ${userLimit} Stunden pro Tag buchen. Sie haben bereits ${bookedHoursToday} Stunde(n) gebucht.`);
                return;
            }

            setSelectedSlots(prev => [...prev, clickedSlot]);
        }

        setShowEntryTypeSelector(false);
        setSelectedEntryType(1);
        setEditingExistingEntry(null);
    };

    const isSlotSelected = (courtId: number, time: string) => {
        return selectedSlots.some(slot => slot.courtId === courtId && slot.time === time);
    };

    const canSelectSlot = (courtId: number, time: string) => {
        if (currentUser?.isAdmin) return true;

        const isAlreadySelected = isSlotSelected(courtId, time);
        if (isAlreadySelected) return true;

        if (selectedSlots.length === 0) {
            return availableHoursToday > 0;
        }

        if (selectedSlots[0].courtId !== courtId) {
            return false;
        }

        const hour = parseInt(time.split(':')[0]);
        const selectedHours = selectedSlots.map(s => s.hour);

        const canBeSelected = selectedHours.some(selectedHour =>
            Math.abs(selectedHour - hour) === 1
        );

        return canBeSelected && selectedSlots.length < availableHoursToday;
    };

    const getUserInitialsForSlot = (courtId: number, time: string): string => {
        const bookingDetails = getBookingDetails(courtId, time);
        if (!bookingDetails) return "";

        return bookingDetails.initials || "";
    };

    const getAdminTooltip = (courtId: number, time: string): string => {
        const bookingDetails = getBookingDetails(courtId, time);
        if (!bookingDetails) return "";

        return `Gebucht von: ${bookingDetails.firstName} ${bookingDetails.lastName} (${bookingDetails.email})`;
    };

    const getBookingTimeRange = () => {
        if (selectedSlots.length === 0) return "";

        const sortedSlots = [...selectedSlots].sort((a, b) => a.hour - b.hour);
        const startTime = sortedSlots[0].time;
        const endSlot = sortedSlots[sortedSlots.length - 1];
        const endHour = endSlot.hour + 1;
        const endTime = endHour < 10 ? `0${endHour}:00` : `${endHour}:00`;

        return `${startTime} - ${endTime}`;
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
                        setBookedHoursToday(0);
                        if (currentUser) {
                            if (currentUser.isAdmin) {
                                setAvailableHoursToday(999);
                            } else {
                                setAvailableHoursToday(currentUser.maxDailyBookingHours);
                            }
                        }
                        setError(null);
                    }}
                    value={selectedDate}
                    minDate={new Date()}
                />
                {selectedDate && (
                    <div className="selected-date-info">
                        <p>Ausgewählt: <strong>{selectedDate.toLocaleDateString("de-DE")}</strong></p>
                        {isAuthenticated && !currentUser?.isAdmin && (
                            <div className="booking-stats">
                                <div className="stat-item">
                                    <span className="stat-label">Persönliches Limit:</span>
                                    <span className="stat-value">{currentUser?.maxDailyBookingHours} Std/Tag</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Gebucht heute:</span>
                                    <span className="stat-value">{bookedHoursToday}/{currentUser?.maxDailyBookingHours}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Noch verfügbar:</span>
                                    <span className="stat-value available-highlight">{availableHoursToday} Stunde(n)</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {selectedDate && isAuthenticated && currentUser?.membershipPaid && (
                <section className="all-courts-section">
                    <h2>2. Verfügbarkeit aller Plätze</h2>
                    <div className="multiselect-info">
                        {selectedSlots.length > 0 && (
                            <div className="selection-info">
                                <p className="selection-counter">
                                    {selectedSlots.length} Stunde(n) ausgewählt auf Platz {selectedSlots[0]?.courtId}
                                </p>
                                <p className="selection-range">
                                    Zeitraum: <strong>{getBookingTimeRange()}</strong>
                                </p>
                            </div>
                        )}
                    </div>
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
                                        const isSelected = isSlotSelected(courtId, time);
                                        const canSelect = canSelectSlot(courtId, time);
                                        const userInitials = getUserInitialsForSlot(courtId, time); // NEU
                                        const adminTooltip = getAdminTooltip(courtId, time); // NEU

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
                                            titleText = currentUser?.isAdmin ? adminTooltip : "Durch andere gebucht";
                                            icon = currentUser?.isAdmin ? userInitials || "B" : "B";
                                        } else if (isSelected) {
                                            typeClass = "selected";
                                            titleText = "Ausgewählt";
                                            icon = `${selectedSlots.findIndex(s => s.courtId === courtId && s.time === time) + 1}`;
                                        }

                                        let disabledReason = "";
                                        if (!currentUser?.isAdmin && !isSelected && !canSelect) {
                                            titleText = "Stunden müssen nebeneinander liegen";
                                            disabledReason = "not-consecutive";
                                        }

                                        return (
                                            <td key={time} className="time-slot-cell">
                                                <button
                                                    className={`time-slot ${typeClass} ${currentUser?.isAdmin ? 'admin-clickable' : ''} ${disabledReason}`}
                                                    onClick={() => handleTimeClick(courtId, time)}
                                                    disabled={
                                                        !currentUser?.isAdmin &&
                                                        (locked || course || tournament || otherBooking || myBooking || !canSelect)
                                                    }
                                                    title={titleText}
                                                >
                                                    <span className="time-label">{time}</span>
                                                    <span className="slot-status">
                                                        {icon}
                                                    </span>

                                                    {isSelected && (
                                                        <div className="slot-selection-indicator">
                                                            {selectedSlots.findIndex(s => s.courtId === courtId && s.time === time) + 1}
                                                        </div>
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

            {showEntryTypeSelector && currentUser?.isAdmin && selectedSlots.length > 0 && (
                <div className="entry-type-selector">
                    <h3>
                        {editingExistingEntry ? 'Eintrag bearbeiten' :
                            selectedSlots.length > 1 ? 'Mehrere Einträge erstellen' : 'Neuen Eintrag erstellen'}
                    </h3>
                    <p className="selector-description">
                        {editingExistingEntry ?
                            `Bearbeite Platz ${selectedSlots[0].courtId} um ${selectedSlots[0].time}` :
                            selectedSlots.length > 1 ?
                                `${selectedSlots.length} Stunden auf Platz ${selectedSlots[0].courtId} (${getBookingTimeRange()})` :
                                `Wählen Sie den Typ für Platz ${selectedSlots[0].courtId} um ${selectedSlots[0].time}:`
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
                                    selectedSlots.length > 1 ?
                                        `${getCurrentEntryType().name} von ${getBookingTimeRange()} erstellen` :
                                        `${getCurrentEntryType().name} erstellen`}
                        </button>

                        {editingExistingEntry && (
                            <button
                                className="delete-admin-btn"
                                onClick={() => handleDeleteBooking(selectedSlots[0].courtId, selectedDate!, selectedSlots[0].time)}
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

            {selectedDate && selectedSlots.length > 0 && isAuthenticated && currentUser?.membershipPaid && !currentUser?.isAdmin && (
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
                                <span className="summary-value">{selectedSlots[0].courtId}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Zeitraum:</span>
                                <span className="summary-value">{getBookingTimeRange()}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Dauer:</span>
                                <span className="summary-value">{selectedSlots.length} Stunde(n)</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Verbleibende Stunden heute:</span>
                                <span className="summary-value">
                                    {Math.max(0, availableHoursToday - selectedSlots.length)}/{currentUser?.maxDailyBookingHours}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        className="confirm-btn"
                        onClick={handleBooking}
                        disabled={loading}
                    >
                        {loading ? 'Wird erstellt...' : `${selectedSlots.length} Stunde(n) von ${getBookingTimeRange()} buchen`}
                    </button>

                    <button
                        className="cancel-selector-btn"
                        onClick={resetSelection}
                    >
                        Auswahl abbrechen
                    </button>
                </div>
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