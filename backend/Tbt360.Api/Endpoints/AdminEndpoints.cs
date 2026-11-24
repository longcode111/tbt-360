using Microsoft.EntityFrameworkCore;
using Tbt360.Api.Data;
using Tbt360.Api.Dtos;
using Tbt360.Api.Models;
using Tbt360.Api.Security;

namespace Tbt360.Api.Endpoints;

public static class AdminEndpoints
{
    public static IEndpointRouteBuilder MapAdminEndpoints(this IEndpointRouteBuilder routes)
    {
        var admin = routes.MapGroup("/api/admin")
            .RequireAuthorization("AdminOnly")
            .RequireRateLimiting("adminWrites");

        admin.MapGet("/dashboard", async (ApplicationDbContext database) =>
        {
            return Results.Ok(new
            {
                products = await database.Products.CountAsync(),
                articles = await database.Articles.CountAsync(),
                banners = await database.Banners.CountAsync(),
                orders = await database.Orders.CountAsync(),
                contacts = await database.Contacts.CountAsync(),
            });
        });

        admin.MapGet("/products", async (ApplicationDbContext database) =>
        {
            return Results.Ok(await database.Products.AsNoTracking()
                .OrderBy(product => product.Name).ToListAsync());
        });

        admin.MapPost("/products", async (
            ProductRequest request, ApplicationDbContext database) =>
        {
            var validation = SecurityHelpers.ValidateRequest(request);

            if (validation is not null)
            {
                return validation;
            }

            if (!SecurityHelpers.IsSafeLink(request.ImageUrl))
            {
                return Results.BadRequest(new { error = "Đường dẫn ảnh không hợp lệ." });
            }

            var product = new Product();
            ApplyProduct(product, request);
            database.Products.Add(product);
            await database.SaveChangesAsync();
            return Results.Created($"/api/admin/products/{product.Id}", product);
        });

        admin.MapPut("/products/{id:guid}", async (
            Guid id, ProductRequest request, ApplicationDbContext database) =>
        {
            var validation = SecurityHelpers.ValidateRequest(request);

            if (validation is not null)
            {
                return validation;
            }

            if (!SecurityHelpers.IsSafeLink(request.ImageUrl))
            {
                return Results.BadRequest(new { error = "Đường dẫn ảnh không hợp lệ." });
            }

            var product = await database.Products.FindAsync(id);

            if (product is null)
            {
                return Results.NotFound();
            }

            ApplyProduct(product, request);
            await database.SaveChangesAsync();
            return Results.Ok(product);
        });

        admin.MapDelete("/products/{id:guid}", async (
            Guid id, ApplicationDbContext database) =>
        {
            var product = await database.Products.FindAsync(id);

            if (product is null)
            {
                return Results.NotFound();
            }

            // Giữ lịch sử đơn hàng: đơn đã lưu tên và ID sản phẩm riêng.
            database.Products.Remove(product);
            await database.SaveChangesAsync();
            return Results.NoContent();
        });

        admin.MapGet("/articles", async (ApplicationDbContext database) =>
        {
            return Results.Ok(await database.Articles.AsNoTracking()
                .OrderByDescending(article => article.CreatedAt).ToListAsync());
        });

        admin.MapPost("/articles", async (
            ArticleRequest request, ApplicationDbContext database) =>
        {
            var validation = SecurityHelpers.ValidateRequest(request);

            if (validation is not null)
            {
                return validation;
            }

            var article = new Article();
            ApplyArticle(article, request);
            database.Articles.Add(article);
            await database.SaveChangesAsync();
            return Results.Created($"/api/admin/articles/{article.Id}", article);
        });

        admin.MapPut("/articles/{id:guid}", async (
            Guid id, ArticleRequest request, ApplicationDbContext database) =>
        {
            var validation = SecurityHelpers.ValidateRequest(request);

            if (validation is not null)
            {
                return validation;
            }

            var article = await database.Articles.FindAsync(id);

            if (article is null)
            {
                return Results.NotFound();
            }

            ApplyArticle(article, request);
            await database.SaveChangesAsync();
            return Results.Ok(article);
        });

        admin.MapDelete("/articles/{id:guid}", async (
            Guid id, ApplicationDbContext database) =>
        {
            var article = await database.Articles.FindAsync(id);

            if (article is null)
            {
                return Results.NotFound();
            }

            database.Articles.Remove(article);
            await database.SaveChangesAsync();
            return Results.NoContent();
        });

        admin.MapGet("/banners", async (ApplicationDbContext database) =>
        {
            return Results.Ok(await database.Banners.AsNoTracking()
                .OrderBy(banner => banner.DisplayOrder).ToListAsync());
        });

        admin.MapPost("/banners", async (
            BannerRequest request, ApplicationDbContext database) =>
        {
            var validation = ValidateBanner(request);

            if (validation is not null)
            {
                return validation;
            }

            var banner = new Banner();
            ApplyBanner(banner, request);
            database.Banners.Add(banner);
            await database.SaveChangesAsync();
            return Results.Created($"/api/admin/banners/{banner.Id}", banner);
        });

        admin.MapPut("/banners/{id:guid}", async (
            Guid id, BannerRequest request, ApplicationDbContext database) =>
        {
            var validation = ValidateBanner(request);

            if (validation is not null)
            {
                return validation;
            }

            var banner = await database.Banners.FindAsync(id);

            if (banner is null)
            {
                return Results.NotFound();
            }

            ApplyBanner(banner, request);
            await database.SaveChangesAsync();
            return Results.Ok(banner);
        });

        admin.MapDelete("/banners/{id:guid}", async (
            Guid id, ApplicationDbContext database) =>
        {
            var banner = await database.Banners.FindAsync(id);

            if (banner is null)
            {
                return Results.NotFound();
            }

            database.Banners.Remove(banner);
            await database.SaveChangesAsync();
            return Results.NoContent();
        });

        admin.MapGet("/orders", async (ApplicationDbContext database) =>
        {
            return Results.Ok(await database.Orders.AsNoTracking()
                .OrderByDescending(order => order.CreatedAt).ToListAsync());
        });

        admin.MapPatch("/orders/{id:guid}/status", async (
            Guid id, OrderStatusRequest request, ApplicationDbContext database) =>
        {
            var validStatuses = new HashSet<string>
            {
                "new", "processing", "completed", "cancelled",
            };

            if (!validStatuses.Contains(request.Status))
            {
                return Results.BadRequest(new { error = "Trạng thái không hợp lệ." });
            }

            var order = await database.Orders.FindAsync(id);

            if (order is null)
            {
                return Results.NotFound();
            }

            order.Status = request.Status;
            await database.SaveChangesAsync();
            return Results.Ok(order);
        });

        admin.MapGet("/contacts", async (ApplicationDbContext database) =>
        {
            return Results.Ok(await database.Contacts.AsNoTracking()
                .OrderByDescending(contact => contact.CreatedAt).ToListAsync());
        });

        admin.MapGet("/settings", async (ApplicationDbContext database) =>
        {
            return Results.Ok(await database.SiteSettings.FirstAsync());
        });

        admin.MapPut("/settings", async (
            SettingsRequest request, ApplicationDbContext database) =>
        {
            var validation = SecurityHelpers.ValidateRequest(request);

            if (validation is not null)
            {
                return validation;
            }

            var settings = await database.SiteSettings.FirstAsync();
            settings.SiteName = request.SiteName.Trim();
            settings.Slogan = (request.Slogan ?? string.Empty).Trim();
            settings.SupportEmail = (request.SupportEmail ?? string.Empty).Trim();
            settings.SupportPhone = (request.SupportPhone ?? string.Empty).Trim();
            settings.ThemeColor = request.ThemeColor;
            await database.SaveChangesAsync();
            return Results.Ok(settings);
        });

        return routes;
    }

