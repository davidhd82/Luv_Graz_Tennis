import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Booking from "./views/Booking.tsx"
import MainPage from "./views/MainPage.tsx";


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainPage />}/>
                <Route path="/booking" element={<Booking />} />
            </Routes>
        </Router>
    );
}

export default App