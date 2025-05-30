package com.example.prototype;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
public class DataSourceSettingsForm {
    private List<DataSourceForm> dataSources = new ArrayList<>();
}