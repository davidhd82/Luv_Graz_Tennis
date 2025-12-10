import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Mock } from 'vitest';
import MainPage from '../views/MainPage';

interface User {
    id: number;
    name: string;
    email: string;
}

const mockNavigate: Mock = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        Outlet: () => <div data-testid="outlet">Outlet</div>,
    };
});


// HELPER FUNCTIONS
const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('MainPage - Test-Driven Development Tests', () => {
    beforeEach(() => {
        localStorage.clear();
        mockNavigate.mockClear();
        vi.clearAllTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // 1: Grundlegendes Rendering
    describe('Schritt 1: Grundlegendes Rendering', () => {
        it('sollte die Hauptüberschrift "TC LUV Graz" rendern', () => {
            renderWithRouter(<MainPage />);

            const clubTitle = screen.getByText('TC LUV Graz', { selector: '.club-title' });
            expect(clubTitle).toBeInTheDocument();
        });

        it('sollte die h1-Überschrift "TC LUV Graz" rendern', () => {
            renderWithRouter(<MainPage />);

            const mainHeading = screen.getByRole('heading', {
                name: /tc luv graz/i,
                level: 1
            });
            expect(mainHeading).toBeInTheDocument();
        });

        it('sollte die Hauptcontainer-Elemente rendern', () => {
            const { container } = renderWithRouter(<MainPage />);

            expect(container.querySelector('.app')).toBeInTheDocument();
            expect(container.querySelector('.full-width-header')).toBeInTheDocument();
            expect(container.querySelector('.full-hero')).toBeInTheDocument();
            expect(container.querySelector('.full-content')).toBeInTheDocument();
            expect(container.querySelector('.full-footer')).toBeInTheDocument();
        });
    });

    // 2: Navigation Links
    describe('Schritt 2: Navigation Links', () => {
        it('sollte alle Navigation-Links rendern', () => {
            renderWithRouter(<MainPage />);

            const regionenLink = screen.getByRole('link', { name: /regionen/i });
            const sportstaettenLink = screen.getByRole('link', { name: /sportstätten/i });
            const kurseLink = screen.getByRole('link', { name: /kurse & camps/i });

            expect(regionenLink).toBeInTheDocument();
            expect(sportstaettenLink).toBeInTheDocument();
            expect(kurseLink).toBeInTheDocument();
        });

        it('sollte korrekte href-Attribute für externe Links haben', () => {
            renderWithRouter(<MainPage />);

            const sportstaettenLink = screen.getByRole('link', { name: /sportstätten/i });
            const kurseLink = screen.getByRole('link', { name: /kurse & camps/i });

            expect(sportstaettenLink).toHaveAttribute('href', 'https://venuzle.at/anbieter-typ/sportstaetten/');
            expect(kurseLink).toHaveAttribute('href', 'https://venuzle.at/anbieter-typ/kurse/');
        });
    });

    // 3: Authentication State (Nicht eingeloggt)
    describe('Schritt 3: Authentication State - Nicht eingeloggt', () => {
        it('sollte Anmelden-Button anzeigen wenn nicht eingeloggt', () => {
            renderWithRouter(<MainPage />);

            const loginButton = screen.getByRole('button', { name: /anmelden/i });
            expect(loginButton).toBeInTheDocument();
        });

        it('sollte Registrieren-Button anzeigen wenn nicht eingeloggt', () => {
            renderWithRouter(<MainPage />);

            const registerButton = screen.getByRole('button', { name: /registrieren/i });
            expect(registerButton).toBeInTheDocument();
        });

        it('sollte UserProfile NICHT anzeigen wenn nicht eingeloggt', () => {
            const { container } = renderWithRouter(<MainPage />);

            const userProfile = container.querySelector('.user-profile');
            expect(userProfile).not.toBeInTheDocument();
        });

        it('sollte zu /login navigieren beim Klick auf Anmelden', () => {
            renderWithRouter(<MainPage />);

            const loginButton = screen.getByRole('button', { name: /anmelden/i });
            fireEvent.click(loginButton);

            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });

        it('sollte zu /register navigieren beim Klick auf Registrieren', () => {
            renderWithRouter(<MainPage />);

            const registerButton = screen.getByRole('button', { name: /registrieren/i });
            fireEvent.click(registerButton);

            expect(mockNavigate).toHaveBeenCalledWith('/register');
        });
    });

    // 4: Authentication State (Eingeloggt)
    describe('Schritt 4: Authentication State - Eingeloggt', () => {
        const mockUser: User = {
            id: 1,
            name: 'Max Mustermann',
            email: 'max@example.com'
        };

        beforeEach(() => {
            localStorage.setItem('token', 'fake-jwt-token');
            localStorage.setItem('user', JSON.stringify(mockUser));
        });

        it('sollte UserProfile anzeigen wenn eingeloggt', () => {
            const { container } = renderWithRouter(<MainPage />);

            const userProfile = container.querySelector('.user-profile');
            expect(userProfile).toBeInTheDocument();
        });

        it('sollte User-Greeting anzeigen', () => {
            const { container } = renderWithRouter(<MainPage />);

            const greeting = container.querySelector('.user-greeting');
            expect(greeting).toBeInTheDocument();
            expect(greeting).toHaveTextContent(/hallo/i);
        });

        it('sollte Anmelden/Registrieren-Buttons NICHT anzeigen wenn eingeloggt', () => {
            renderWithRouter(<MainPage />);

            const loginButton = screen.queryByRole('button', { name: /anmelden/i });
            const registerButton = screen.queryByRole('button', { name: /registrieren/i });

            expect(loginButton).not.toBeInTheDocument();
            expect(registerButton).not.toBeInTheDocument();
        });
    });

    // 5: Logout-Funktionalität
    describe('Schritt 5: Logout-Funktionalität', () => {
        const mockUser: User = {
            id: 1,
            name: 'Max Mustermann',
            email: 'max@example.com'
        };

        beforeEach(() => {
            localStorage.setItem('token', 'fake-jwt-token');
            localStorage.setItem('user', JSON.stringify(mockUser));
        });

        it('sollte UserProfile mit Dropdown anzeigen', () => {
            const { container } = renderWithRouter(<MainPage />);

            const userProfile = container.querySelector('.user-profile');
            const dropdown = container.querySelector('.dropdown-arrow');

            expect(userProfile).toBeInTheDocument();
            expect(dropdown).toBeInTheDocument();
        });

        it('sollte localStorage nutzen für User-Daten', () => {
            renderWithRouter(<MainPage />);

            // Verifiziere dass localStorage gelesen wird
            expect(localStorage.getItem('token')).toBe('fake-jwt-token');
            expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
        });

        it('sollte eingeloggt sein wenn Token und User vorhanden', () => {
            const { container } = renderWithRouter(<MainPage />);

            // User ist eingeloggt = UserProfile sichtbar, Login-Buttons nicht
            expect(container.querySelector('.user-profile')).toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /anmelden/i })).not.toBeInTheDocument();
        });
    });

    // 6: Bildkarussell
    describe('Schritt 6: Bildkarussell', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('sollte Carousel-Container rendern', () => {
            const { container } = renderWithRouter(<MainPage />);

            const carousel = container.querySelector('.hero-carousel');
            expect(carousel).toBeInTheDocument();
        });

        it('sollte 5 Carousel-Slides rendern', () => {
            const { container } = renderWithRouter(<MainPage />);

            const slides = container.querySelectorAll('.carousel-slide');
            expect(slides).toHaveLength(5);
        });

        it('sollte ersten Slide als aktiv markieren', () => {
            const { container } = renderWithRouter(<MainPage />);

            const slides = container.querySelectorAll('.carousel-slide');
            expect(slides[0]).toHaveClass('active');
        });

        it('sollte nach 5 Sekunden zum nächsten Slide wechseln', () => {
            const { container } = renderWithRouter(<MainPage />);

            const slidesBefore = container.querySelectorAll('.carousel-slide');
            expect(slidesBefore[0]).toHaveClass('active');
            expect(slidesBefore[1]).not.toHaveClass('active');

            // 5 Sekunden vorspulen mit act()
            act(() => {
                vi.advanceTimersByTime(5000);
            });

            const slidesAfter = container.querySelectorAll('.carousel-slide');
            expect(slidesAfter[1]).toHaveClass('active');
            expect(slidesAfter[0]).not.toHaveClass('active');
        });

        it('sollte nach dem letzten Slide wieder zum ersten zurückkehren', () => {
            const { container } = renderWithRouter(<MainPage />);

            // 25 Sekunden vorspulen (5 Slides × 5 Sekunden) mit act()
            act(() => {
                vi.advanceTimersByTime(25000);
            });

            const slides = container.querySelectorAll('.carousel-slide');
            expect(slides[0]).toHaveClass('active');
        });
    });

    // 7: Content-Bereich
    describe('Schritt 7: Content-Bereich', () => {
        it('sollte Vereinsbeschreibung anzeigen', () => {
            renderWithRouter(<MainPage />);

            const description = screen.getByText(/seit nunmehr 40 jahren/i);
            expect(description).toBeInTheDocument();
        });

        it('sollte Features-Liste anzeigen', () => {
            renderWithRouter(<MainPage />);

            expect(screen.getByText('5 Sandplätze')).toBeInTheDocument();
            expect(screen.getByText('Kantine')).toBeInTheDocument();
            expect(screen.getByText('Gastgarten')).toBeInTheDocument();
            expect(screen.getByText('Eigene Parkplätze')).toBeInTheDocument();
        });

        it('sollte Kontaktinformationen anzeigen', () => {
            renderWithRouter(<MainPage />);

            expect(screen.getByText(/kunssiegasse 16/i)).toBeInTheDocument();
            expect(screen.getByText(/\+43 316 123 456/i)).toBeInTheDocument();
            expect(screen.getByText(/info@tcluvgraz\.at/i)).toBeInTheDocument();
        });

        it('sollte Öffnungszeiten anzeigen', () => {
            renderWithRouter(<MainPage />);

            expect(screen.getByText(/mo-fr 8:00-22:00/i)).toBeInTheDocument();
        });
    });

    // 8: Buchungs-Button
     describe('Schritt 8: Buchungs-Button', () => {
        it('sollte Online-Buchen-Button rendern', () => {
            renderWithRouter(<MainPage />);

            const bookingButton = screen.getByRole('button', { name: /online buchen/i });
            expect(bookingButton).toBeInTheDocument();
        });

        it('sollte zu /booking navigieren beim Klick auf Online Buchen', () => {
            renderWithRouter(<MainPage />);

            const bookingButton = screen.getByRole('button', { name: /online buchen/i });
            fireEvent.click(bookingButton);

            expect(mockNavigate).toHaveBeenCalledWith('/booking');
        });
    });

    // 9: Footer
    describe('Schritt 9: Footer', () => {
        it('sollte Footer rendern', () => {
            const { container } = renderWithRouter(<MainPage />);

            const footer = container.querySelector('.full-footer');
            expect(footer).toBeInTheDocument();
        });

        it('sollte VENUZLE-Unterstützung anzeigen', () => {
            const { container } = renderWithRouter(<MainPage />);

            expect(screen.getByText('UNTERSTÜTZT VON')).toBeInTheDocument();

            // Spezifisch nach VENUZLE im Support-Logo suchen
            const supportLogo = container.querySelector('.support-logo');
            expect(supportLogo).toHaveTextContent('VENUZLE');
        });

        it('sollte Social-Media-Links rendern', () => {
            renderWithRouter(<MainPage />);

            const facebookLink = screen.getByRole('link', { name: /facebook/i });
            const instagramLink = screen.getByRole('link', { name: /instagram/i });
            const twitterLink = screen.getByRole('link', { name: /twitter/i });

            expect(facebookLink).toBeInTheDocument();
            expect(instagramLink).toBeInTheDocument();
            expect(twitterLink).toBeInTheDocument();
        });

        it('sollte korrekte Social-Media-URLs haben', () => {
            renderWithRouter(<MainPage />);

            const facebookLink = screen.getByRole('link', { name: /facebook/i });
            const instagramLink = screen.getByRole('link', { name: /instagram/i });

            expect(facebookLink).toHaveAttribute('href', 'https://www.facebook.com/Venuzle');
            expect(instagramLink).toHaveAttribute('href', 'https://www.instagram.com/venuzle');
        });

        it('sollte Footer-Links rendern', () => {
            renderWithRouter(<MainPage />);

            expect(screen.getByRole('link', { name: /für sportanbieter/i })).toBeInTheDocument();
            expect(screen.getByRole('link', { name: /karriere/i })).toBeInTheDocument();
            expect(screen.getByRole('link', { name: /agb/i })).toBeInTheDocument();
            expect(screen.getByRole('link', { name: /datenschutz/i })).toBeInTheDocument();
            expect(screen.getByRole('link', { name: /impressum/i })).toBeInTheDocument();
        });

        it('sollte Copyright mit aktuellem Jahr anzeigen', () => {
            renderWithRouter(<MainPage />);

            const currentYear = new Date().getFullYear();
            const copyright = screen.getByText(new RegExp(`${currentYear}.*TC LUV GRAZ`, 'i'));

            expect(copyright).toBeInTheDocument();
        });
    });

    // 10: Outlet
    describe('Schritt 10: React Router Outlet', () => {
        it('sollte Outlet-Komponente rendern', () => {
            renderWithRouter(<MainPage />);

            const outlet = screen.getByTestId('outlet');
            expect(outlet).toBeInTheDocument();
        });
    });

    // 11: Integration Tests
    describe('Schritt 11: Integration Tests', () => {
        it('sollte kompletten Login-Flow durchführen', () => {
            // Schritt 1: Login-Daten in localStorage setzen (BEVOR Komponente rendert)
            const mockUser: User = { id: 1, name: 'Test User', email: 'test@test.com' };
            localStorage.setItem('token', 'test-token');
            localStorage.setItem('user', JSON.stringify(mockUser));

            // Schritt 2: Komponente rendern (useEffect liest localStorage)
            const { container } = renderWithRouter(<MainPage />);

            // Schritt 3: Verifizieren dass User eingeloggt ist
            expect(container.querySelector('.user-profile')).toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /anmelden/i })).not.toBeInTheDocument();

            // Schritt 4: Verifizieren dass Login-State korrekt gesetzt wurde
            expect(container.querySelector('.user-greeting')).toBeInTheDocument();
        });

        it('sollte localStorage-basierte Authentifizierung testen', () => {
            // Setup: Eingeloggter User
            const mockUser: User = { id: 1, name: 'Test User', email: 'test@test.com' };
            localStorage.setItem('token', 'test-token');
            localStorage.setItem('user', JSON.stringify(mockUser));

            const { container } = renderWithRouter(<MainPage />);

            // Verifizieren: User ist eingeloggt
            expect(container.querySelector('.user-profile')).toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /anmelden/i })).not.toBeInTheDocument();
        });

        it('sollte alle Navigation-Aktionen korrekt durchführen', () => {
            renderWithRouter(<MainPage />);

            // Test: Login-Navigation
            const loginButton = screen.getByRole('button', { name: /anmelden/i });
            fireEvent.click(loginButton);
            expect(mockNavigate).toHaveBeenCalledWith('/login');

            mockNavigate.mockClear();

            // Test: Register-Navigation
            const registerButton = screen.getByRole('button', { name: /registrieren/i });
            fireEvent.click(registerButton);
            expect(mockNavigate).toHaveBeenCalledWith('/register');

            mockNavigate.mockClear();

            // Test: Booking-Navigation
            const bookingButton = screen.getByRole('button', { name: /online buchen/i });
            fireEvent.click(bookingButton);
            expect(mockNavigate).toHaveBeenCalledWith('/booking');
        });
    });

    //  12: Edge Cases und Error Handling
    describe('Schritt 12: Edge Cases', () => {
        it('sollte mit ungültigem JSON in localStorage umgehen können', () => {
            localStorage.setItem('user', 'invalid-json{');

            expect(() => {
                renderWithRouter(<MainPage />);
            }).not.toThrow();
        });

        it('sollte mit fehlendem Token aber vorhandenem User umgehen', () => {
            localStorage.setItem('user', JSON.stringify({ name: 'Test' }));
            // Kein Token gesetzt

            renderWithRouter(<MainPage />);

            // Sollte als nicht eingeloggt behandelt werden
            expect(screen.getByRole('button', { name: /anmelden/i })).toBeInTheDocument();
        });

        it('sollte mit vorhandenem Token aber fehlendem User umgehen', () => {
            localStorage.setItem('token', 'test-token');
            // Kein User gesetzt

            renderWithRouter(<MainPage />);

            // Sollte als nicht eingeloggt behandelt werden
            expect(screen.getByRole('button', { name: /anmelden/i })).toBeInTheDocument();
        });

        it('sollte Carousel-Interval beim Unmount clearen', () => {
            vi.useFakeTimers();

            const { unmount } = renderWithRouter(<MainPage />);

            const clearIntervalSpy = vi.spyOn(window, 'clearInterval');

            unmount();

            expect(clearIntervalSpy).toHaveBeenCalled();

            clearIntervalSpy.mockRestore();
            vi.useRealTimers();
        });
    });
});