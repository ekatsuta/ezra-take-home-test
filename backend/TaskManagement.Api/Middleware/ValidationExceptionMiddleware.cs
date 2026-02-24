using System.Text.Json;

namespace TaskManagement.Api.Middleware;

public class ValidationExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ValidationExceptionMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    public ValidationExceptionMiddleware(
        RequestDelegate next,
        ILogger<ValidationExceptionMiddleware> logger,
        IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, safeMessage) = exception switch
        {
            KeyNotFoundException => (StatusCodes.Status404NotFound, "Resource not found"),
            ArgumentException => (StatusCodes.Status400BadRequest, "Invalid request"),
            UnauthorizedAccessException => (StatusCodes.Status403Forbidden, "Access denied"),
            _ => (StatusCodes.Status500InternalServerError, "An error occurred processing your request")
        };

        context.Response.StatusCode = statusCode;
        if (statusCode >= StatusCodes.Status500InternalServerError)
            _logger.LogError(exception, "Request failed with status code {StatusCode}", statusCode);
        else
            _logger.LogWarning(exception, "Request failed with status code {StatusCode}", statusCode);

        object response = _environment.IsDevelopment()
            ? new
            {
                detail = safeMessage,
                exceptionType = exception.GetType().Name,
                exceptionMessage = exception.Message
            }
            : new { detail = safeMessage };

        return context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}