    private static void ApplyProduct(Product product, ProductRequest request)
    {
        product.Name = request.Name.Trim();
        product.Description = (request.Description ?? string.Empty).Trim();
        product.Price = request.Price;
        product.ImageUrl = (request.ImageUrl ?? string.Empty).Trim();
        product.IsPublished = request.IsPublished;
    }

    private static void ApplyArticle(Article article, ArticleRequest request)
    {
        article.Title = request.Title.Trim();
        article.Summary = (request.Summary ?? string.Empty).Trim();
        article.Body = (request.Body ?? string.Empty).Trim();
        article.IsPublished = request.IsPublished;
    }

    private static void ApplyBanner(Banner banner, BannerRequest request)
    {
        banner.Title = request.Title.Trim();
        banner.ImageUrl = (request.ImageUrl ?? string.Empty).Trim();
        banner.TargetUrl = (request.TargetUrl ?? string.Empty).Trim();
        banner.DisplayOrder = request.DisplayOrder;
        banner.IsPublished = request.IsPublished;
    }

    private static IResult? ValidateBanner(BannerRequest request)
    {
        var validation = SecurityHelpers.ValidateRequest(request);

        if (validation is not null)
        {
            return validation;
        }

        if (!SecurityHelpers.IsSafeLink(request.ImageUrl) ||
            !SecurityHelpers.IsSafeLink(request.TargetUrl, allowHashLinks: true))
        {
            return Results.BadRequest(new { error = "URL phải là HTTPS hoặc đường dẫn nội bộ." });
        }

        return null;
    }
}
