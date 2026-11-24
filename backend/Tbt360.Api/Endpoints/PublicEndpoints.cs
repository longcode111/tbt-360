using Microsoft.EntityFrameworkCore;
using Tbt360.Api.Data;
using Tbt360.Api.Dtos;
using Tbt360.Api.Models;
using Tbt360.Api.Security;

namespace Tbt360.Api.Endpoints;

public static class PublicEndpoints
{
    public static IEndpointRouteBuilder MapPublicEndpoints(this IEndpointRouteBuilder routes)
    {
        routes.MapGet("/api/health", () => Results.Ok(new { status = "healthy" }));

        routes.MapGet("/api/products", async (ApplicationDbContext database) =>
        {
            var products = await database.Products.AsNoTracking()
                .Where(product => product.IsPublished)
                .OrderBy(product => product.Name)
                .ToListAsync();

            return Results.Ok(products);
        });

        routes.MapGet("/api/articles", async (ApplicationDbContext database) =>
        {
            var articles = await database.Articles.AsNoTracking()
                .Where(article => article.IsPublished)
                .OrderByDescending(article => article.CreatedAt)
                .ToListAsync();

            return Results.Ok(articles);
        });

        routes.MapGet("/api/banners", async (ApplicationDbContext database) =>
        {
            var banners = await database.Banners.AsNoTracking()
                .Where(banner => banner.IsPublished)
                .OrderBy(banner => banner.DisplayOrder)
                .ToListAsync();

            return Results.Ok(banners);
        });

        routes.MapGet("/api/settings", async (ApplicationDbContext database) =>
        {
            return Results.Ok(await database.SiteSettings.AsNoTracking().FirstAsync());
        });

        routes.MapGet("/api/me", (HttpContext context) =>
        {
            var user = context.User;

            return Results.Ok(new
            {
                subject = SecurityHelpers.Subject(user),
                name = user.FindFirst("name")?.Value ??
                    user.FindFirst("preferred_username")?.Value ?? "Người dùng",
                isAdmin = SecurityHelpers.IsAdministrator(user),
            });
        }).RequireAuthorization();

        routes.MapPost("/api/orders", async (
            OrderRequest request,
            HttpContext context,
            ApplicationDbContext database) =>
        {
            var validationResult = SecurityHelpers.ValidateRequest(request);

            if (validationResult is not null)
            {
                return validationResult;
            }

            var product = await database.Products.FirstOrDefaultAsync(item =>
                item.Id == request.ProductId && item.IsPublished);

            if (product is null)
            {
                return Results.BadRequest(new { error = "Sản phẩm không tồn tại." });
            }

            var order = new Order
            {
                ProductId = product.Id,
                ProductName = product.Name,
                OwnerSubject = SecurityHelpers.Subject(context.User),
                CustomerName = request.CustomerName.Trim(),
                Email = request.Email.Trim(),
                Phone = request.Phone.Trim(),
                Note = (request.Note ?? string.Empty).Trim(),
            };

            database.Orders.Add(order);
            await database.SaveChangesAsync();

            return Results.Created($"/api/orders/{order.Id}", new
            {
                order.Id,
                order.Status,
            });
        })
        .RequireAuthorization()
        .RequireRateLimiting("userWrites");

        routes.MapPost("/api/contacts", async (
            ContactRequest request,
            HttpContext context,
            ApplicationDbContext database) =>
        {
            var validationResult = SecurityHelpers.ValidateRequest(request);

            if (validationResult is not null)
            {
                return validationResult;
            }

            var contact = new Contact
            {
                OwnerSubject = SecurityHelpers.Subject(context.User),
                FullName = request.FullName.Trim(),
                Email = request.Email.Trim(),
                Message = request.Message.Trim(),
            };

            database.Contacts.Add(contact);
            await database.SaveChangesAsync();

            return Results.Created($"/api/contacts/{contact.Id}", new { contact.Id });
        })
        .RequireAuthorization()
        .RequireRateLimiting("userWrites");

        return routes;
    }
}
