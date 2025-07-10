namespace Prototype.Configuration;

public class UserRecoveryOptions
{
    public const string SectionName = "UserRecovery";
    
    public int TokenExpirationMinutes { get; set; } = 30;
}
