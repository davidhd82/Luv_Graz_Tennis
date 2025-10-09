package at.htlkaindorf.backend.dtos;


import lombok.Data;

@Data
public class RegisterRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String postalCode;
    private String city;
    private String street;
    private String mobile;
    private String salutation;
    private String title;
}
