using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TechShop.Backend.Data;
using TechShop.DTOs;
using TechShop.Backend.Models;

namespace TechShop.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;

    public OrdersController(AppDbContext context)
    {
        _context = context;
    }

    // POST: /api/orders - Tạo đơn hàng mới
    [HttpPost]
    [Authorize] 
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto request)
    {
        // Lấy UserId từ JWT Token
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdClaim, out Guid userId))
        {
            return Unauthorized("Không xác định được người dùng.");
        }

        // Mở Transaction để đảm bảo tính toàn vẹn dữ liệu
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // 1. Tính toán tiền
            decimal subtotal = request.Items.Sum(i => i.Quantity * i.UnitPrice);
            decimal discountAmount = 0; // Logic tính Coupon ở đây nếu có
            decimal shippingFee = 30000; // Phí ship giả định
            decimal totalAmount = subtotal - discountAmount + shippingFee;

            var order = new Order
            {
                OrderId = Guid.NewGuid(),
                UserId = userId,
                CouponId = request.CouponId,
                AddressId = request.AddressId,
                Status = "Chờ xác nhận", 
                Subtotal = subtotal,
                DiscountAmount = discountAmount,
                ShippingFee = shippingFee,
                TotalAmount = totalAmount,
                Note = request.Note,
                ShippingCarrier = request.ShippingCarrier,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Orders.AddAsync(order);

            foreach (var item in request.Items)
            {
                var inventory = await _context.Inventories
                    .FirstOrDefaultAsync(i => i.VariantId == item.VariantId);

                if (inventory == null || inventory.Quantity < item.Quantity)
                {
                    throw new Exception($"Sản phẩm không đủ số lượng trong kho.");
                }

                inventory.Quantity -= item.Quantity;
                inventory.UpdatedAt = DateTime.UtcNow;

                var orderItem = new OrderItem
                {
                    OrderItemId = Guid.NewGuid(),
                    OrderId = order.OrderId,
                    VariantId = item.VariantId,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    Subtotal = item.Quantity * item.UnitPrice
                };

                await _context.OrderItems.AddAsync(orderItem);
            }

            var payment = new Payment
            {
                PaymentId = Guid.NewGuid(),
                OrderId = order.OrderId,
                Method = request.PaymentMethod,
                Status = request.PaymentMethod == "COD" ? "Pending" : "Awaiting_Payment",
                Amount = totalAmount,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Payments.AddAsync(payment);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return CreatedAtAction(nameof(GetOrderById), new { id = order.OrderId }, new { message = "Tạo đơn hàng thành công", orderId = order.OrderId });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return BadRequest(new { message = ex.Message });
        }
    }

    // GET: /api/orders/{id} - Lấy chi tiết đơn hàng
    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetOrderById(Guid id)
    {
        var order = await _context.Orders
            .Include(o => o.Items) 
            .FirstOrDefaultAsync(o => o.OrderId == id);

        if (order == null) return NotFound("Không tìm thấy đơn hàng.");

        return Ok(order);
    }

    // PATCH: /api/orders/{id}/status - Cập nhật trạng thái
    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Admin,Staff")] // Chỉ nhân viên/admin mới được đổi trạng thái
    public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] UpdateOrderStatusDto request)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null) return NotFound("Không tìm thấy đơn hàng.");

        order.Status = request.Status;
        order.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Cập nhật trạng thái thành công" });
    }
}
