namespace TechShop.Backend.DTOs;

public record AddToCartDto(Guid VariantId, int Quantity);
public record UpdateCartItemDto(int Quantity);
public record ApplyCouponDto(string Code);
