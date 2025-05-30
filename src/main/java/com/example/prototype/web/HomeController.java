package com.example.prototype.web;

import com.example.prototype.UserService;

import lombok.extern.slf4j.Slf4j;

import com.example.prototype.User;
import com.example.prototype.DataSourceConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Slf4j
@Controller
public class HomeController {

    @Autowired
    private UserService userService;

    @GetMapping("/")
    public String home(
        Model model,
        @RequestParam(value = "sort", required = false) String sort,
        @RequestParam(value = "dir", required = false, defaultValue = "asc") String dir
    ) {
        List<User> allUsers = new ArrayList<>();
        java.util.Set<String> seenEmployeeIds = new java.util.HashSet<>();
        for (DataSourceConfig config : SettingsController.dataSourceMap.values()) {
            if (config != null && config.getUrl() != null && !config.getUrl().isBlank()) {
                try {
                    List<User> usersFromSource = userService.getUsers(config);
                    for (User user : usersFromSource) {
                        if (user.getEmployeeId() != null && !seenEmployeeIds.contains(user.getEmployeeId())) {
                            allUsers.add(user);
                            seenEmployeeIds.add(user.getEmployeeId());
                        }
                    }
                } catch (Exception e) {
                    model.addAttribute("error", "Could not fetch users from one or more sources: " + e.getMessage());
                }
            }
        }

        if (sort != null && !"none".equalsIgnoreCase(dir)) {
            Comparator<User> comparator = switch (sort) {
                case "employeeId" -> Comparator.comparing(User::getEmployeeId, String.CASE_INSENSITIVE_ORDER);
                case "firstName" -> Comparator.comparing(User::getFirstName, String.CASE_INSENSITIVE_ORDER);
                case "lastName" -> Comparator.comparing(User::getLastName, String.CASE_INSENSITIVE_ORDER);
                case "email" -> Comparator.comparing(User::getEmail, String.CASE_INSENSITIVE_ORDER);
                case "role" -> Comparator.comparing(User::getRole, String.CASE_INSENSITIVE_ORDER);
                default -> null;
            };
            if (comparator != null) {
                if ("desc".equalsIgnoreCase(dir)) {
                    comparator = comparator.reversed();
                }
                allUsers.sort(comparator);
            }
        }

        model.addAttribute("users", allUsers);
        model.addAttribute("startIndex", 1);
        model.addAttribute("sort", sort);
        model.addAttribute("dir", dir);
        return "home";
    }

    @PostMapping("/updateRole")
    @ResponseBody
    public String updateRole(@RequestBody RoleUpdateRequest req) {
        for (DataSourceConfig config : SettingsController.dataSourceMap.values()) {
            try (Connection conn = DriverManager.getConnection(
                    config.getUrl(), config.getUsername(), config.getPassword());
                 PreparedStatement stmt = conn.prepareStatement(
                    "UPDATE Employees SET role = ? WHERE employeeId = ?")) {
                stmt.setString(1, req.getRole());
                stmt.setString(2, req.getEmployeeId());
                int updated = stmt.executeUpdate();
                log.info("Tried to update employeeId {} in DB {}: {} row(s) affected: {}", req.getEmployeeId(), config.getUrl(), updated);
            } catch (Exception e) {
                log.error("Error updating role for employeeId {} in DB {}: {}", req.getEmployeeId(), config.getUrl(), e.getMessage());
            }
        }
        return "Failed";
    }
    
    public static class RoleUpdateRequest {
        private String employeeId;
        private String role;
        public String getEmployeeId() { return employeeId; }
        public void setEmployeeId(String id) { this.employeeId = id; }
        public String getRole() { return role; }
        public void setRole(String r) { this.role = r; }
    }
}
