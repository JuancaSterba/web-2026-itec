package ar.edu.itec1misiones.security.service;

import ar.edu.itec1misiones.model.User;
import ar.edu.itec1misiones.security.repository.UserRepository;
import ar.edu.itec1misiones.service.UserLookupPort;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserLookupPortImpl implements UserLookupPort {

    private final UserRepository userRepository;

    public UserLookupPortImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
}
