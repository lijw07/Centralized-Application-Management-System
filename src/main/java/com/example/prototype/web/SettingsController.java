package com.example.prototype.web;

import java.util.HashMap;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

import com.example.prototype.DataSourceConfig;
import com.example.prototype.DataSourceForm;
import com.example.prototype.DataSourceSettingsForm;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
public class SettingsController {
    public static HashMap<String, DataSourceConfig> dataSourceMap = new HashMap<>();

    @GetMapping("/settings")
    public String showSettingsForm(Model model) {
        DataSourceSettingsForm form = new DataSourceSettingsForm();
        dataSourceMap.forEach((name, config) -> {
            DataSourceForm dsForm = new DataSourceForm();
            dsForm.setDataSourceName(name);
            dsForm.setDataSourceConfig(config);
            form.getDataSources().add(dsForm);
        });
        model.addAttribute("form", form);
        return "settings";
    }

    @PostMapping("/settings")
    public String submitSettingsForm(@ModelAttribute("form") DataSourceSettingsForm form, Model model) {
        for (DataSourceForm ds : form.getDataSources()) {
            if (ds.getDataSourceName() != null && ds.getDataSourceConfig() != null) {
                dataSourceMap.put(ds.getDataSourceName(), ds.getDataSourceConfig());
            }
        }
        log.info("Received settings: {}", dataSourceMap);
        model.addAttribute("form", form);
        model.addAttribute("success", "Settings saved successfully!");
        return "settings";
    }
}
