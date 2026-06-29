package ar.edu.itec1misiones.service;

import ar.edu.itec1misiones.model.User;

import java.util.Optional;

public interface UserLookupPort {
    Optional<User> findById(Long id);
}
