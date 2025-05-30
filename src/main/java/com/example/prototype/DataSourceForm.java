package com.example.prototype;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class DataSourceForm {
    private List<DataSourceConfig> dataSources = new ArrayList<>();
}
