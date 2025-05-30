package com.example.prototype;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class User {
    private String employeeId;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
}