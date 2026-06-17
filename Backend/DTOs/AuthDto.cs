using System.ComponentModel.DataAnnotations;

namespace TechShop.Backend.DTOs;

public record RegisterDto(
    [Required, EmailAddress, MaxLength(255)] string Email,
    [Required, MinLength(6), MaxLength(100)] string Password,
    [Required, MaxLength(150)] string FullName,
    [MaxLength(20)] string? Phone);

public record LoginDto(
    [Required, EmailAddress, MaxLength(255)] string Email,
    [Required] string Password);

public record RefreshTokenDto(
    [Required] string RefreshToken);

public record LogoutDto(
    [Required] string RefreshToken);

public record GoogleLoginDto(
    [Required] string Credential);
