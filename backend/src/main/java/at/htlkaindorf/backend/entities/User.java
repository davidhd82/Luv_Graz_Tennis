package at.htlkaindorf.backend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Inheritance(strategy = InheritanceType.JOINED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long userId;

    @Column(nullable = false)
    private String firstName;
    @Column(nullable = false)
    private String lastName;

    @Column(unique = true, nullable = false)
    private String email;
    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String postalCode;
    @Column(nullable = false)
    private String city;
    @Column(nullable = false)
    private String street;

    @Column(nullable = false)
    private String mobile;
    @Column(nullable = false)
    private String salutation;
    private String title;

    private boolean isAdmin;

    private boolean membershipPaid;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Entry> entries = new ArrayList<>();

    @Column(nullable = false)
    private boolean enabled = false;

    private String verificationToken;
    private LocalDateTime tokenExpiryDate;
}
