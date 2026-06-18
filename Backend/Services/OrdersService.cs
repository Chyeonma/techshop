using Microsoft.EntityFrameworkCore;
using TechShop.Backend.Data;
using TechShop.Backend.DTOs.Common;
using TechShop.Backend.DTOs.Order;
using TechShop.Backend.Models;

namespace TechShop.Backend.Services;

public class OrdersService : IOrdersService
{
    private readonly AppDbContext _context;
    private readonly IEmailService _emailService;

    public OrdersService(AppDbContext context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    public async Task<ApiResponse<object>> CreateOrderAsync(Guid userId, CreateOrderDto dto)
    {
        var cart = await _context.Carts
            .Include(c => c.Coupon)
            .Include(c => c.Items).ThenInclude(i => i.Variant).ThenInclude(v => v!.Product)
            .Include(c => c.Items).ThenInclude(i => i.Variant).ThenInclude(v => v!.Inventory)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        var user = await _context.Users
            .Include(u => u.Addresses)
            .FirstOrDefaultAsync(u => u.UserId == userId);

        if (cart == null || cart.Items.Count == 0)
        {
            return ApiResponse<object>.Fail("EMPTY_CART", "Gio hang dang trong.");
        }

        if (user == null)
        {
            return ApiResponse<object>.Fail("USER_NOT_FOUND", "Nguoi dung khong ton tai.");
        }

        Address? selectedAddress = null;
        if (dto.AddressId.HasValue)
        {
            selectedAddress = user.Addresses.FirstOrDefault(a => a.AddressId == dto.AddressId.Value);
            if (selectedAddress == null)
            {
                return ApiResponse<object>.Fail("INVALID_ADDRESS", "Dia chi giao hang khong hop le.");
            }
        }

        selectedAddress ??= string.IsNullOrWhiteSpace(dto.ShippingAddress)
            ? user.Addresses.OrderByDescending(a => a.IsDefault).FirstOrDefault()
            : null;

        var receiverName = FirstNonEmpty(dto.ReceiverName, selectedAddress?.ReceiverName, user.FullName);
        var phone = FirstNonEmpty(dto.Phone, selectedAddress?.Phone, user.Phone);
        var shippingAddress = selectedAddress == null
            ? FirstNonEmpty(dto.ShippingAddress)
            : FormatAddress(selectedAddress);

        if (string.IsNullOrWhiteSpace(receiverName) || string.IsNullOrWhiteSpace(phone) || string.IsNullOrWhiteSpace(shippingAddress))
        {
            return ApiResponse<object>.Fail(
                "PROFILE_INCOMPLETE",
                "Vui long cap nhat so dien thoai va dia chi trong Thong tin tai khoan truoc khi dat hang.");
        }

        var itemsToProcess = cart.Items.AsEnumerable();
        if (dto.SelectedCartItemIds is { Count: > 0 } selectedIds)
        {
            itemsToProcess = cart.Items.Where(i => selectedIds.Contains(i.CartItemId)).ToList();
            if (itemsToProcess.Count() == 0)
            {
                return ApiResponse<object>.Fail("INVALID_SELECTION", "Khong co san pham nao duoc chon de dat hang.");
            }
        }

        await using var transaction = await _context.Database.BeginTransactionAsync();

        var order = new Order
        {
            UserId = userId,
            ReceiverName = receiverName,
            Phone = phone,
            ShippingAddress = shippingAddress,
            Note = dto.Note,
            Status = "Pending",
            ShippingFee = 0
        };

        foreach (var item in itemsToProcess)
        {
            if (item.Variant?.Product == null || item.Variant.Inventory == null)
            {
                return ApiResponse<object>.Fail("INVALID_CART", "Gio hang co san pham khong hop le.");
            }

            if (item.Variant.Inventory.Quantity < item.Quantity)
            {
                return ApiResponse<object>.Fail("OUT_OF_STOCK", $"{item.Variant.Product.Name} khong du ton kho.");
            }

            var unitPrice = (item.Variant.Product.SalePrice ?? item.Variant.Product.BasePrice) + item.Variant.PriceOffset;
            order.Items.Add(new OrderItem
            {
                VariantId = item.VariantId,
                ProductName = item.Variant.Product.Name,
                VariantInfo = string.Join(" / ", new[] { item.Variant.Color, item.Variant.RAM, item.Variant.Storage }.Where(x => !string.IsNullOrWhiteSpace(x))),
                Quantity = item.Quantity,
                UnitPrice = unitPrice,
                Subtotal = unitPrice * item.Quantity
            });

            item.Variant.Inventory.Quantity -= item.Quantity;
            item.Variant.Inventory.UpdatedAt = DateTime.UtcNow;
            _context.InventoryLogs.Add(new InventoryLog
            {
                VariantId = item.VariantId,
                ChangeType = "SaleDeduct",
                Quantity = -item.Quantity,
                Note = "Create COD order",
                CreatedBy = userId
            });
        }

        order.Subtotal = order.Items.Sum(i => i.Subtotal);
        order.DiscountTotal = CalculateDiscount(cart, order.Subtotal);
        order.GrandTotal = order.Subtotal - order.DiscountTotal + order.ShippingFee;
        order.StatusLogs.Add(new OrderStatusLog { NewStatus = "Pending", Note = "Order created", ChangedBy = userId });
        order.Payment = new Payment { Method = "COD", Status = "Pending", Amount = order.GrandTotal };

        if (cart.Coupon != null)
        {
            cart.Coupon.UsedCount += 1;
        }

        if (string.IsNullOrWhiteSpace(user.Phone))
        {
            user.Phone = phone;
            user.UpdatedAt = DateTime.UtcNow;
        }

        if (!dto.AddressId.HasValue && !string.IsNullOrWhiteSpace(dto.ShippingAddress))
        {
            var alreadySaved = user.Addresses.Any(a =>
                string.Equals(FormatAddress(a), shippingAddress, StringComparison.OrdinalIgnoreCase));

            if (!alreadySaved)
            {
                var isFirstAddress = user.Addresses.Count == 0;
                _context.Addresses.Add(new Address
                {
                    UserId = userId,
                    ReceiverName = receiverName,
                    Phone = phone,
                    Province = string.Empty,
                    District = string.Empty,
                    Ward = string.Empty,
                    Street = shippingAddress,
                    IsDefault = isFirstAddress
                });
            }
        }

        _context.Orders.Add(order);

        var itemsToRemove = itemsToProcess.ToList();
        _context.CartItems.RemoveRange(itemsToRemove);

        var remainingItems = cart.Items.Except(itemsToRemove).ToList();
        if (remainingItems.Count == 0)
        {
            cart.CouponId = null;
        }
        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();
        await _emailService.SendOrderConfirmationAsync(order);

        return ApiResponse<object>.Ok(MapOrder(order), "Da tao don hang.");
    }

    public async Task<ApiResponse<object>> GetOrdersAsync(Guid userId)
    {
        var orders = await _context.Orders
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new
            {
                o.OrderId,
                o.Status,
                o.GrandTotal,
                o.CreatedAt,
                itemCount = o.Items.Sum(i => i.Quantity)
            })
            .ToListAsync();

        return ApiResponse<object>.Ok(orders);
    }

