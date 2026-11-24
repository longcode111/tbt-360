using Microsoft.EntityFrameworkCore;
using Tbt360.Api.Models;

namespace Tbt360.Api.Data;

public sealed class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Article> Articles => Set<Article>();
    public DbSet<Banner> Banners => Set<Banner>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<Contact> Contacts => Set<Contact>();
    public DbSet<SiteSettings> SiteSettings => Set<SiteSettings>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(product => product.Id);
            entity.Property(product => product.Name).HasMaxLength(180);
            entity.Property(product => product.Description).HasMaxLength(3000);
            entity.Property(product => product.Price).HasColumnType("numeric(16,2)");
            entity.Property(product => product.ImageUrl).HasMaxLength(500);
        });

        modelBuilder.Entity<Article>(entity =>
        {
            entity.HasKey(article => article.Id);
            entity.Property(article => article.Title).HasMaxLength(220);
            entity.Property(article => article.Summary).HasMaxLength(1200);
            entity.Property(article => article.Body).HasMaxLength(30000);
        });

        modelBuilder.Entity<Banner>(entity =>
        {
            entity.HasKey(banner => banner.Id);
            entity.Property(banner => banner.Title).HasMaxLength(180);
            entity.Property(banner => banner.ImageUrl).HasMaxLength(500);
            entity.Property(banner => banner.TargetUrl).HasMaxLength(500);
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(order => order.Id);
            entity.Property(order => order.ProductName).HasMaxLength(180);
            entity.Property(order => order.OwnerSubject).HasMaxLength(180);
            entity.Property(order => order.CustomerName).HasMaxLength(120);
            entity.Property(order => order.Email).HasMaxLength(180);
            entity.Property(order => order.Phone).HasMaxLength(30);
            entity.Property(order => order.Note).HasMaxLength(1000);
            entity.Property(order => order.Status).HasMaxLength(30);
            entity.HasIndex(order => order.OwnerSubject);
        });

        modelBuilder.Entity<Contact>(entity =>
        {
            entity.HasKey(contact => contact.Id);
            entity.Property(contact => contact.OwnerSubject).HasMaxLength(180);
            entity.Property(contact => contact.FullName).HasMaxLength(120);
            entity.Property(contact => contact.Email).HasMaxLength(180);
            entity.Property(contact => contact.Message).HasMaxLength(3000);
            entity.HasIndex(contact => contact.OwnerSubject);
        });

        modelBuilder.Entity<SiteSettings>(entity =>
        {
            entity.HasKey(settings => settings.Id);
            entity.Property(settings => settings.SiteName).HasMaxLength(120);
            entity.Property(settings => settings.Slogan).HasMaxLength(240);
            entity.Property(settings => settings.SupportEmail).HasMaxLength(180);
            entity.Property(settings => settings.SupportPhone).HasMaxLength(50);
            entity.Property(settings => settings.ThemeColor).HasMaxLength(7);
        });
    }
}
