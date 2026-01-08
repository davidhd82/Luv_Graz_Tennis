import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Login from "../views/Login.tsx";

// Mock navigate()
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => vi.fn()
    };
});

describe('Login component', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    const renderLogin = (onAuthSuccess = vi.fn()) =>
        render(
            <BrowserRouter>
                <Login onAuthSuccess={onAuthSuccess} />
            </BrowserRouter>
        );

    it('renders inputs and button', () => {
        renderLogin();
        expect(screen.getByLabelText(/E-Mail/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Passwort/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Anmelden/i })).toBeInTheDocument();
    });

    it('shows error when login fails (user not found)', async () => {
        globalThis.fetch = vi.fn().mockResolvedValueOnce({
            ok: false,
            json: async () => ({})
        });

        renderLogin();

        fireEvent.change(screen.getByLabelText(/E-Mail/i), {
            target: { value: 'wrong@example.com' }
        });
        fireEvent.change(screen.getByLabelText(/Passwort/i), {
            target: { value: 'incorrect123' }
        });

        fireEvent.click(screen.getByRole('button', { name: 'Anmelden' }));

        expect(await screen.findByText(/Ungültige Anmeldedaten/i)).toBeInTheDocument();
    });

    it('updates input values on change', () => {
        renderLogin();

        const emailInput = screen.getByLabelText(/E-Mail/i) as HTMLInputElement;
        const passwordInput = screen.getByLabelText(/Passwort/i) as HTMLInputElement;

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(emailInput.value).toBe('test@example.com');
        expect(passwordInput.value).toBe('password123');
    });

    it('calls onAuthSuccess, stores data, and navigates on successful login', async () => {
        const mockOnAuthSuccess = vi.fn();

        const mockResponse = {
            token: 'test-token',
            email: 'test@example.com',
            firstName: 'Max',
            lastName: 'Mustermann',
            userId: 10,
            isAdmin: true
        };

        globalThis.fetch = vi.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse
        });

        renderLogin(mockOnAuthSuccess);

        fireEvent.change(screen.getByLabelText(/E-Mail/i), {
            target: { value: 'test@example.com' }
        });
        fireEvent.change(screen.getByLabelText(/Passwort/i), {
            target: { value: 'password123' }
        });

        fireEvent.click(screen.getByRole('button', { name: 'Anmelden' }));

        await waitFor(() => {
            const expectedUser = {
                userId: 10,
                email: "test@example.com",
                firstName: "Max",
                lastName: "Mustermann",
                isAdmin: true
            };

            expect(mockOnAuthSuccess).toHaveBeenCalledWith('test-token', expectedUser);

            // check localStorage
            expect(localStorage.getItem('token')).toBe('test-token');
            expect(JSON.parse(localStorage.getItem('user')!)).toEqual(expectedUser);
        });
    });

    it('shows loading state during login', async () => {
        globalThis.fetch = vi.fn().mockImplementationOnce(
            () => new Promise(resolve =>
                setTimeout(
                    () =>
                        resolve({
                            ok: false,
                            json: async () => ({})
                        }),
                    80
                )
            )
        );

        renderLogin();

        fireEvent.change(screen.getByLabelText(/E-Mail/i), {
            target: { value: 'test@example.com' }
        });
        fireEvent.change(screen.getByLabelText(/Passwort/i), {
            target: { value: 'password123' }
        });

        fireEvent.click(screen.getByRole('button', { name: 'Anmelden' }));

        // loading text appears
        expect(screen.getByText('Lädt...')).toBeInTheDocument();

        // button disabled
        expect(screen.getByRole('button')).toBeDisabled();
    });
});
