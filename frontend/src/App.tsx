import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Booking from "./views/Booking.tsx";
import MainPage from "./views/MainPage.tsx";
import Login from "./views/Login.tsx";
import Register from "./views/Register.tsx";
import Profile from "./views/Profile.tsx";
import Settings from "./views/Settings.tsx";
import EmailVerificationPending from "./views/EmailVerificationPending.tsx";
import AdminPage from "./views/AdminPage.tsx"; // Neue Admin-Komponente

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            setIsLoggedIn(true);

            // Parse user data und stelle sicher, dass isAdmin korrekt gesetzt ist
            const parsedUser = JSON.parse(userData);
            // Stelle sicher, dass isAdmin existiert (falls altes admin Feld verwendet wurde)
            if (parsedUser.admin !== undefined && parsedUser.isAdmin === undefined) {
                parsedUser.isAdmin = parsedUser.admin;
                delete parsedUser.admin;
                // Update localStorage mit korrekter Struktur
                localStorage.setItem('user', JSON.stringify(parsedUser));
            }
            setUser(parsedUser);
        }
    }, []);

    const handleAuthSuccess = (token: string, userData: any) => {
        setIsLoggedIn(true);

        // Stelle sicher, dass isAdmin korrekt gesetzt ist
        const userToStore = {
            userId: userData.userId || userData.id,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            isAdmin: userData.isAdmin || userData.admin || false // Behandle beide Fälle
        };

        setUser(userToStore);
        localStorage.setItem('user', JSON.stringify(userToStore));
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUser(null);
    };

    return (
        <Router>
            <Routes>
                <Route path="/" element={
                    <MainPage
                        isLoggedIn={isLoggedIn}
                        user={user}
                        onLogout={handleLogout}
                    />
                } />
                <Route path="/booking" element={<Booking />} />
                <Route path="/login" element={<Login onAuthSuccess={handleAuthSuccess} />}/>
                <Route path="/register" element={<Register onAuthSuccess={handleAuthSuccess} />}/>
                <Route path="/profile" element={<Profile />}/>
                <Route path="/settings" element={<Settings />}/>
                <Route path="/verify-pending" element={<EmailVerificationPending />} />
                {/* Neue Admin Route mit isAdmin-Check */}
                <Route path="/admin" element={
                    <ProtectedAdminRoute user={user}>
                        <AdminPage />
                    </ProtectedAdminRoute>
                }/>
            </Routes>
        </Router>
    );
}

// Protected Route für Admin - prüft ob user.isAdmin === true
function ProtectedAdminRoute({ children, user }: { children: JSX.Element, user: any }) {
    console.log('ProtectedAdminRoute check - user:', user);
    console.log('Is admin?', user?.isAdmin);

    if (!user || !user.isAdmin) {
        console.log('Redirecting to home - not admin');
        return <Navigate to="/" replace />;
    }

    console.log('Granting admin access');
    return children;
}

export default App;