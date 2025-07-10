namespace Prototype.Configuration;

public class DatabaseOptions
{
    public const string SectionName = "Database";
    
    public string Host { get; set; } = string.Empty;
    public string Port { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string User { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public int ConnectionTimeout { get; set; } = 300;
    public int CommandTimeout { get; set; } = 300;
    public int MaxPoolSize { get; set; } = 200;
    public int MinPoolSize { get; set; } = 10;
    public int MaxRetryCount { get; set; } = 3;
    public int MaxRetryDelaySeconds { get; set; } = 30;
    public int InitializationMaxRetries { get; set; } = 10;
    public int InitializationRetryDelaySeconds { get; set; } = 5;
}
