using TechShop.Backend.Models;

namespace TechShop.Backend.Data;

public static class DbSeeder
{
    public static void Seed(AppDbContext context)
    {
        try
        {
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

            if (!context.Users.Any())
            {
                context.Users.AddRange(
                    new User
                    {
                        Email = "admin@techshop.vn",
                        FullName = "TechShop Admin",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                        RoleId = 1
                    },
                    new User
                    {
                        Email = "test@techshop.vn",
                        FullName = "Khach hang TechShop",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test@123"),
                        RoleId = 3
                    });
                context.SaveChanges();
            }

            if (!context.Products.Any())
            {
                var laptopId = context.Categories.Where(x => x.Slug == "laptop").Select(x => x.CategoryId).First();
                var phoneId = context.Categories.Where(x => x.Slug == "phone").Select(x => x.CategoryId).First();
                var accessoryId = context.Categories.Where(x => x.Slug == "accessory").Select(x => x.CategoryId).First();

                AddProduct(context, laptopId, "Laptop ASUS ROG Strix G16", "laptop-asus-rog-strix-g16", "Asus", 35000000, 32000000, true, "https://dlcdnwebimgs.asus.com/gain/3D7A4D4A-DE9E-49A3-A2A9-497127E780BE/w717/h525");
                AddProduct(context, laptopId, "MacBook Air M3 13 inch", "macbook-air-m3-13", "Apple", 28990000, 27490000, true, "https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/mba13-midnight-select-202402?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1708367688034");
                AddProduct(context, phoneId, "iPhone 15 Pro Max", "iphone-15-pro-max", "Apple", 34990000, 32990000, true, "https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-blue-thumbnew-600x600.jpg");
                AddProduct(context, phoneId, "Samsung Galaxy S24 Ultra", "samsung-galaxy-s24-ultra", "Samsung", 33990000, 29990000, false, "https://cdn.tgdd.vn/Products/Images/42/307174/samsung-galaxy-s24-ultra-grey-thumb-600x600.jpg");
                AddProduct(context, accessoryId, "Tai nghe Sony WH-1000XM5", "sony-wh-1000xm5", "Sony", 8990000, 7990000, false, "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&h=600&fit=crop");
                context.SaveChanges();
            }

            if (context.Products.Count() == 5)
            {
                var laptopId = context.Categories.Where(x => x.Slug == "laptop").Select(x => x.CategoryId).First();
                var phoneId = context.Categories.Where(x => x.Slug == "phone").Select(x => x.CategoryId).First();
                var accessoryId = context.Categories.Where(x => x.Slug == "accessory").Select(x => x.CategoryId).First();

                AddProduct(context, laptopId, "Laptop Dell XPS 15", "dell-xps-15", "Dell", 45000000, 42000000, true, "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&h=600&fit=crop");
                AddProduct(context, laptopId, "MacBook Pro 14 M3", "macbook-pro-14-m3", "Apple", 49000000, 47000000, true, "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop");
                AddProduct(context, phoneId, "iPhone 13 128GB", "iphone-13-128gb", "Apple", 18990000, 16990000, false, "https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=600&h=600&fit=crop");
                AddProduct(context, phoneId, "Samsung Galaxy Z Fold5", "samsung-galaxy-z-fold5", "Samsung", 40990000, 38990000, true, "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&h=600&fit=crop");
                AddProduct(context, phoneId, "iPad Pro 11 inch", "ipad-pro-11", "Apple", 22990000, 21990000, false, "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop");
                AddProduct(context, accessoryId, "Bàn phím cơ Logitech G Pro", "logitech-g-pro-keyboard", "Logitech", 2590000, 2290000, true, "https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&h=600&fit=crop");
                AddProduct(context, accessoryId, "Chuột không dây Logitech MX Master 3", "logitech-mx-master-3", "Logitech", 2490000, 2190000, true, "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=600&fit=crop");
                AddProduct(context, accessoryId, "Tai nghe Bluetooth Sony WH-CH720N", "sony-wh-ch720n", "Sony", 2990000, 2490000, false, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop");
                AddProduct(context, laptopId, "Laptop HP Envy 14", "hp-envy-14", "HP", 28000000, 26000000, false, "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&h=600&fit=crop");
                AddProduct(context, accessoryId, "Sạc dự phòng Anker 10000mAh", "anker-10000mah", "Anker", 890000, 690000, false, "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&h=600&fit=crop");
                context.SaveChanges();
            }

            if (!context.Coupons.Any())
            {
                context.Coupons.Add(new Coupon
                {
                    Code = "TECHSHOP10",
                    DiscountType = "Percent",
                    DiscountValue = 10,
                    MinOrderValue = 1000000,
                    MaxDiscount = 1000000,
                    UsageLimit = 100,
                    StartsAt = DateTime.UtcNow.AddDays(-1),
                    ExpiresAt = DateTime.UtcNow.AddMonths(1)
                });
                context.SaveChanges();
            }

            if (!context.Promotions.Any())
            {
                var products = context.Products.Take(3).Select(p => p.ProductId).ToList();
                var promotion = new Promotion
                {
                    Name = "TechShop Phase 2 Launch",
                    DiscountType = "Percent",
                    DiscountValue = 8,
                    StartsAt = DateTime.UtcNow.AddDays(-1),
                    EndsAt = DateTime.UtcNow.AddDays(14),
                    IsActive = true
                };

                foreach (var productId in products)
                {
                    promotion.Products.Add(new PromotionProduct { ProductId = productId });
                }

                context.Promotions.Add(promotion);
                context.SaveChanges();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Seed skipped: {ex.Message}");
        }
    }

    private static void AddProduct(AppDbContext context, int categoryId, string name, string slug, string brand, decimal basePrice, decimal salePrice, bool featured, string thumbnailUrl)
    {
        var product = new Product
        {
            CategoryId = categoryId,
            Name = name,
            Slug = slug,
            Brand = brand,
            Description = $"{name} chinh hang tai TechShop.",
            BasePrice = basePrice,
            SalePrice = salePrice,
            ThumbnailUrl = thumbnailUrl,
            IsFeatured = featured,
            Tags = $"{brand},phase1"
        };

        var variant = new ProductVariant
        {
            Product = product,
            SKU = $"{slug.ToUpperInvariant()}-STD",
            Color = "Default",
            RAM = categoryId == 3 ? null : "8GB",
            Storage = categoryId == 3 ? null : "256GB",
            Inventory = new Inventory { Quantity = 20 }
        };

        product.Variants.Add(variant);
        product.Images.Add(new ProductImage { ImageUrl = product.ThumbnailUrl, AltText = name, SortOrder = 0 });
        product.Specifications.Add(new Specification { SpecKey = "Brand", SpecValue = brand, SortOrder = 1 });
        product.Specifications.Add(new Specification { SpecKey = "Warranty", SpecValue = "12 months", SortOrder = 2 });

        context.Products.Add(product);
    }
}
