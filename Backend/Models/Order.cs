using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TechShop.Backend.Models;

public class Order
{
    [Key]
    public Guid OrderId { get; set; } = Guid.NewGuid();

    [Required]
    public Guid UserId { get; set; }

    public Guid? CouponId { get; set; }

    public Guid? AddressId { get; set; }

    [MaxLength(50)]
    public string Status { get; set; } = "Chờ xác nhận";

    [Column(TypeName = "decimal(18,2)")]
    public decimal Subtotal { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal DiscountAmount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal ShippingFee { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }

    [MaxLength(500)]
    public string? Note { get; set; }

    [MaxLength(100)]
    public string? ShippingCarrier { get; set; }

    [MaxLength(100)]
    public string? TrackingCode { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // Navigation property để Entity Framework tự động join bảng khi dùng .Include()
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}