package at.htlkaindorf.backend.services;

import at.htlkaindorf.backend.dtos.UserDto;
import at.htlkaindorf.backend.entities.User;
import at.htlkaindorf.backend.exceptions.UserNotFoundException;
import at.htlkaindorf.backend.mapper.UserMapper;
import at.htlkaindorf.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public User getCurrentUserEntity() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    public UserDto getCurrentUser() {
        return userMapper.toUserDTO(getCurrentUserEntity());
    }

    public UserDto updateUser(User updatedData) {
        User currentUser = getCurrentUserEntity();

        currentUser.setFirstName(updatedData.getFirstName());
        currentUser.setLastName(updatedData.getLastName());
        currentUser.setCity(updatedData.getCity());
        currentUser.setPostalCode(updatedData.getPostalCode());
        currentUser.setStreet(updatedData.getStreet());
        currentUser.setMobile(updatedData.getMobile());
        currentUser.setTitle(updatedData.getTitle());
        currentUser.setSalutation(updatedData.getSalutation());

        User saved = userRepository.save(currentUser);
        return userMapper.toUserDTO(saved);
    }

    public void deleteCurrentUser() {
        userRepository.delete(getCurrentUserEntity());
        SecurityContextHolder.clearContext();
    }
}
