import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Admin.css';
import { API_BASE_URL } from '../api';

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
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [editingField, setEditingField] = useState<'admin' | 'membership' | 'hours' | null>(null);
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

            const response = await fetch(`${API_BASE_URL}/api/user/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Fehler beim Laden des aktuellen Benutzers');
            }

            const userData = await response.json();
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

            const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
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
            const response = await fetch(`${API_BASE_URL}/api/admin/entries`, {
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

            const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/admin-status?isAdmin=${newAdminStatus}`, {
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

            const actualIsAdmin = updatedUser.isAdmin !== undefined ? updatedUser.isAdmin :
                updatedUser.admin !== undefined ? updatedUser.admin : newAdminStatus;

            setUsers(users.map(user =>
                user.userId === userId ? {
                    ...user,
                    isAdmin: actualIsAdmin
                } : user
            ));

            setError('');
            setEditingUserId(null);
            setEditingField(null);

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

            const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/membership-status?membershipPaid=${!currentStatus}`, {
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

            setUsers(users.map(user =>
                user.userId === userId ? {
                    ...user,
                    membershipPaid: updatedUser.membershipPaid
                } : user
            ));

            setError('');
            setEditingUserId(null);
            setEditingField(null);
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

            const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/booking-hours?hours=${newHours}`, {
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

            setUsers(users.map(user =>
                user.userId === userId ? {
                    ...user,
                    maxDailyBookingHours: updatedUser.maxDailyBookingHours || newHours
                } : user
            ));

            setEditingUserId(null);
            setEditingField(null);
            setTempHoursValue('');
            setError('');
        } catch (err: any) {
            setError(err.message);
        }
    };

    const startEditingHours = (userId: number, currentHours: number) => {
        setEditingUserId(userId);
        setEditingField('hours');
        setTempHoursValue(currentHours.toString());
    };

    const startEditingAdmin = (userId: number) => {
        setEditingUserId(userId);
        setEditingField('admin');
    };

    const startEditingMembership = (userId: number) => {
        setEditingUserId(userId);
        setEditingField('membership');
    };

    const cancelEditing = () => {
        setEditingUserId(null);
        setEditingField(null);
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

            const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
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

            const response = await fetch(`${API_BASE_URL}/api/admin/entries/${courtId}/${date}/${hour}`, {
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
                    Benutzer ({users.length})
                </button>
                <button
                    className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bookings')}
                >
                    Buchungen ({entries.length})
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
                            <th className="name-column">Name</th>
                            <th className="email-column">E-Mail</th>
                            <th className="admin-column">Admin</th>
                            <th className="membership-column">Beitrag</th>
                            <th className="hours-column">Stunden/Tag</th>
                            <th className="status-column">Aktiv</th>
                            <th className="actions-column">Aktionen</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.userId}>
                                <td className="name-column">
                                    <div className="user-info-compact">
                                        <div className="user-avatar-small">
                                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                        </div>
                                        <div className="user-details-compact">
                                            <div className="user-name-compact">
                                                {user.salutation} {user.title} {user.firstName} {user.lastName}
                                            </div>
                                            <div className="user-mobile-compact">
                                                {user.mobile || 'Kein Telefon'}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                <td className="email-column">
                                    <div className="email-text">{user.email}</div>
                                </td>

                                <td className="admin-column">
                                    {editingUserId === user.userId && editingField === 'admin' ? (
                                        <div className="editing-container-compact">
                                            <div className="editing-content-compact">
                                                <div className="editing-buttons-compact">
                                                    <button
                                                        onClick={() => handleUpdateAdminStatus(user.userId, user.isAdmin)}
                                                        className="confirm-edit-btn"
                                                        title="Ja"
                                                    >
                                                        ✓
                                                    </button>
                                                    <button
                                                        onClick={cancelEditing}
                                                        className="cancel-edit-btn"
                                                        title="Nein"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className="clickable-field-compact"
                                            onClick={() => startEditingAdmin(user.userId)}
                                            title={user.isAdmin ? 'Admin entfernen?' : 'Zu Admin machen?'}
                                        >
                                            <span className={`admin-badge-compact ${user.isAdmin ? 'is-admin' : 'not-admin'}`}>
                                                {user.isAdmin ? 'Admin' : 'Benutzer'}
                                            </span>
                                        </div>
                                    )}
                                </td>

                                {/* Mitgliedsbeitrag - Kompakt */}
                                <td className="membership-column">
                                    {editingUserId === user.userId && editingField === 'membership' ? (
                                        <div className="editing-container-compact">
                                            <div className="editing-content-compact">
                                                <div className="editing-buttons-compact">
                                                    <button
                                                        onClick={() => handleToggleMembershipStatus(user.userId, user.membershipPaid)}
                                                        className="confirm-edit-btn"
                                                        title="Ja"
                                                    >
                                                        ✓
                                                    </button>
                                                    <button
                                                        onClick={cancelEditing}
                                                        className="cancel-edit-btn"
                                                        title="Nein"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className="clickable-field-compact"
                                            onClick={() => startEditingMembership(user.userId)}
                                            title={user.membershipPaid ? 'Als nicht bezahlt markieren?' : 'Als bezahlt markieren?'}
                                        >
                                            <span className={`membership-badge-compact ${user.membershipPaid ? 'paid' : 'not-paid'}`}>
                                                {user.membershipPaid ? 'Bezahlt' : 'Offen'}
                                            </span>
                                        </div>
                                    )}
                                </td>

                                {/* Buchungsstunden - Kompakt */}
                                <td className="hours-column">
                                    {editingUserId === user.userId && editingField === 'hours' ? (
                                        <div className="editing-container-compact">
                                            <div className="editing-content-compact">
                                                <div className="hours-edit-section-compact">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="24"
                                                        value={tempHoursValue}
                                                        onChange={(e) => setTempHoursValue(e.target.value)}
                                                        className="hours-input-compact"
                                                        placeholder="Std"
                                                        autoFocus
                                                    />
                                                    <div className="editing-buttons-compact">
                                                        <button
                                                            onClick={() => handleUpdateBookingHours(user.userId)}
                                                            className="confirm-edit-btn"
                                                            disabled={!tempHoursValue.trim()}
                                                            title="Speichern"
                                                        >
                                                            ✓
                                                        </button>
                                                        <button
                                                            onClick={cancelEditing}
                                                            className="cancel-edit-btn"
                                                            title="Abbrechen"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className="clickable-field-compact hours-field-compact"
                                            onClick={() => startEditingHours(user.userId, user.maxDailyBookingHours || 2)}
                                            title={`Klicken zum Bearbeiten: Aktuell ${user.maxDailyBookingHours || 2} Stunden`}
                                        >
                                            <span className={`hours-badge-compact ${(user.maxDailyBookingHours || 0) > 0 ? 'has-hours' : 'no-hours'}`}>
                                                {user.maxDailyBookingHours || 2}h
                                            </span>
                                        </div>
                                    )}
                                </td>

                                {/* Aktiv Status - Kompakt */}
                                <td className="status-column">
                                    <span className={`status-badge-compact ${user.enabled ? 'active' : 'inactive'}`}>
                                        {user.enabled ? 'Aktiv' : 'Inaktiv'}
                                    </span>
                                </td>

                                {/* Aktionen */}
                                <td className="actions-column">
                                    <div className="action-buttons-compact">
                                        <button
                                            onClick={() => handleDeleteUser(user.userId)}
                                            className="delete-user-btn-compact"
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
                                    <span className="time-badge-compact">{entry.startHour}:00 Uhr</span>
                                </td>
                                <td>
                                    <span className="court-badge-compact">Platz {entry.tennisCourtId}</span>
                                </td>
                                <td className="booking-user-column">{entry.userName}</td>
                                <td className="booking-email-column">{entry.userEmail}</td>
                                <td>
                                    <span className={`type-badge-compact ${entry.entryTypeName === 'Gesperrt' ? 'locked-badge' : ''}`}>
                                        {entry.entryTypeName}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        onClick={() => handleDeleteBooking(entry.tennisCourtId, entry.entryDate, entry.startHour)}
                                        className={`delete-btn-compact ${entry.entryTypeName === 'Gesperrt' ? 'delete-locked-btn' : ''}`}
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