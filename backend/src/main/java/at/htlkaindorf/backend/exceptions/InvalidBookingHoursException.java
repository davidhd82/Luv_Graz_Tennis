package at.htlkaindorf.backend.exceptions;

public class InvalidBookingHoursException extends RuntimeException {
    public InvalidBookingHoursException(String message) {
        super(message);
    }
}
