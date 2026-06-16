namespace TechShop.Backend.DTOs.Order;

public record CreateOrderDto(
    string ReceiverName,
    string Phone,
    string ShippingAddress,
    string? Note,
    List<Guid>? SelectedCartItemIds = null
);
public record UpdateOrderStatusDto(string Status, string? Note);
public record UpdateTrackingDto(string? TrackingCode);
