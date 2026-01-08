import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Admin.css';

// Interface basierend auf deinem UserDto
interface User {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    postalCode: string;
    city: string;
    street: string;
    mobile: string;
    salutation: string;
    title: string;
    isAdmin: boolean;
    enabled: boolean;
    membershipPaid: boolean;
    maxDailyBookingHours: number;
}

interface EntryDto {
    id: string;
    entryDate: string;
    startHour: number;
    tennisCourtId: number;
    tennisCourtName: string;
    entryTypeName: string;
    userEmail: string;
    userName: string;
}

interface CreateEntryRequest {
    entryDate: string;
    startHour: number;
    tennisCourtId: number;
    entryTypeId: number;
    userId: number;
}

export default function AdminPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [entries, setEntries] = useState<EntryDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'users' | 'bookings'>('users');
    const [filterDate, setFilterDate] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingHours, setEditingHours] = useState<number | null>(null);
    const [tempHoursValue, setTempHoursValue] = useState<string>('');

    const navigate = useNavigate();

    useEffect(() => {
        fetchCurrentUser();
        fetchUsers();
        fetchAllEntries();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Kein Token gefunden');
            }

            const response = await fetch('http://localhost:8080/api/user/me', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Fehler beim Laden des aktuellen Benutzers');
            }

            const userData = await response.json();
            setCurrentUserId(userData.userId);
            localStorage.setItem('userId', userData.userId.toString());
        } catch (err: any) {
            console.error('Error fetching current user:', err);
        }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Kein Token gefunden. Bitte neu anmelden.');
            }

            const response = await fetch('http://localhost:8080/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Keine Admin-Berechtigung. Bitte als Admin anmelden.');
                }
                if (response.status === 401) {
                    throw new Error('Sitzung abgelaufen. Bitte neu anmelden.');
                }
                const errorText = await response.text();
                throw new Error(`Fehler beim Laden der Benutzer: ${response.status} - ${errorText}`);
            }

            const data = await response.json();

            // Korrekte Verarbeitung des Admin-Status
            const usersWithCorrectAdminStatus = data.map((user: any) => {
                const isAdminValue = user.isAdmin !== undefined ? user.isAdmin :
                    user.admin !== undefined ? user.admin : false;

                return {
                    ...user,
                    isAdmin: isAdminValue,
                    userId: user.userId || user.id,
                    maxDailyBookingHours: user.maxDailyBookingHours || 2
                };
            });

            setUsers(usersWithCorrectAdminStatus);
            setLoading(false);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    const fetchAllEntries = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/api/admin/entries', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Fehler beim Laden der Buchungen');
            }

            const data = await response.json();
            setEntries(data);
        } catch (err: any) {
            console.error('Error fetching entries:', err);
        }
    };

    const handleUpdateAdminStatus = async (userId: number, currentIsAdmin: boolean) => {
        const newAdminStatus = !currentIsAdmin;

        if (!userId || isNaN(userId)) {
            setError(`Ungültige Benutzer-ID: ${userId}`);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Kein Token gefunden');
            }

            const response = await fetch(`http://localhost:8080/api/admin/users/${userId}/admin-status?isAdmin=${newAdminStatus}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Keine Berechtigung zum Ändern des Admin-Status');
                }
                const errorText = await response.text();
                throw new Error(`Fehler beim Aktualisieren: ${response.status} - ${errorText}`);
            }

            const updatedUser = await response.json();

            // Korrekte Verarbeitung der Antwort
            const actualIsAdmin = updatedUser.isAdmin !== undefined ? updatedUser.isAdmin :
                updatedUser.admin !== undefined ? updatedUser.admin : newAdminStatus;

            // Update local state
            setUsers(users.map(user =>
                user.userId === userId ? {
                    ...user,
                    isAdmin: actualIsAdmin
                } : user
            ));

            setError('');
            alert(`Admin-Status erfolgreich ${newAdminStatus ? 'aktiviert' : 'deaktiviert'}`);

        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleToggleMembershipStatus = async (userId: number, currentStatus: boolean) => {
        if (!userId || isNaN(userId)) {
            setError(`Ungültige Benutzer-ID: ${userId}`);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Kein Token gefunden');
            }

            const response = await fetch(`http://localhost:8080/api/admin/users/${userId}/membership-status?membershipPaid=${!currentStatus}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Keine Berechtigung zum Ändern des Mitgliedsbeitrags-Status');
                }
                const errorText = await response.text();
                throw new Error(`Fehler beim Aktualisieren: ${errorText}`);
            }

            const updatedUser = await response.json();

            // Update local state
            setUsers(users.map(user =>
                user.userId === userId ? {
                    ...user,
                    membershipPaid: updatedUser.membershipPaid
                } : user
            ));

            setError('');
            alert(`Mitgliedsbeitrag ${!currentStatus ? 'als bezahlt markiert' : 'als nicht bezahlt markiert'}`);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleUpdateBookingHours = async (userId: number) => {
        if (!userId || isNaN(userId)) {
            setError(`Ungültige Benutzer-ID: ${userId}`);
            return;
        }

        const newHours = parseInt(tempHoursValue);
        if (isNaN(newHours) || newHours < 0 || newHours > 24) {
            setError('Bitte eine gültige Zahl zwischen 0 und 24 eingeben');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Kein Token gefunden');
            }

            // Verwendet die neue Route /booking-hours
            const response = await fetch(`http://localhost:8080/api/admin/users/${userId}/booking-hours?hours=${newHours}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Keine Berechtigung zum Ändern der Buchungsstunden');
                }
                const errorText = await response.text();
                throw new Error(`Fehler beim Aktualisieren: ${response.status} - ${errorText}`);
            }

            const updatedUser = await response.json();

            // Update local state
            setUsers(users.map(user =>
                user.userId === userId ? {
                    ...user,
                    maxDailyBookingHours: updatedUser.maxDailyBookingHours || newHours
                } : user
            ));

            setEditingHours(null);
            setTempHoursValue('');
            setError('');
            alert(`Buchungsstunden erfolgreich auf ${newHours} Stunden/Tag gesetzt`);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const startEditingHours = (userId: number, currentHours: number) => {
        setEditingHours(userId);
        setTempHoursValue(currentHours.toString());
    };

    const cancelEditingHours = () => {
        setEditingHours(null);
        setTempHoursValue('');
    };

    const handleDeleteUser = async (userId: number) => {
        if (!userId || isNaN(userId)) {
            setError(`Ungültige Benutzer-ID: ${userId}`);
            return;
        }

        if (!window.confirm('Benutzer wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Kein Token gefunden');
            }

            const response = await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Keine Berechtigung zum Löschen des Benutzers');
                }
                if (response.status === 404) {
                    throw new Error('Benutzer nicht gefunden');
                }
                const errorText = await response.text();
                throw new Error(`Fehler beim Löschen: ${errorText}`);
            }

            setUsers(users.filter(user => user.userId !== userId));
            setError('');
            alert('Benutzer erfolgreich gelöscht');
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDeleteBooking = async (courtId: number, date: string, hour: number) => {
        if (!courtId || !date || hour === undefined) {
            setError('Ungültige Buchungsdaten');
            return;
        }

        if (!window.confirm('Buchung wirklich löschen?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Kein Token gefunden');
            }

            const response = await fetch(`http://localhost:8080/api/admin/entries/${courtId}/${date}/${hour}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Keine Berechtigung zum Löschen der Buchung');
                }
                const errorText = await response.text();
                throw new Error(`Fehler beim Löschen: ${errorText}`);
            }

            setEntries(entries.filter(entry =>
                !(entry.tennisCourtId === courtId &&
                    entry.entryDate === date &&
                    entry.startHour === hour)
            ));
            setError('');
            alert('Buchung erfolgreich gelöscht');
        } catch (err: any) {
            setError(err.message);
        }
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredEntries = entries.filter(entry => {
        if (filterDate && entry.entryDate !== filterDate) return false;
        if (searchTerm && !entry.userEmail.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    if (loading) {
        return (
            <div className="admin-container">
                <div className="loading">Lädt...</div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <div className="admin-header">
                <button className="back-btn" onClick={() => navigate('/')}>
                    ← Zurück
                </button>
                <h1>Admin Dashboard</h1>
                <div className="admin-subtitle">
                    Verwaltung von Benutzern und Buchungen
                </div>
            </div>

            {error && (
                <div className="error-message">
                    <div style={{ flex: 1 }}>
                        {error}
                    </div>
                    <button onClick={() => setError('')} className="clear-error-btn">
                        ✕
                    </button>
                </div>
            )}

            <div className="admin-tabs">
                <button
                    className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    👥 Benutzer ({users.length})
                </button>
                <button
                    className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bookings')}
                >
                    📅 Buchungen ({entries.length})
                </button>
            </div>

            <div className="admin-controls">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Suchen..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                {activeTab === 'bookings' && (
                    <div className="date-filter">
                        <label>Datum filtern:</label>
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="date-input"
                        />
                        {filterDate && (
                            <button
                                onClick={() => setFilterDate('')}
                                className="clear-filter-btn"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                )}
            </div>

            {activeTab === 'users' ? (
                <div className="users-table">
                    <table>
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>E-Mail</th>
                            <th>Admin</th>
                            <th>Mitgliedsbeitrag</th>
                            <th>Buchungsstunden/Tag</th>
                            <th>Aktiv</th>
                            <th>Aktionen</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.userId}>
                                <td>
                                    <div className="user-info">
                                        <div className="user-avatar">
                                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                        </div>
                                        <div className="user-details">
                                            <div className="user-name">
                                                {user.salutation} {user.title} {user.firstName} {user.lastName}
                                            </div>
                                            <div className="user-mobile">
                                                📱 {user.mobile || 'Kein Telefon'}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <div className="admin-status-container">
                                        <span className={`admin-badge ${user.isAdmin ? 'is-admin' : 'not-admin'}`}>
                                            {user.isAdmin ? '👑 Admin' : '👤 Benutzer'}
                                        </span>
                                        <button
                                            onClick={() => handleUpdateAdminStatus(user.userId, user.isAdmin)}
                                            className="toggle-admin-btn"
                                            data-is-admin={user.isAdmin}
                                            title={user.isAdmin ? 'Admin-Rechte entfernen' : 'Zu Admin machen'}
                                        >
                                            {user.isAdmin ? '✕' : '✓'}
                                        </button>
                                    </div>
                                </td>
                                <td>
                                    <div className="membership-status-container">
                                        <span className={`membership-badge ${user.membershipPaid ? 'paid' : 'not-paid'}`}>
                                            {user.membershipPaid ? '✅ Bezahlt' : '⚠️ Offen'}
                                        </span>
                                        <button
                                            onClick={() => handleToggleMembershipStatus(user.userId, user.membershipPaid)}
                                            className="toggle-membership-btn"
                                            data-paid={user.membershipPaid}
                                            title={user.membershipPaid ? 'Als nicht bezahlt markieren' : 'Als bezahlt markieren'}
                                        >
                                            {user.membershipPaid ? '✕' : '✓'}
                                        </button>
                                    </div>
                                </td>
                                <td>
                                    <div className="hours-container">
                                        {editingHours === user.userId ? (
                                            <div className="hours-edit">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="24"
                                                    value={tempHoursValue}
                                                    onChange={(e) => setTempHoursValue(e.target.value)}
                                                    className="hours-input"
                                                    placeholder="Stunden"
                                                />
                                                <div className="hours-edit-buttons">
                                                    <button
                                                        onClick={() => handleUpdateBookingHours(user.userId)}
                                                        className="save-hours-btn"
                                                    >
                                                        ✓
                                                    </button>
                                                    <button
                                                        onClick={cancelEditingHours}
                                                        className="cancel-hours-btn"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="hours-display">
                                                <span className={`hours-badge ${(user.maxDailyBookingHours || 0) > 0 ? 'has-hours' : 'no-hours'}`}>
                                                    {user.maxDailyBookingHours || 2} Std.
                                                </span>
                                                <button
                                                    onClick={() => startEditingHours(user.userId, user.maxDailyBookingHours || 2)}
                                                    className="edit-hours-btn"
                                                    title="Buchungsstunden bearbeiten"
                                                >
                                                    ✎
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-badge ${user.enabled ? 'active' : 'inactive'}`}>
                                        {user.enabled ? '✅ Aktiv' : '⭕ Inaktiv'}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            onClick={() => handleDeleteUser(user.userId)}
                                            className="delete-user-btn"
                                            title="Benutzer löschen"
                                        >
                                            Löschen
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                        <div className="no-data">Keine Benutzer gefunden</div>
                    )}
                </div>
            ) : (
                <div className="bookings-table">
                    <table>
                        <thead>
                        <tr>
                            <th>Datum</th>
                            <th>Zeit</th>
                            <th>Platz</th>
                            <th>Benutzer</th>
                            <th>E-Mail</th>
                            <th>Buchungstyp</th>
                            <th>Aktionen</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredEntries.map((entry) => (
                            <tr key={`${entry.tennisCourtId}-${entry.entryDate}-${entry.startHour}`}>
                                <td>
                                    {new Date(entry.entryDate).toLocaleDateString('de-DE')}
                                </td>
                                <td>
                                    <span className="time-badge">🕒 {entry.startHour}:00</span>
                                </td>
                                <td>
                                    <span className="court-badge">🎾 Platz {entry.tennisCourtId}</span>
                                </td>
                                <td>{entry.userName}</td>
                                <td>{entry.userEmail}</td>
                                <td>
                                    <span className={`type-badge ${entry.entryTypeName === 'Gesperrt' ? 'locked-badge' : ''}`}>
                                        {entry.entryTypeName === 'Gesperrt' ? '🔒 ' : '📅 '}
                                        {entry.entryTypeName}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        onClick={() => handleDeleteBooking(entry.tennisCourtId, entry.entryDate, entry.startHour)}
                                        className={`delete-btn ${entry.entryTypeName === 'Gesperrt' ? 'delete-locked-btn' : ''}`}
                                        title={entry.entryTypeName === 'Gesperrt' ? 'Sperrung aufheben' : 'Buchung löschen'}
                                    >
                                        {entry.entryTypeName === 'Gesperrt' ? 'Freigeben' : 'Löschen'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    {filteredEntries.length === 0 && (
                        <div className="no-data">Keine Buchungen gefunden</div>
                    )}
                </div>
            )}

        </div>
    );
}