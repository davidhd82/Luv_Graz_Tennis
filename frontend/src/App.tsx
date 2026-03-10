import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Booking from "./views/Booking.tsx";
import MainPage from "./views/MainPage.tsx";
import Login from "./views/Login.tsx";
import Register from "./views/Register.tsx";
import Profile from "./views/Profile.tsx";
import Settings from "./views/Settings.tsx";
import EmailVerificationPending from "./views/EmailVerificationPending.tsx";
import AdminPage from "./views/AdminPage.tsx";
import ForgotPassword from "./views/ForgotPassword.tsx";
import ResetPassword from "./views/ResetPassword.tsx";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        const tokenExpiry = localStorage.getItem('tokenExpiry');

        if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('tokenExpiry');
            return;
        }

        if (token && userData) {
            setIsLoggedIn(true);
            const parsedUser = JSON.parse(userData);
            if (parsedUser.admin !== undefined && parsedUser.isAdmin === undefined) {
                parsedUser.isAdmin = parsedUser.admin;
                delete parsedUser.admin;
                localStorage.setItem('user', JSON.stringify(parsedUser));
            }
            setUser(parsedUser);
        }
    }, []);

    const handleAuthSuccess = (token: string, userData: any) => {
        setIsLoggedIn(true);
        const userToStore = {
            userId: userData.userId || userData.id,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            isAdmin: userData.isAdmin || userData.admin || false
        };
        setUser(userToStore);
        localStorage.setItem('user', JSON.stringify(userToStore));
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('tokenExpiry');
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
                <Route path="/login" element={<Login onAuthSuccess={handleAuthSuccess} />} />
                <Route path="/register" element={<Register onAuthSuccess={handleAuthSuccess} />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/verify-pending" element={<EmailVerificationPending />} />
                <Route path="/admin" element={
                    <ProtectedAdminRoute user={user}>
                        <AdminPage />
                    </ProtectedAdminRoute>
                } />
            </Routes>
        </Router>
    );
}

function ProtectedAdminRoute({ children, user }: { children: JSX.Element, user: any }) {
    if (!user || !user.isAdmin) {
        return <Navigate to="/" replace />;
    }
    return children;
}

export default App;
