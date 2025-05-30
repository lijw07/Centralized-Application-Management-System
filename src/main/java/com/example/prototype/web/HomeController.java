package com.example.prototype.web;

import com.example.prototype.UserService;
import com.example.prototype.User;
import com.example.prototype.DataSourceConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Collections;
import java.util.List;

@Controller
public class HomeController {

    @Autowired
    private UserService userService;

    @GetMapping("/")
    public String home(
            Model model,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        List<User> users = Collections.emptyList();
        DataSourceConfig config = SettingsController.lastConfig;
        if (config != null && config.getUrl() != null && !config.getUrl().isBlank()) {
            try {
                users = userService.getUsers(config);
            } catch (Exception e) {
                model.addAttribute("error", "Could not fetch users: " + e.getMessage());
            }
        }
        int totalUsers = users.size();
        int totalPages = (int) Math.ceil((double) totalUsers / size);
        if (totalPages == 0) totalPages = 1;
        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;
        int fromIndex = Math.max(0, (page - 1) * size);
        int toIndex = Math.min(fromIndex + size, totalUsers);
        List<User> pageUsers = users.subList(fromIndex, toIndex);

        model.addAttribute("users", pageUsers);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", totalPages);
        model.addAttribute("pageSize", size);
        model.addAttribute("startIndex", fromIndex + 1);
        return "home";
    }
}
