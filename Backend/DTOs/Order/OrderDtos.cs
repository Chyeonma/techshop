namespace TechShop.Backend.DTOs.Order;

public record CreateOrderDto(
    string? ReceiverName,
    string? Phone,
    string? ShippingAddress,
    string? Note,
    Guid? AddressId = null,
    List<Guid>? SelectedCartItemIds = null
);
public record UpdateOrderStatusDto(string Status, string? Note);
public record UpdateTrackingDto(string? TrackingCode);
public record UpdateOrderAddressDto(
    string ReceiverName,
    string Phone,
    string ShippingAddress);
public record CancelOrderDto(string Reason, string? Note);
