using Microsoft.Data.SqlClient;
using Prototype.Database.Interface;
using Prototype.DTOs;
using Prototype.Enum;
using Prototype.Models;
using Prototype.Services;

namespace Prototype.Database.MicrosoftSQLServer;

public class SqlServerDatabaseStrategy(
    PasswordEncryptionService encryptionService,
    ILogger<SqlServerDatabaseStrategy> logger)
    : IDatabaseConnectionStrategy
{
    public DataSourceTypeEnum DatabaseType => DataSourceTypeEnum.MicrosoftSqlServer;

    public Dictionary<AuthenticationTypeEnum, bool> GetSupportedAuthTypes()
    {
        return new Dictionary<AuthenticationTypeEnum, bool>
        {
            { AuthenticationTypeEnum.UserPassword, true },
            { AuthenticationTypeEnum.AzureAdPassword, true },
            { AuthenticationTypeEnum.AzureAdIntegrated, true },
            { AuthenticationTypeEnum.WindowsIntegrated, true },
            { AuthenticationTypeEnum.NoAuth, false }
        };
    }

    public string BuildConnectionString(ConnectionSourceDto source)
    {
        var builder = CreateBaseConnectionBuilder(source.Host, source.Port, source.DatabaseName);
        ConfigureAuthentication(builder, source.AuthenticationType, source.Username, source.Password, false);
        return builder.ConnectionString;
    }

    public string BuildConnectionString(ApplicationConnectionModel source)
    {
        var builder = CreateBaseConnectionBuilder(source.Host, source.Port, source.DatabaseName);
        ConfigureAuthentication(builder, source.AuthenticationType, source.Username, source.Password, true);
        return builder.ConnectionString;
    }

    private SqlConnectionStringBuilder CreateBaseConnectionBuilder(string host, string port, string? databaseName)
    {
        return new SqlConnectionStringBuilder
        {
            DataSource = IsLocalDbInstance(host) ? host : $"{host},{port}",
            InitialCatalog = databaseName ?? "master",
            TrustServerCertificate = true,
            ConnectTimeout = 30,
            CommandTimeout = 30
        };
    }

    private void ConfigureAuthentication(SqlConnectionStringBuilder builder, AuthenticationTypeEnum authType, 
        string? username, string? password, bool isEncrypted)
    {
        switch (authType)
        {
            case AuthenticationTypeEnum.UserPassword:
                if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
                    throw new ArgumentException("Username and password are required for UserPassword authentication.");
                builder.UserID = username;
                builder.Password = isEncrypted ? encryptionService.Decrypt(password) : password;
                break;

            case AuthenticationTypeEnum.WindowsIntegrated:
                builder.IntegratedSecurity = true;
                break;

            case AuthenticationTypeEnum.AzureAdPassword:
                if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
                    throw new ArgumentException("Username and password are required for Azure AD Password authentication.");
                builder.UserID = username;
                builder.Password = isEncrypted ? encryptionService.Decrypt(password) : password;
                builder.Authentication = SqlAuthenticationMethod.ActiveDirectoryPassword;
                break;

            case AuthenticationTypeEnum.AzureAdIntegrated:
                builder.Authentication = SqlAuthenticationMethod.ActiveDirectoryIntegrated;
                break;

            default:
                throw new NotSupportedException($"Authentication type '{authType}' is not supported for SQL Server.");
        }
    }

    private bool IsLocalDbInstance(string host)
    {
        if (string.IsNullOrEmpty(host))
            return false;
            
        // LocalDB instance patterns
        return host.StartsWith("(localdb)\\", StringComparison.OrdinalIgnoreCase) ||
               host.StartsWith("(LocalDB)\\", StringComparison.OrdinalIgnoreCase) ||
               host.Equals("(localdb)", StringComparison.OrdinalIgnoreCase) ||
               host.Equals("(LocalDB)", StringComparison.OrdinalIgnoreCase);
    }

    public async Task<bool> TestConnectionAsync(string connectionString)
    {
        logger.LogInformation("SQL Server: Testing connection with connection string: {ConnectionString}", 
            connectionString.Substring(0, Math.Min(100, connectionString.Length)) + "...");
        
        try
        {
            using var connection = new SqlConnection(connectionString);
            logger.LogInformation("SQL Server: Opening connection...");
            await connection.OpenAsync();
            
            logger.LogInformation("SQL Server: Connection opened successfully, executing test query...");
            using var command = new SqlCommand("SELECT 1", connection);
            var result = await command.ExecuteScalarAsync();
            
            var success = result != null && result.ToString() == "1";
            logger.LogInformation("SQL Server: Test query result: {Result}, success: {Success}", result, success);
            return success;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "SQL Server connection test failed: {Error}", ex.Message);
            return false;
        }
    }
}
