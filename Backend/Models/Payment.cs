using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TechShop.Backend.Models;

public class Payment
{
    [Key]
    public Guid PaymentId { get; set; } = Guid.NewGuid();

    [Required]
    public Guid OrderId { get; set; }

    [Required]
    [MaxLength(50)]
    public string Method { get; set; } // VD: COD, VNPay, Momo

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } // VD: Pending, Paid, Cancelled

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [MaxLength(100)]
    public string? TransactionCode { get; set; } // Mã giao dịch trả về từ cổng thanh toán

    public string? GatewayResponse { get; set; } // JSON response từ VNPay/Momo để log

    public DateTime? PaidAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("OrderId")]
    public Order? Order { get; set; }
}
