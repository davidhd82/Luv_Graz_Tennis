package at.htlkaindorf.backend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Inheritance(strategy = InheritanceType.JOINED)
public class User implements UserDetails {

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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "varchar(20) default 'USER'")
    private Role role = Role.USER;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean superAdmin = false;

    private boolean membershipPaid;

    private LocalDate membershipEndDate;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Entry> entries = new ArrayList<>();

    @Column(nullable = false)
    private boolean enabled = false;

    private String verificationToken;
    private LocalDateTime tokenExpiryDate;

    private String passwordResetToken;
    private LocalDateTime passwordResetTokenExpiry;

    @Column(nullable = false)
    private int maxDailyBookingHours = 2;

    public boolean isAdmin() {
        return role == Role.ADMIN;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + (role != null ? role.name() : Role.USER.name())));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
}
