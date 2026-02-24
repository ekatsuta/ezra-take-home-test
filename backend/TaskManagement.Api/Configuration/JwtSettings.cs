namespace TaskManagement.Api.Configuration;

public class JwtSettings
{
    public string SecretKey { get; set; } = string.Empty;
    public string Issuer { get; set; } = "TaskManagementApi";
    public string Audience { get; set; } = "TaskManagementClient";
    public int ExpirationMinutes { get; set; } = 30;
}
