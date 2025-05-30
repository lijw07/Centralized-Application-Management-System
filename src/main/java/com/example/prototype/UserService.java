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
        try (Connection conn = DriverManager.getConnection(config.getUrl(), config.getUsername(), config.getPassword());
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT employeeId, firstName, lastName, email, role FROM Employees")) {
            while (rs.next()) {
                users.add(new User(
                        rs.getString("employeeId"),
                        rs.getString("firstName"),
                        rs.getString("lastName"),
                        rs.getString("email"),
                        rs.getString("role")
                ));
            }
        }
        return users;
    }
}