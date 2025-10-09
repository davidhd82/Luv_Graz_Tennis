import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Booking from "./views/Booking.tsx";
import MainPage from "./views/MainPage.tsx";
import Login from "./views/Login.tsx";
import Register from "./views/Register.tsx";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            setIsLoggedIn(true);
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleAuthSuccess = (token: string, userData: any) => {
        setIsLoggedIn(true);
        setUser(userData);
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
                <Route
                    path="/"
                    element={
                        <MainPage
                            isLoggedIn={isLoggedIn}
                            user={user}
                            onLogout={handleLogout}
                        />
                    }
                />
                <Route path="/booking" element={<Booking />} />
                <Route
                    path="/login"
                    element={<Login onAuthSuccess={handleAuthSuccess} />}
                />
                <Route
                    path="/register"
                    element={<Register onAuthSuccess={handleAuthSuccess} />}
                />
            </Routes>
        </Router>
    );
}

export default App;