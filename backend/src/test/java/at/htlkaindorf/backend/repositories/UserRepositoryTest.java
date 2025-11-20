package at.htlkaindorf.backend.repositories;

import at.htlkaindorf.backend.entities.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;


@SpringBootTest
public class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        User user1 = new User();
        user1.setEmail("albin@gmail.com");
        user1.setFirstName("Albin");
        user1.setLastName("B");
        user1.setCity("Graz");
        user1.setMobile("123456789");
        user1.setPostalCode("8010");
        user1.setStreet("Hauptstraße 1");
        user1.setSalutation("Herr");
        user1.setPassword("secret");
        user1.setAdmin(false);

        User user2 = new User();
        user2.setEmail("clemens@gmail.com");
        user2.setFirstName("Clemens");
        user2.setLastName("M");
        user2.setCity("Graz");
        user2.setMobile("987654321");
        user2.setPostalCode("8010");
        user2.setStreet("Nebenstraße 2");
        user2.setSalutation("Herr");
        user2.setPassword("secret");
        user2.setAdmin(false);

        userRepository.save(user1);
        userRepository.save(user2);
    }


    @Test
    void existsByEmail(){
        String email = "albin@gmail.com";

        boolean actual = userRepository.existsByEmail(email);
        boolean expected = true;


        assertEquals(expected, actual, "existsByEmail sollte true zurückgeben, wenn der User existiert");
    }
    @Test
    void findByEmailTest() {
        String email = "clemens@gmail.com";

        Optional<User> optionalUser = userRepository.findByEmail(email);

        assertTrue(optionalUser.isPresent(), "findByEmail sollte einen User zurückgeben, wenn die E-Mail existiert");

        User user = optionalUser.get();
        assertEquals("Clemens", user.getFirstName(), "Der Vorname sollte 'Clemens' sein");
        assertEquals("M", user.getLastName(), "Der Nachname sollte 'M' sein");
        assertEquals("Graz", user.getCity(), "Die Stadt sollte 'Graz' sein");
    }



}
