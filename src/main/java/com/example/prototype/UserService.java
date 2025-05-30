package com.example.prototype;

import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class UserService {
    public List<User> getUsers(DataSourceConfig config) throws SQLException, ClassNotFoundException {
        List<User> users = new ArrayList<>();
        if (config.getDriverClassName() != null && !config.getDriverClassName().isEmpty()) {
            Class.forName(config.getDriverClassName());
        }
        try (Connection conn = DriverManager.getConnection(
                config.getUrl(), config.getUsername(), config.getPassword());
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT Id, FirstName, LastName, EmailAddress, Role FROM User")) {
            while (rs.next()) {
                users.add(new User(
                        rs.getInt("Id"),
                        rs.getString("FirstName"),
                        rs.getString("LastName"),
                        rs.getString("EmailAddress"),
                        rs.getString("Role")
                ));
            }
        }
        return users;
    }
}