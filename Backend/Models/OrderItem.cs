using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TechShop.Backend.Models;

    public class OrderItem
{
    [Key]
    public Guid OrderItemId { get; set; } = Guid.NewGuid();

    [Required]
    public Guid OrderId { get; set; }

    [Required]
    public Guid VariantId { get; set; }

    [MaxLength(255)]
    public string? ProductName { get; set; }

    [MaxLength(255)]
    public string? VariantInfo { get; set; }

    public int Quantity { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal UnitPrice { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Subtotal { get; set; }

    // Navigation property liên kết về đơn hàng gốc
    [ForeignKey("OrderId")]
    public Order? Order { get; set; }
}
