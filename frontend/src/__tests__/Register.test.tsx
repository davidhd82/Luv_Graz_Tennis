import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Register from "../views/Register";
import { BrowserRouter } from "react-router-dom";

vi.mock("react-router-dom", async (importOriginal) => {
    const actual: any = await importOriginal();
    return {
        ...actual,
        useNavigate: vi.fn(() => vi.fn()),
    };
});

describe("Register Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });


    it("updates input fields correctly", () => {
        render(<BrowserRouter><Register onAuthSuccess={vi.fn()} /></BrowserRouter>);
        const firstName = screen.getByLabelText(/Vorname/i) as HTMLInputElement;
        fireEvent.change(firstName, { target: { value: "Max" } });
        expect(firstName.value).toBe("Max");
    });

    it("shows error when passwords don't match", async () => {
        render(<BrowserRouter><Register onAuthSuccess={vi.fn()} /></BrowserRouter>);

        // Pflichtfelder ausfüllen
        fireEvent.change(screen.getByLabelText(/Vorname/i), { target: { value: "Max" } });
        fireEvent.change(screen.getByLabelText(/Nachname/i), { target: { value: "Mustermann" } });
        fireEvent.change(screen.getByLabelText(/E-Mail/i), { target: { value: "test@example.com" } });

        fireEvent.change(screen.getByLabelText(/^Passwort:/i), { target: { value: "abc123" } });
        fireEvent.change(screen.getByLabelText(/Passwort bestätigen/i), { target: { value: "xyz987" } });

        fireEvent.click(screen.getByRole("button", { name: /Registrieren/i }));

        expect(await screen.findByText(/Passwörter stimmen nicht überein/i)).toBeInTheDocument();
    });

    it("shows backend error on failed registration", async () => {
        globalThis.fetch = vi.fn().mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: "Email bereits vergeben" })
        });

        render(<BrowserRouter><Register onAuthSuccess={vi.fn()} /></BrowserRouter>);

        fireEvent.change(screen.getByLabelText(/Vorname/), { target: { value: "Max" } });
        fireEvent.change(screen.getByLabelText(/Nachname/), { target: { value: "Mustermann" } });
        fireEvent.change(screen.getByLabelText(/E-Mail/), { target: { value: "test@example.com" } });
        fireEvent.change(screen.getByLabelText(/^Passwort:/i), { target: { value: "abc123" } });
        fireEvent.change(screen.getByLabelText(/Passwort bestätigen/i), { target: { value: "abc123" } });

        fireEvent.click(screen.getByRole("button", { name: /Registrieren/i }));

        expect(await screen.findByText(/Email bereits vergeben/i)).toBeInTheDocument();
    });

    /*it("calls onAuthSuccess and stores token on success", async () => {
        const mockOnAuthSuccess = vi.fn();
        const mockResponse = { token: "test-token", email: "test@example.com", firstName: "Max", lastName: "Mustermann" };

        globalThis.fetch = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => mockResponse });

        render(<BrowserRouter><Register onAuthSuccess={mockOnAuthSuccess} /></BrowserRouter>);

        fireEvent.change(screen.getByLabelText(/Vorname/), { target: { value: "Max" } });
        fireEvent.change(screen.getByLabelText(/Nachname/), { target: { value: "Mustermann" } });
        fireEvent.change(screen.getByLabelText(/E-Mail/), { target: { value: "test@example.com" } });
        fireEvent.change(screen.getByLabelText(/^Passwort:/i), { target: { value: "abc123" } });
        fireEvent.change(screen.getByLabelText(/Passwort bestätigen/i), { target: { value: "abc123" } });

        fireEvent.click(screen.getByRole("button", { name: /Registrieren/i }));

        await waitFor(() => {
            expect(mockOnAuthSuccess).toHaveBeenCalledWith("test-token", mockResponse);
        });

        expect(localStorage.getItem("token")).toBe("test-token");
    });

     */

    it("shows loading state while submitting", async () => {
        globalThis.fetch = vi.fn().mockImplementationOnce(() =>
            new Promise(resolve => setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 120))
        );

        render(<BrowserRouter><Register onAuthSuccess={vi.fn()} /></BrowserRouter>);

        fireEvent.change(screen.getByLabelText(/Vorname/), { target: { value: "Max" } });
        fireEvent.change(screen.getByLabelText(/Nachname/), { target: { value: "Mustermann" } });
        fireEvent.change(screen.getByLabelText(/E-Mail/), { target: { value: "test@example.com" } });
        fireEvent.change(screen.getByLabelText(/^Passwort:/i), { target: { value: "abc123" } });
        fireEvent.change(screen.getByLabelText(/Passwort bestätigen/i), { target: { value: "abc123" } });

        fireEvent.click(screen.getByRole("button", { name: /Registrieren/i }));

        expect(screen.getByText("Lädt...")).toBeInTheDocument();
        expect(screen.getByRole("button")).toBeDisabled();
    });
});