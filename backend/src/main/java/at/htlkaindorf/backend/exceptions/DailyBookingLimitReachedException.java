package at.htlkaindorf.backend.exceptions;

public class DailyBookingLimitReachedException extends RuntimeException {
    public DailyBookingLimitReachedException(String message) {
        super(message);
    }
}
