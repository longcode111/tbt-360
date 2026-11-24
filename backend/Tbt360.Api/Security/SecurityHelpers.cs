using System.Security.Claims;
using System.Text.Json;
using System.ComponentModel.DataAnnotations;

namespace Tbt360.Api.Security;

public static class SecurityHelpers
{
    public static bool IsAdministrator(ClaimsPrincipal user)
    {
        if (user.IsInRole("admin") ||
            user.Claims.Any(claim => claim.Type == "role" && claim.Value == "admin"))
        {
            return true;
        }

        var realmRoles = user.FindFirst("realm_access")?.Value;

        if (string.IsNullOrWhiteSpace(realmRoles))
        {
            return false;
        }

        try
        {
            using var document = JsonDocument.Parse(realmRoles);
            var rolesElement = document.RootElement.GetProperty("roles");
            return rolesElement.EnumerateArray().Any(role =>
                string.Equals(role.GetString(), "admin", StringComparison.Ordinal));
        }
        catch (JsonException)
        {
            return false;
        }
        catch (KeyNotFoundException)
        {
            return false;
        }
    }

    public static string Subject(ClaimsPrincipal user)
    {
        return user.FindFirstValue("sub") ?? string.Empty;
    }

    public static bool IsSafeLink(string? value, bool allowHashLinks = false)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return true;
        }

        if (value.StartsWith("/") &&
            !value.StartsWith("//") &&
            !value.Contains('\\') &&
            !value.Contains('\r') &&
            !value.Contains('\n'))
        {
            return true;
        }

        if (allowHashLinks && value.StartsWith("#") && value.Length <= 80)
        {
            return true;
        }

        return Uri.TryCreate(value, UriKind.Absolute, out var result) &&
            result.Scheme == Uri.UriSchemeHttps;
    }

    public static IResult? ValidateRequest<TRequest>(TRequest request)
    {
        var context = new ValidationContext(request!);
        var results = new List<ValidationResult>();

        if (Validator.TryValidateObject(request!, context, results, true))
        {
            return null;
        }

        var errors = results
            .SelectMany(result => result.MemberNames.DefaultIfEmpty("request"),
                (result, memberName) => new { result.ErrorMessage, memberName })
            .GroupBy(item => item.memberName)
            .ToDictionary(
                group => group.Key,
                group => group.Select(item => item.ErrorMessage ?? "Không hợp lệ.").ToArray()
            );

        return Results.ValidationProblem(errors);
    }
}
