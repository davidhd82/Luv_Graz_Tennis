import "../css/Booking.css";

type Venue = {
    id: number;
    name: string;
    courts: number;
    available: number;
};

const venues: Venue[] = [
    { id: 1, name: "Center Court", courts: 4, available: 2 },
    { id: 2, name: "Südplatz", courts: 3, available: 1 },
    { id: 3, name: "Halle Nord", courts: 5, available: 0 },
];

const hours = [
    "08:00", "09:00", "10:00", "11:00",
    "12:00", "13:00", "14:00", "15:00",
    "16:00", "17:00", "18:00", "19:00", "20:00"
];

export default function VenuesPage() {
    const today = new Date().toLocaleDateString("de-DE", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });

    return (
        <div className="page">
            <header className="header">
                <h1>🎾 Tennis Luv</h1>
                <span>{today}</span>
            </header>

            <section className="slots">
                <h2>Tagesübersicht</h2>
                <div className="slots-grid">
                    {hours.map((h) => (
                        <div key={h} className="slot">{h}</div>
                    ))}
                </div>
            </section>

            <main className="grid">
                {venues.map((v) => (
                    <div key={v.id} className="card">
                        <h2>{v.name}</h2>
                        <p>Plätze: <strong>{v.courts}</strong></p>
                        <p className={v.available > 0 ? "free" : "full"}>
                            {v.available > 0
                                ? `${v.available} verfügbar`
                                : "keine frei"}
                        </p>
                        <button disabled={v.available === 0}>
                            {v.available > 0 ? "Buchen ✅" : "Nicht verfügbar ❌"}
                        </button>
                    </div>
                ))}
            </main>
        </div>
    );
}