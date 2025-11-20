package at.htlkaindorf.backend.dtos;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {
    private String firstName;
    private String lastName;
    @NotBlank
    @Email(message = "Bitte gib eine gültige E-Mail-Adresse ein")
    private String email;
    @NotBlank
    private String password;
    private String postalCode;
    private String city;
    private String street;
    private String mobile;
    private String salutation;
    private String title;
}
