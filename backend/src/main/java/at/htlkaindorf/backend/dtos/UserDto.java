package at.htlkaindorf.backend.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {

    private Long userId;
    private String firstName;
    private String lastName;
    private String email;

    private String postalCode;
    private String city;
    private String street;
    private String mobile;
    private String salutation;
    private String title;

    private boolean isAdmin;
}
