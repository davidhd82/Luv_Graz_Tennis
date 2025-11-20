import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Login from "../views/Login.tsx";

describe('Login component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders inputs and button', () => {
        render(
            <BrowserRouter>
                <Login onAuthSuccess={vi.fn()} />
            </BrowserRouter>
        );

        expect(screen.getByLabelText(/E-Mail/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Passwort/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Anmelden/i })).toBeInTheDocument();
    });

    it('shows error when login fails (user not found)', async () => {
        globalThis.fetch = vi.fn().mockResolvedValueOnce({
            ok: false,
            json: async () => ({})
        });

        render(
            <BrowserRouter>
                <Login onAuthSuccess={vi.fn()} />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/E-Mail/i), {
            target: { value: 'nonexistent@example.com' }
        });
        fireEvent.change(screen.getByLabelText(/Passwort/i), {
            target: { value: 'password123' }
        });
        fireEvent.click(screen.getByRole('button', { name: 'Anmelden' }));

        const error = await screen.findByText(/Ungültige Anmeldedaten/i);
        expect(error).toBeInTheDocument();
    });

    it('updates input values on change', () => {
        render(
            <BrowserRouter>
                <Login onAuthSuccess={vi.fn()} />
            </BrowserRouter>
        );

        const emailInput = screen.getByLabelText(/E-Mail/i) as HTMLInputElement;
        const passwordInput = screen.getByLabelText(/Passwort/i) as HTMLInputElement;

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(emailInput.value).toBe('test@example.com');
        expect(passwordInput.value).toBe('password123');
    });

    it('calls onAuthSuccess and navigates on successful login', async () => {
        const mockOnAuthSuccess = vi.fn();
        const mockResponse = {
            token: 'test-token',
            email: 'test@example.com',
            firstName: 'Max',
            lastName: 'Mustermann'
        };

        globalThis.fetch = vi.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse
        });

        render(
            <BrowserRouter>
                <Login onAuthSuccess={mockOnAuthSuccess} />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/E-Mail/i), {
            target: { value: 'test@example.com' }
        });
        fireEvent.change(screen.getByLabelText(/Passwort/i), {
            target: { value: 'password123' }
        });
        fireEvent.click(screen.getByRole('button', { name: 'Anmelden' }));

        await waitFor(() => {
            expect(mockOnAuthSuccess).toHaveBeenCalledWith('test-token', mockResponse);
        });
    });

    it('shows loading state during login', async () => {
        globalThis.fetch = vi.fn().mockImplementationOnce(() =>
            new Promise(resolve => setTimeout(() => resolve({
                ok: false,
                json: async () => ({})
            }), 100))
        );

        render(
            <BrowserRouter>
                <Login onAuthSuccess={vi.fn()} />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/E-Mail/i), {
            target: { value: 'test@example.com' }
        });
        fireEvent.change(screen.getByLabelText(/Passwort/i), {
            target: { value: 'password123' }
        });
        fireEvent.click(screen.getByRole('button', { name: 'Anmelden' }));

        expect(screen.getByText('Lädt...')).toBeInTheDocument();
        expect(screen.getByRole('button')).toBeDisabled();
    });
});