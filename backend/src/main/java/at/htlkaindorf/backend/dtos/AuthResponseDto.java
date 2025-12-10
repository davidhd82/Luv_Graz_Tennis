package at.htlkaindorf.backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponseDto {
    private String token;
    private String email;
    private String firstName;
    private String lastName;
    private boolean isAdmin;
}
