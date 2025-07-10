namespace Prototype.Configuration;

public class ValidationOptions
{
    public const string SectionName = "Validation";
    
    public int UsernameMinLength { get; set; } = 3;
    public int UsernameMaxLength { get; set; } = 100;
    public int FirstNameMaxLength { get; set; } = 50;
    public int LastNameMaxLength { get; set; } = 50;
    public int ApplicationNameMaxLength { get; set; } = 100;
    public int ApplicationDescriptionMaxLength { get; set; } = 500;
    public int HostMaxLength { get; set; } = 255;
    public int PasswordMinLength { get; set; } = 8;
    public int PortMinValue { get; set; } = 1;
    public int PortMaxValue { get; set; } = 65535;
    
    public string EmailRegex { get; set; } = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";
    public string PhoneRegex { get; set; } = @"^\+?[\d\s\-\(\)]{10,}$";
    public string PasswordRegex { get; set; } = @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$";
    public string UsernameRegex { get; set; } = @"^[a-zA-Z0-9_.-]+$";
}
