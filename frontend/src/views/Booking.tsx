import {useEffect, useState} from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useNavigate } from 'react-router-dom';
import "../css/Booking.css";

const hours = [
    "08:00", "09:00", "10:00", "11:00",
    "12:00", "13:00", "14:00", "15:00",
    "16:00", "17:00", "18:00", "19:00", "20:00"
];

const bookedSlots: Record<string, string[]> = {
    "2025-10-03": ["09:00", "11:00", "18:00"],
    "2025-10-05": ["10:00", "15:00"]
};

const bookedCourts: Record<string, number[]> = {
    "2025-10-03_09:00": [2, 4],
    "2025-10-03_11:00": [1],
};

export default function BookingPage() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedCourt, setSelectedCourt] = useState<number | null>(null);

    const formatDateKey = (date: Date) => date.toISOString().split("T")[0];

    const totalCourts = 5;
    const courts = [1, 2, 3, 4, 5];

    const availableSlots = selectedDate
        ? hours.map((h) => {
            const key = `${formatDateKey(selectedDate)}_${h}`;
            const unavailable = bookedCourts[key] || [];
            const fullyBooked = unavailable.length >= totalCourts;

            return {
                time: h,
                disabled: fullyBooked
            };
        })
        : [];

    const courtKey =
        selectedDate && selectedTime
            ? `${formatDateKey(selectedDate)}_${selectedTime}`
            : null;

    const unavailableCourts = courtKey ? bookedCourts[courtKey] || [] : [];

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    const handleBooking = () => {
        if (!isLoggedIn) {
            alert('Bitte melden Sie sich an, um zu buchen.');
            navigate('/login');
            return;
        }

        const token = localStorage.getItem('token');
        alert('Buchung erfolgreich!');
    };

    return (
        <div className="page">
            <header className="header">
                <h1>🎾 Tennis Luv – Terminbuchung</h1>
            </header>

            <div>
                <button onClick={() => {
                    navigate('/');
                }}>Zurück</button>
            </div>

            <section className="calendar-section">
                <h2>Wähle ein Datum</h2>
                <Calendar
                    onChange={(date) => {
                        setSelectedDate(date as Date);
                        setSelectedTime(null);
                        setSelectedCourt(null);
                    }}
                    value={selectedDate}
                    tileClassName={({ date }) => {
                        const key = formatDateKey(date);
                        if (bookedSlots[key]) return "partially-booked";
                        return "";
                    }}
                />
            </section>

            <section className="slots">
                <h2>Verfügbare Uhrzeiten</h2>
                {!selectedDate && <p>Bitte wähle zuerst ein Datum aus.</p>}

                {selectedDate && (
                    <div className="slots-grid">
                        {availableSlots.map((slot) => (
                            <button
                                key={slot.time}
                                className={`slot-btn ${
                                    slot.disabled
                                        ? "disabled"
                                        : selectedTime === slot.time
                                            ? "selected"
                                            : ""
                                }`}
                                onClick={() => {
                                    if (!slot.disabled) {
                                        setSelectedTime(slot.time);
                                        setSelectedCourt(null);
                                    }
                                }}
                                disabled={slot.disabled}
                            >
                                {slot.time}
                            </button>
                        ))}
                    </div>
                )}
            </section>

            {selectedDate && selectedTime && (
                <section className="slots">
                    <h2>Wähle einen Tennisplatz</h2>
                    <div className="slots-grid">
                        {courts.map((court) => {
                            const disabled = unavailableCourts.includes(court);
                            return (
                                <button
                                    key={court}
                                    className={`slot-btn ${
                                        disabled
                                            ? "disabled"
                                            : selectedCourt === court
                                                ? "selected"
                                                : ""
                                    }`}
                                    onClick={() => !disabled && setSelectedCourt(court)}
                                    disabled={disabled}
                                >
                                    Platz {court}
                                </button>
                            );
                        })}
                    </div>
                </section>
            )}

            {selectedDate && selectedTime && selectedCourt && (
                <footer className="footer">
                    <p>
                        Gewählter Termin:{" "}
                        <strong>{selectedDate.toLocaleDateString("de-DE")}</strong> –{" "}
                        <strong>{selectedTime}</strong> –{" "}
                        <strong>Platz {selectedCourt}</strong>
                    </p>
                    <button className="confirm-btn" onClick={handleBooking}>
                        {isLoggedIn ? 'Jetzt buchen' : 'Anmelden & Buchen'}
                    </button>
                </footer>
            )}
        </div>
    );
}