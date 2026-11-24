using System.ComponentModel.DataAnnotations;

namespace Tbt360.Api.Dtos;

public sealed record ProductRequest(
    [property: Required, StringLength(180)] string Name,
    [property: StringLength(3000)] string Description,
    [property: Range(typeof(decimal), "0", "1000000000000")] decimal Price,
    [property: StringLength(500)] string ImageUrl,
    bool IsPublished
);

public sealed record ArticleRequest(
    [property: Required, StringLength(220)] string Title,
    [property: StringLength(1200)] string Summary,
    [property: StringLength(30000)] string Body,
    bool IsPublished
);

public sealed record BannerRequest(
    [property: Required, StringLength(180)] string Title,
    [property: Required, StringLength(500)] string ImageUrl,
    [property: StringLength(500)] string TargetUrl,
    [property: Range(0, 100000)] int DisplayOrder,
    bool IsPublished
);

public sealed record OrderRequest(
    Guid ProductId,
    [property: Required, StringLength(120)] string CustomerName,
    [property: Required, EmailAddress, StringLength(180)] string Email,
    [property: Required, StringLength(30)] string Phone,
    [property: StringLength(1000)] string Note
);

public sealed record ContactRequest(
    [property: Required, StringLength(120)] string FullName,
    [property: Required, EmailAddress, StringLength(180)] string Email,
    [property: Required, StringLength(3000)] string Message
);

public sealed record OrderStatusRequest(
    [property: Required] string Status
);

public sealed record SettingsRequest(
    [property: Required, StringLength(120)] string SiteName,
    [property: StringLength(240)] string Slogan,
    [property: EmailAddress, StringLength(180)] string SupportEmail,
    [property: StringLength(50)] string SupportPhone,
    [property: Required, RegularExpression("^#[0-9A-Fa-f]{6}$")] string ThemeColor
);
