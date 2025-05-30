package com.example.prototype;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class User {
    private int id;
    private String firstName;
    private String lastName;
    private String role;
    private String email;
}