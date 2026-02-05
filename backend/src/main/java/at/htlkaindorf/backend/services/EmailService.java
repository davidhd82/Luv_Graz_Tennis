package at.htlkaindorf.backend.services;

import at.htlkaindorf.backend.entities.User;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import org.springframework.beans.factory.annotation.Value;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.base-url}")
    private String baseUrl;
    private static final String BRAND_NAME = "Service";
    private static final String SUPPORT_FOOTER_TEXT = "Wenn Sie diese E-Mail nicht erwartet haben, können Sie sie ignorieren.";

    public void sendVerificationEmail(User user) {
        String subject = "Bitte bestätigen Sie Ihre E-Mail-Adresse";
        String verificationLink = baseUrl + "/api/auth/verify?token=" + user.getVerificationToken();

        String plainText =
                "Hallo " + safe(user.getFirstName()) + ",\n\n" +
                        "bitte bestätigen Sie Ihre E-Mail-Adresse über diesen Link:\n" +
                        verificationLink + "\n\n" +
                        "Dieser Link ist 24 Stunden gültig.\n";

        String contentHtml = """
                <h1 style="margin:0 0 12px 0;font-size:20px;line-height:1.3;color:#111827;">
                    E-Mail-Adresse bestätigen
                </h1>
                <p style="margin:0 0 16px 0;color:#374151;font-size:14px;line-height:1.6;">
                    Hallo <strong>%s</strong>,
                </p>
                <p style="margin:0 0 16px 0;color:#374151;font-size:14px;line-height:1.6;">
                    bitte bestätigen Sie Ihre E-Mail-Adresse, indem Sie auf den folgenden Button klicken.
                </p>
                <div style="text-align:center;margin:22px 0;">
                    <a href="%s"
                       style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;
                              padding:12px 18px;border-radius:8px;font-weight:600;font-size:14px;">
                        E-Mail bestätigen
                    </a>
                </div>
                <p style="margin:0 0 10px 0;color:#374151;font-size:14px;line-height:1.6;">
                    Alternativ können Sie diesen Link in Ihren Browser kopieren:
                </p>
                <p style="margin:0 0 16px 0;color:#2563eb;font-size:13px;line-height:1.6;word-break:break-all;">
                    <a href="%s" style="color:#2563eb;text-decoration:underline;">%s</a>
                </p>
                <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">
                    Dieser Link ist 24 Stunden gültig.
                </p>
                """.formatted(
                escapeHtml(safe(user.getFirstName())),
                escapeHtml(verificationLink),
                escapeHtml(verificationLink),
                escapeHtml(verificationLink)
        );

        sendHtmlMail(user.getEmail(), subject, plainText, wrapHtml(subject, contentHtml));
    }

    public void sendReservationAcknowledgment(User user, Integer startHour, Integer endHour, LocalDate date) {
        String subject = "Buchung erfolgreich";

        String dateStr = date != null ? date.toString() : "";
        String timeStr = (startHour != null ? startHour : "") + ":00 – " + (endHour != null ? endHour : "") + ":00";

        String plainText =
                "Hallo " + safe(user.getFirstName()) + ",\n\n" +
                        "Ihre Buchung wurde erfolgreich gespeichert.\n" +
                        "Datum: " + dateStr + "\n" +
                        "Uhrzeit: " + timeStr + "\n";

        String contentHtml = """
                <h1 style="margin:0 0 12px 0;font-size:20px;line-height:1.3;color:#111827;">
                    Buchung bestätigt
                </h1>
                <p style="margin:0 0 16px 0;color:#374151;font-size:14px;line-height:1.6;">
                    Hallo <strong>%s</strong>,
                </p>
                <p style="margin:0 0 18px 0;color:#374151;font-size:14px;line-height:1.6;">
                    Ihre Buchung wurde erfolgreich gespeichert.
                </p>
                <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:14px 16px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%%;border-collapse:collapse;">
                        <tr>
                            <td style="padding:6px 0;color:#6b7280;font-size:13px;width:120px;">Datum</td>
                            <td style="padding:6px 0;color:#111827;font-size:13px;font-weight:600;">%s</td>
                        </tr>
                        <tr>
                            <td style="padding:6px 0;color:#6b7280;font-size:13px;width:120px;">Uhrzeit</td>
                            <td style="padding:6px 0;color:#111827;font-size:13px;font-weight:600;">%s</td>
                        </tr>
                    </table>
                </div>
                <p style="margin:18px 0 0 0;color:#6b7280;font-size:13px;line-height:1.6;">
                    Vielen Dank.
                </p>
                """.formatted(
                escapeHtml(safe(user.getFirstName())),
                escapeHtml(dateStr),
                escapeHtml(timeStr)
        );

        sendHtmlMail(user.getEmail(), subject, plainText, wrapHtml(subject, contentHtml));
    }

    public void sendSubscriptionExpired(User user) {
        String subject = "Mitgliedsbeitrag abgelaufen";

        String plainText =
                "Hallo " + safe(user.getFirstName()) + ",\n\n" +
                        "Ihr Mitgliedsbeitrag ist abgelaufen.\n" +
                        "Bitte erneuern Sie Ihren Beitrag, um den Service weiterhin nutzen zu können.\n";

        String contentHtml = """
                <h1 style="margin:0 0 12px 0;font-size:20px;line-height:1.3;color:#111827;">
                    Mitgliedsbeitrag abgelaufen
                </h1>
                <p style="margin:0 0 16px 0;color:#374151;font-size:14px;line-height:1.6;">
                    Hallo <strong>%s</strong>,
                </p>
                <p style="margin:0 0 16px 0;color:#374151;font-size:14px;line-height:1.6;">
                    Ihr Mitgliedsbeitrag ist abgelaufen. Bitte erneuern Sie Ihren Beitrag, um den Service weiterhin nutzen zu können.
                </p>
                <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:14px 16px;">
                    <p style="margin:0;color:#9a3412;font-size:13px;line-height:1.6;">
                        Hinweis: Falls Sie bereits verlängert haben, können Sie diese Nachricht ignorieren.
                    </p>
                </div>
                """.formatted(escapeHtml(safe(user.getFirstName())));

        sendHtmlMail(user.getEmail(), subject, plainText, wrapHtml(subject, contentHtml));
    }

    private void sendHtmlMail(String to, String subject, String plainText, String htmlText) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(plainText, htmlText);
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("E-Mail konnte nicht gesendet werden", e);
        }
    }

    private String wrapHtml(String preheader, String bodyContent) {
        String safePreheader = escapeHtml(safe(preheader));
        String footer = """
                <p style="margin:24px 0 0 0;color:#9ca3af;font-size:12px;line-height:1.6;text-align:center;">
                    %s
                </p>
                <p style="margin:8px 0 0 0;color:#9ca3af;font-size:12px;line-height:1.6;text-align:center;">
                    %s
                </p>
                """.formatted(escapeHtml(SUPPORT_FOOTER_TEXT), escapeHtml(BRAND_NAME));

        return """
                <!doctype html>
                <html lang="de">
                <head>
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <title>%s</title>
                </head>
                <body style="margin:0;padding:0;background:#f3f4f6;">
                    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
                        %s
                    </div>
                    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%%;border-collapse:collapse;background:#f3f4f6;">
                        <tr>
                            <td style="padding:24px 12px;">
                                <table role="presentation" cellpadding="0" cellspacing="0"
                                       style="max-width:620px;width:100%%;margin:0 auto;background:#ffffff;border-radius:12px;
                                              border:1px solid #e5e7eb;">
                                    <tr>
                                        <td style="padding:22px 22px 10px 22px;">
                                            <div style="font-size:14px;font-weight:700;color:#111827;">%s</div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:0 22px 22px 22px;">
                                            %s
                                            %s
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """.formatted(
                safePreheader,
                safePreheader,
                escapeHtml(BRAND_NAME),
                bodyContent,
                footer
        );
    }

    private String safe(String s) {
        return s == null ? "" : s;
    }

    private String escapeHtml(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
