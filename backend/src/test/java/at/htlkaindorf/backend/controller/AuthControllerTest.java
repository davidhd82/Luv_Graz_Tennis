package at.htlkaindorf.backend.controller;

import at.htlkaindorf.backend.dtos.LoginRequest;
import at.htlkaindorf.backend.dtos.RegisterRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc // testen einer HTTP-Anfrage
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void register_createsUserAndReturnsToken() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("newuser@gmail.com");
        request.setPassword("secret");
        request.setFirstName("New");
        request.setLastName("User");
        request.setCity("Graz");
        request.setStreet("Hauptstraße 1");
        request.setPostalCode("8010");
        request.setMobile("123456789");
        request.setSalutation("Herr");


        mockMvc.perform(post("/api/auth/register") //startet den Requestx
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.email").value("newuser@gmail.com"));
    }

    @Test
    void login_returnsToken() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");
        request.setPassword("secret");
        request.setFirstName("Max");
        request.setLastName("Mustermann");
        request.setCity("Graz");
        request.setStreet("Hauptstraße 1");
        request.setPostalCode("8010");
        request.setMobile("0123456789");
        request.setSalutation("Herr");


        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        // Dann Login
        LoginRequest login = new LoginRequest();
        login.setEmail("test@example.com");
        login.setPassword("secret");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }
}
