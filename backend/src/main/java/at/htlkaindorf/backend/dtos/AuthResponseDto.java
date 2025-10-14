package at.htlkaindorf.backend.dtos;

import lombok.Data;

@Data
public class AuthResponseDto {
    private String token;
    private String email;
    private String firstName;
    private String lastName;
}
