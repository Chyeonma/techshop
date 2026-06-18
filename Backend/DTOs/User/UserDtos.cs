using System.ComponentModel.DataAnnotations;

namespace TechShop.Backend.DTOs.User;

public record UpdateProfileDto(
    [Required, MaxLength(150)] string FullName,
    [MaxLength(20)] string? Phone);

public record UpsertAddressDto(
    [Required, MaxLength(150)] string ReceiverName,
    [Required, MaxLength(20)] string Phone,
    [MaxLength(100)] string? Province,
    [MaxLength(100)] string? District,
    [MaxLength(100)] string? Ward,
    [Required, MaxLength(255)] string Street,
    bool IsDefault);

public record UserProfileDto(
    Guid UserId,
    string Email,
    string FullName,
    string? Phone,
    string? AvatarUrl,
    int RoleId,
    string Role);

public record AddressDto(
    Guid AddressId,
    string ReceiverName,
    string Phone,
    string Province,
    string District,
    string Ward,
    string Street,
    string FullAddress,
    bool IsDefault);
