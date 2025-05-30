package com.example.prototype;

import lombok.Data;

@Data
public class DataSourceConfig {
    private String url;
    private String username;
    private String password;
    private String driverClassName;
}
