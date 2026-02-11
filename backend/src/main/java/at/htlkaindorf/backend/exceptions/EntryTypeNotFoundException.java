package at.htlkaindorf.backend.exceptions;

public class EntryTypeNotFoundException extends RuntimeException {
    public EntryTypeNotFoundException(String message) {
        super(message);
    }
}
