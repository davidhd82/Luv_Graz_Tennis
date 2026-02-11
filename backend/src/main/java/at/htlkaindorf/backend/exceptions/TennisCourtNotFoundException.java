package at.htlkaindorf.backend.exceptions;

public class TennisCourtNotFoundException extends RuntimeException {
    public TennisCourtNotFoundException(String message) {
        super(message);
    }
}
