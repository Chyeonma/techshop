using System;

namespace TechShop.Backend.DTOs;

public record AddToCartDto(Guid VariantId, int Quantity);