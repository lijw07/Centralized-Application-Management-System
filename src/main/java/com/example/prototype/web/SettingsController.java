package com.example.prototype.web;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

import com.example.prototype.DataSourceConfig;
import com.example.prototype.DataSourceForm;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
public class SettingsController {

    public static DataSourceConfig lastConfig;

    @GetMapping("/settings")
    public String showSettingsForm(Model model) {
        DataSourceForm form = new DataSourceForm();
        form.getDataSources().add(new DataSourceConfig());
        model.addAttribute("form", form);
        return "settings";
    }

    @PostMapping("/settings")
    public String submitSettingsForm(@ModelAttribute("form") DataSourceForm form, Model model) {
        for (DataSourceConfig ds : form.getDataSources()) {
            if (ds.getUrl() != null) ds.setUrl(ds.getUrl().replaceAll("^,+", "").trim());
            if (ds.getUsername() != null) ds.setUsername(ds.getUsername().replaceAll("^,+", "").trim());
            if (ds.getPassword() != null) ds.setPassword(ds.getPassword().replaceAll("^,+", "").trim());
            if (ds.getDriverClassName() != null && ds.getDriverClassName().contains(",")) {
                ds.setDriverClassName(ds.getDriverClassName().split(",")[0].trim());
            }
        }
        log.info("Received settings: {}", form);
        if (!form.getDataSources().isEmpty()) {
            lastConfig = form.getDataSources().get(0);
        }
        model.addAttribute("form", form);
        model.addAttribute("success", "Settings saved successfully!");
        return "settings";
    }
}
