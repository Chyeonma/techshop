using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TechShop.Backend.Data;
using TechShop.Backend.DTOs.Common;
using TechShop.Backend.DTOs.Order;

namespace TechShop.Backend.Services;

public class AdminOrdersService : IAdminOrdersService
{
    private readonly AppDbContext _context;
    private readonly IEmailService _emailService;

    public AdminOrdersService(AppDbContext context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    public async Task<ApiResponse<object>> GetOrdersAsync(string? status, int page, int pageSize)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);
        var query = _context.Orders
            .Include(o => o.User)
            .Include(o => o.Items)
                .ThenInclude(i => i.Variant)
                .ThenInclude(v => v!.Product)
            .Include(o => o.StatusLogs)
            .Include(o => o.Payment)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(o => o.Status == status);
        }

        var total = await query.CountAsync();
        var orderPage = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var orders = orderPage
            .Select(o => new
            {
                o.OrderId,
                o.Status,
                o.ReceiverName,
                o.Phone,
                o.ShippingAddress,
                o.Subtotal,
                o.DiscountTotal,
                o.ShippingFee,
                o.GrandTotal,
                o.TrackingCode,
                o.Note,
                o.CreatedAt,
                o.UpdatedAt,
                cancelReason = o.StatusLogs
                    .Where(l => l.NewStatus == "Cancelled")
                    .OrderByDescending(l => l.ChangedAt)
                    .Select(l => l.Note)
                    .FirstOrDefault(),
                statusLogs = o.StatusLogs
                    .OrderByDescending(l => l.ChangedAt)
                    .Select(l => new { l.OldStatus, l.NewStatus, l.Note, l.ChangedAt }),
                customer = o.User == null ? null : new { o.User.UserId, o.User.Email, o.User.FullName, o.User.Phone },
                items = o.Items.Select(i => new
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
                payment = o.Payment == null ? null : new
                {
                    o.Payment.PaymentId,
                    o.Payment.Method,
                    o.Payment.Status,
                    o.Payment.Amount,
                    o.Payment.TransactionCode,
                    o.Payment.PaidAt
                }
            })
            .ToList();

        return ApiResponse<object>.Ok(orders, "OK", new PaginationMeta(page, pageSize, total));
    }

    public async Task<ApiResponse<object>> UpdateStatusAsync(Guid id, UpdateOrderStatusDto dto, Guid userId)
    {
        var order = await _context.Orders.Include(o => o.StatusLogs).FirstOrDefaultAsync(o => o.OrderId == id);
        if (order == null)
        {
            return ApiResponse<object>.Fail("NOT_FOUND", "Don hang khong ton tai.");
        }

        if (order.Status == "Cancelled")
        {
            return ApiResponse<object>.Fail("ORDER_LOCKED", "Don hang da huy va da bi khoa.");
        }

        var oldStatus = order.Status;
        order.Status = dto.Status;
        order.UpdatedAt = DateTime.UtcNow;
        _context.OrderStatusLogs.Add(new()
        {
            OrderId = order.OrderId,
            OldStatus = oldStatus,
            NewStatus = dto.Status,
            Note = dto.Note,
            ChangedBy = userId
        });

        await _context.SaveChangesAsync();
        await _emailService.SendOrderStatusChangedAsync(order, oldStatus, dto.Status);
        return ApiResponse<object>.Ok(new { order.OrderId, order.Status }, "Da cap nhat trang thai.");
    }

    public async Task<ApiResponse<object>> UpdateTrackingAsync(Guid id, UpdateTrackingDto dto)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null)
        {
            return ApiResponse<object>.Fail("NOT_FOUND", "Don hang khong ton tai.");
        }

        if (order.Status == "Cancelled")
        {
            return ApiResponse<object>.Fail("ORDER_LOCKED", "Don hang da huy va da bi khoa.");
        }

        order.TrackingCode = dto.TrackingCode;
        order.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return ApiResponse<object>.Ok(new { order.OrderId, order.TrackingCode }, "Da cap nhat ma van don.");
    }
}