    public async Task<ApiResponse<object>> GetOrderAsync(Guid userId, Guid id)
    {
        var order = await LoadOrder(id);
        if (order == null || order.UserId != userId)
        {
            return ApiResponse<object>.Fail("NOT_FOUND", "Don hang khong ton tai.");
        }

        return ApiResponse<object>.Ok(MapOrder(order));
    }

    public async Task<ApiResponse<object>> CancelOrderAsync(Guid userId, Guid id, CancelOrderDto? dto)
    {
        var order = await LoadOrder(id);
        if (order == null || order.UserId != userId)
        {
            return ApiResponse<object>.Fail("NOT_FOUND", "Don hang khong ton tai.");
        }

        if (order.Status != "Pending")
        {
            return ApiResponse<object>.Fail("INVALID_STATUS", "Chi co the huy don hang dang cho xu ly.");
        }

        await using var transaction = await _context.Database.BeginTransactionAsync();
        var oldStatus = order.Status;
        
        var reason = FirstNonEmpty(dto?.Reason);
        var note = FirstNonEmpty(dto?.Note);
        var cancelNote = string.IsNullOrWhiteSpace(reason)
            ? "Customer cancelled"
            : string.IsNullOrWhiteSpace(note)
                ? $"Customer cancelled: {reason}"
                : $"Customer cancelled: {reason} - {note}";

        order.Status = "Cancelled";
        order.UpdatedAt = DateTime.UtcNow;
        _context.OrderStatusLogs.Add(new OrderStatusLog { OrderId = order.OrderId, OldStatus = oldStatus, NewStatus = "Cancelled", Note = cancelNote, ChangedBy = userId });

        foreach (var item in order.Items)
        {
            var inventory = await _context.Inventories.FirstOrDefaultAsync(i => i.VariantId == item.VariantId);
            if (inventory != null)
            {
                inventory.Quantity += item.Quantity;
                inventory.UpdatedAt = DateTime.UtcNow;
                _context.InventoryLogs.Add(new InventoryLog
                {
                    VariantId = item.VariantId,
                    ChangeType = "CancelReturn",
                    Quantity = item.Quantity,
                    Note = "Order cancelled",
                    CreatedBy = userId
                });
            }
        }

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();
        await _emailService.SendOrderStatusChangedAsync(order, oldStatus, "Cancelled");

        return ApiResponse<object>.Ok(MapOrder(order), "Da huy don hang.");
    }

