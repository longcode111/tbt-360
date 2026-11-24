using Microsoft.EntityFrameworkCore;
using Tbt360.Api.Models;

namespace Tbt360.Api.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(ApplicationDbContext database)
    {
        if (!await database.SiteSettings.AnyAsync())
        {
            database.SiteSettings.Add(new SiteSettings());
        }

        if (!await database.Banners.AnyAsync())
        {
            database.Banners.AddRange(
                new Banner
                {
                    Title = "TBT Việt Nam - BIM CDE 360",
                    ImageUrl = "/banners/bim-cde-360.png",
                    TargetUrl = "#products",
                    DisplayOrder = 0,
                },
                new Banner
                {
                    Title = "Phần mềm nghiệm thu xây dựng 360",
                    ImageUrl = "/banners/nghiem-thu-do.png",
                    TargetUrl = "#products",
                    DisplayOrder = 1,
                },
                new Banner
                {
                    Title = "Nghiệm thu xây dựng 360",
                    ImageUrl = "/banners/nghiem-thu-xanh.png",
                    TargetUrl = "#products",
                    DisplayOrder = 2,
                }
            );
        }

        if (!await database.Products.AnyAsync())
        {
            database.Products.AddRange(
                new Product
                {
                    Name = "BIM – CDE 360",
                    Description = "Môi trường dữ liệu chung, phối hợp mô hình và quản lý thông tin dự án.",
                    Price = 0,
                    ImageUrl = "/banners/bim-cde-360.png",
                },
                new Product
                {
                    Name = "Phần mềm Nghiệm thu 360",
                    Description = "Hỗ trợ quản lý hồ sơ chất lượng, nhật ký thi công và quy trình nghiệm thu.",
                    Price = 0,
                    ImageUrl = "/banners/nghiem-thu-do.png",
                },
                new Product
                {
                    Name = "Quản lý dự án 360",
                    Description = "Theo dõi dự án, tiến độ, hồ sơ và thông tin quản lý trong cùng hệ thống.",
                    Price = 0,
                    ImageUrl = "/banners/bim-cde-360.png",
                }
            );
        }

        if (!await database.Articles.AnyAsync())
        {
            database.Articles.AddRange(
                new Article
                {
                    Title = "Hướng dẫn bắt đầu với TBT 360",
                    Summary = "Các bước tiếp cận hệ thống, đăng nhập và xem danh mục.",
                    Body = "1. Mở trang chủ.\n2. Đăng nhập tài khoản.\n3. Xem sản phẩm và tài liệu hướng dẫn.\n4. Liên hệ hỗ trợ khi cần.",
                },
                new Article
                {
                    Title = "Giới thiệu BIM và CDE",
                    Summary = "Khái niệm cơ bản về mô hình thông tin công trình và dữ liệu chung.",
                    Body = "BIM hỗ trợ tổ chức dữ liệu và mô hình công trình. CDE là môi trường dữ liệu chung giúp các bên quản lý, chia sẻ và phối hợp thông tin.",
                }
            );
        }

        await database.SaveChangesAsync();
    }
}
