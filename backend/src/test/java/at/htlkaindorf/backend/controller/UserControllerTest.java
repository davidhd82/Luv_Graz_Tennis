package at.htlkaindorf.backend.controller;

import at.htlkaindorf.backend.entities.User;
import at.htlkaindorf.backend.repositories.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc //HTTP-Requests an Controller simulieren
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private User user;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        user = new User();
        user.setEmail("albin@gmail.com");
        user.setFirstName("Albin");
        user.setLastName("B");
        user.setCity("Graz");
        user.setMobile("123456789");
        user.setPostalCode("8010");
        user.setStreet("Hauptstraße 1");
        user.setSalutation("Herr");
        user.setPassword("secret");
        user.setAdmin(false);

        userRepository.save(user);
    }

    @Test
    @WithMockUser(username = "albin@gmail.com") // simuliert eingeloggten User
    void getCurrentUser_returnsUserDto() throws Exception {
        mockMvc.perform(get("/api/user/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Albin"))
                .andExpect(jsonPath("$.lastName").value("B"))
                .andExpect(jsonPath("$.city").value("Graz"));
    }

    @Test
    @WithMockUser(username = "albin@gmail.com")
    void updateUser_updatesUserData() throws Exception {
        user.setFirstName("AlbinUpdated");
        user.setCity("Vienna");

        mockMvc.perform(put("/api/user/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("AlbinUpdated"))
                .andExpect(jsonPath("$.city").value("Vienna"));
    }

    @Test
    @WithMockUser(username = "albin@gmail.com")
    void deleteCurrentUser_deletesUser() throws Exception {
        mockMvc.perform(delete("/api/user/delete"))
                .andExpect(status().isNoContent());

        assertFalse(userRepository.existsByEmail("albin@gmail.com"));
    }
}
