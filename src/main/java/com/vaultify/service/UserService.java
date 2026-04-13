package com.vaultify.service;

import com.vaultify.dto.RegisterRequest;
import com.vaultify.dto.UserResponse;
import com.vaultify.entity.User;

import java.util.List;

public interface UserService {

    User register(RegisterRequest request);

    List<UserResponse> findAll();

    UserResponse findById(Long id);

    UserResponse update(Long id, RegisterRequest request);

    void deleteById(Long id);

    User loadByUsername(String username);
}
