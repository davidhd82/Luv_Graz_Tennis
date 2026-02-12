package at.htlkaindorf.backend.exceptions;

public class TimeSlotAlreadyTakenException extends RuntimeException {
    public TimeSlotAlreadyTakenException(String message) {
        super(message);
    }
}
