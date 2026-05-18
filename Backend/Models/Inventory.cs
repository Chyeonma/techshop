using System.ComponentModel.DataAnnotations;

namespace TechShop.Backend.Models;

public class Inventory
{
    [Key]
    public Guid InventoryId { get; set; } = Guid.NewGuid();

    [Required]
    public Guid VariantId { get; set; }

    [Required]
    public int Quantity { get; set; }

    // Cảnh báo khi tồn kho tụt xuống mức này
    public int LowStockAlert { get; set; } = 10;

    public DateTime? UpdatedAt { get; set; }
}