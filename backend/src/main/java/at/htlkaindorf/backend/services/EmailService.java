package at.htlkaindorf.backend.services;

import at.htlkaindorf.backend.entities.Entry;
import at.htlkaindorf.backend.entities.User;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    public void sendVerificationEmail(User user) {
        String subject = "Bitte bestätige deine E-Mail-Adresse";
        String verificationLink = "http://localhost:8080/api/auth/verify?token=" + user.getVerificationToken();
        String message = "Hallo " + user.getFirstName() + ",\n\n" +
                "Bitte bestätige deine E-Mail-Adresse durch Klick auf diesen Link:\n" +
                verificationLink + "\n\n" +
                "Dieser Link ist 24 Stunden gültig.";

        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(user.getEmail());
        mail.setSubject(subject);
        mail.setText(message);
        mailSender.send(mail);
    }

    public void sendReservationAcknowledgment(User user, Integer startHour, Integer endHour, LocalDate date) {
        String subject = "Buchung erfolgreich";
        String message = "Hallo " + user.getFirstName() + ",\n\n" +
                "Ihre Buchung für den " + date.toString() + " von " + startHour + " bis " + endHour + "\n" +
                "wurde erfolgreich gebucht!";

        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(user.getEmail());
        mail.setSubject(subject);
        mail.setText(message);
        mailSender.send(mail);
    }

    public void sendSubscriptionExpired(User user) {
        String subject = "Mitgliedsbeitrag abgelaufen";
        String message = "Hallo " + user.getFirstName() + ",\n\n" +
                "Ihr Mitgliedsbeitrag ist abgelaufen!";

        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(user.getEmail());
        mail.setSubject(subject);
        mail.setText(message);
        mailSender.send(mail);
    }
}
