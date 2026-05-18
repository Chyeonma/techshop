namespace TechShop.DTOs
{
    public class CreateOrderDto
    {
        public Guid? CouponId { get; set; }
        public Guid AddressId { get; set; }
        public string PaymentMethod { get; set; } = "COD"; // COD, VNPay, Momo
        public string ShippingCarrier { get; set; }
        public string Note { get; set; }
        public List<OrderItemDto> Items { get; set; }
    }

    public class OrderItemDto
    {
        public Guid VariantId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }

    public class UpdateOrderStatusDto
    {
        public string Status { get; set; }
    }
}