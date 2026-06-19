using TechShop.Backend.Models;

namespace TechShop.Backend.Data;

public static class DbSeeder
{
    public static void Seed(AppDbContext context)
    {
        try
        {
            // 1. Khởi tạo các Quyền (Roles) bắt buộc
            if (!context.Roles.Any())
            {
                context.Roles.AddRange(
                    new Role { RoleName = "Admin" },
                    new Role { RoleName = "Staff" },
                    new Role { RoleName = "Customer" });
                context.SaveChanges();
            }

            if (!context.Categories.Any())
            {
                context.Categories.AddRange(
                    new Category { Name = "Laptop", Slug = "laptop", DisplayOrder = 1 },
                    new Category { Name = "Dien thoai", Slug = "phone", DisplayOrder = 2 },
                    new Category { Name = "Phu kien", Slug = "accessory", DisplayOrder = 3 });
                context.SaveChanges();
            }

            // 2. Khởi tạo tài khoản Admin duy nhất
            if (!context.Users.Any())
            {
                context.Users.Add(
                    new User
                    {
                        Email = "admin@techshop.vn",
                        FullName = "TechShop Admin",
                        // Mật khẩu mặc định: Admin@123
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                        RoleId = 1
                    });
                context.SaveChanges();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Seed skipped: {ex.Message}");
        }
    }
}