    public async Task<ApiResponse<object>> UpdateAddressAsync(Guid userId, Guid id, UpdateOrderAddressDto dto)
    {
        var order = await LoadOrder(id);
        if (order == null || order.UserId != userId)
        {
            return ApiResponse<object>.Fail("NOT_FOUND", "Don hang khong ton tai.");
        }

        if (order.Status != "Pending")
        {
            return ApiResponse<object>.Fail("INVALID_STATUS", "Chi co the doi dia chi khi don hang dang cho xu ly.");
        }

        if (string.IsNullOrWhiteSpace(dto.ReceiverName) ||
            string.IsNullOrWhiteSpace(dto.Phone) ||
            string.IsNullOrWhiteSpace(dto.ShippingAddress))
        {
            return ApiResponse<object>.Fail("INVALID_ADDRESS", "Vui long nhap day du nguoi nhan, so dien thoai va dia chi.");
        }

        order.ReceiverName = dto.ReceiverName.Trim();
        order.Phone = dto.Phone.Trim();
        order.ShippingAddress = dto.ShippingAddress.Trim();
        order.UpdatedAt = DateTime.UtcNow;
        _context.OrderStatusLogs.Add(new OrderStatusLog
        {
            OrderId = order.OrderId,
            OldStatus = order.Status,
            NewStatus = order.Status,
            Note = "Customer updated shipping address",
            ChangedBy = userId
        });

        await _context.SaveChangesAsync();

        return ApiResponse<object>.Ok(MapOrder(order), "Da cap nhat dia chi giao hang.");
    }

    private async Task<Order?> LoadOrder(Guid id)
        => await _context.Orders
            .Include(o => o.Items)
                .ThenInclude(i => i.Variant)
                .ThenInclude(v => v!.Product)
            .Include(o => o.StatusLogs)
            .Include(o => o.Payment)
            .FirstOrDefaultAsync(o => o.OrderId == id);

    private static decimal CalculateDiscount(Cart cart, decimal subtotal)
    {
        if (cart.Coupon == null)
        {
            return 0;
        }

        var discount = cart.Coupon.DiscountType == "Percent"
            ? subtotal * cart.Coupon.DiscountValue / 100
            : cart.Coupon.DiscountValue;

        return cart.Coupon.MaxDiscount.HasValue ? Math.Min(discount, cart.Coupon.MaxDiscount.Value) : discount;
    }

    private static string FirstNonEmpty(params string?[] values)
        => values.Select(value => value?.Trim()).FirstOrDefault(value => !string.IsNullOrWhiteSpace(value)) ?? string.Empty;

    private static string FormatAddress(Address address)
        => string.Join(", ", new[]
        {
            address.Street,
            address.Ward,
            address.District,
            address.Province
        }.Where(part => !string.IsNullOrWhiteSpace(part)));

    private static object MapOrder(Order order)
        => new
        {
            order.OrderId,
            order.Status,
            order.ReceiverName,
            order.Phone,
            order.ShippingAddress,
            order.Subtotal,
            order.DiscountTotal,
            order.ShippingFee,
            order.GrandTotal,
            order.TrackingCode,
            order.Note,
            order.CreatedAt,
            cancelReason = order.StatusLogs
                .Where(l => l.NewStatus == "Cancelled")
                .OrderByDescending(l => l.ChangedAt)
                .Select(l => l.Note)
                .FirstOrDefault(),
            itemCount = order.Items.Sum(i => i.Quantity),
            items = order.Items.Select(i => new
            {
                i.OrderItemId,
                i.VariantId,
                productId = i.Variant?.ProductId,
                productSlug = i.Variant?.Product?.Slug,
                i.ProductName,
                i.VariantInfo,
                i.Quantity,
                i.UnitPrice,
                i.Subtotal
            }),
            payment = order.Payment == null ? null : new { order.Payment.Method, order.Payment.Status, order.Payment.Amount },
            statusLogs = order.StatusLogs.OrderBy(l => l.ChangedAt).Select(l => new { l.OldStatus, l.NewStatus, l.Note, l.ChangedAt })
        };
}
