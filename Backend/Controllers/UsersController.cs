using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechShop.Backend.Data;
using TechShop.Backend.DTOs.Common;
using TechShop.Backend.DTOs.User;
using TechShop.Backend.Models;

namespace TechShop.Backend.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetProfile()
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.UserId == GetUserId());

        if (user == null)
        {
            return NotFound(ApiResponse<object>.Fail("USER_NOT_FOUND", "Nguoi dung khong ton tai."));
        }

        return Ok(ApiResponse<UserProfileDto>.Ok(MapProfile(user)));
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpdateProfile(UpdateProfileDto dto)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.UserId == GetUserId());

        if (user == null)
        {
            return NotFound(ApiResponse<object>.Fail("USER_NOT_FOUND", "Nguoi dung khong ton tai."));
        }

        user.FullName = dto.FullName.Trim();
        user.Phone = NormalizeNullable(dto.Phone);
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<UserProfileDto>.Ok(MapProfile(user), "Da cap nhat thong tin tai khoan."));
    }

    [HttpGet("me/addresses")]
    public async Task<IActionResult> GetAddresses()
    {
        var userId = GetUserId();
        var addresses = await _context.Addresses
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.IsDefault)
            .ThenBy(a => a.Province)
            .ThenBy(a => a.District)
            .ThenBy(a => a.Ward)
            .ThenBy(a => a.Street)
            .ToListAsync();

        return Ok(ApiResponse<List<AddressDto>>.Ok(addresses.Select(MapAddress).ToList()));
    }

    [HttpPost("me/addresses")]
    public async Task<IActionResult> CreateAddress(UpsertAddressDto dto)
    {
        var userId = GetUserId();
        var hasAddress = await _context.Addresses.AnyAsync(a => a.UserId == userId);
        var address = new Address
        {
            UserId = userId,
            ReceiverName = dto.ReceiverName.Trim(),
            Phone = dto.Phone.Trim(),
            Province = Normalize(dto.Province),
            District = Normalize(dto.District),
            Ward = Normalize(dto.Ward),
            Street = dto.Street.Trim(),
            IsDefault = dto.IsDefault || !hasAddress
        };

        if (address.IsDefault)
        {
            await ClearDefaultAddress(userId);
        }

        _context.Addresses.Add(address);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<AddressDto>.Ok(MapAddress(address), "Da them dia chi."));
    }

    [HttpPut("me/addresses/{addressId:guid}")]
    public async Task<IActionResult> UpdateAddress(Guid addressId, UpsertAddressDto dto)
    {
        var userId = GetUserId();
        var address = await _context.Addresses
            .FirstOrDefaultAsync(a => a.AddressId == addressId && a.UserId == userId);

        if (address == null)
        {
            return NotFound(ApiResponse<object>.Fail("ADDRESS_NOT_FOUND", "Dia chi khong ton tai."));
        }

        address.ReceiverName = dto.ReceiverName.Trim();
        address.Phone = dto.Phone.Trim();
        address.Province = Normalize(dto.Province);
        address.District = Normalize(dto.District);
        address.Ward = Normalize(dto.Ward);
        address.Street = dto.Street.Trim();

        if (dto.IsDefault)
        {
            await ClearDefaultAddress(userId);
            address.IsDefault = true;
        }
        else
        {
            address.IsDefault = false;
        }

        await EnsureOneDefaultAddress(userId, address);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<AddressDto>.Ok(MapAddress(address), "Da cap nhat dia chi."));
    }

    [HttpPatch("me/addresses/{addressId:guid}/default")]
    public async Task<IActionResult> SetDefaultAddress(Guid addressId)
    {
        var userId = GetUserId();
        var address = await _context.Addresses
            .FirstOrDefaultAsync(a => a.AddressId == addressId && a.UserId == userId);

        if (address == null)
        {
            return NotFound(ApiResponse<object>.Fail("ADDRESS_NOT_FOUND", "Dia chi khong ton tai."));
        }

        await ClearDefaultAddress(userId);
        address.IsDefault = true;
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<AddressDto>.Ok(MapAddress(address), "Da dat dia chi mac dinh."));
    }

    [HttpDelete("me/addresses/{addressId:guid}")]
    public async Task<IActionResult> DeleteAddress(Guid addressId)
    {
        var userId = GetUserId();
        var address = await _context.Addresses
            .FirstOrDefaultAsync(a => a.AddressId == addressId && a.UserId == userId);

        if (address == null)
        {
            return NotFound(ApiResponse<object>.Fail("ADDRESS_NOT_FOUND", "Dia chi khong ton tai."));
        }

        var wasDefault = address.IsDefault;
        _context.Addresses.Remove(address);
        await _context.SaveChangesAsync();

        if (wasDefault)
        {
            var nextAddress = await _context.Addresses
                .Where(a => a.UserId == userId)
                .OrderBy(a => a.Street)
                .FirstOrDefaultAsync();

            if (nextAddress != null)
            {
                nextAddress.IsDefault = true;
                await _context.SaveChangesAsync();
            }
        }

        return Ok(ApiResponse<object>.Ok(new { }, "Da xoa dia chi."));
    }

    private async Task ClearDefaultAddress(Guid userId)
    {
        var defaults = await _context.Addresses
            .Where(a => a.UserId == userId && a.IsDefault)
            .ToListAsync();

        foreach (var item in defaults)
        {
            item.IsDefault = false;
        }
    }

    private async Task EnsureOneDefaultAddress(Guid userId, Address current)
    {
        if (current.IsDefault)
        {
            return;
        }

        var hasDefault = await _context.Addresses
            .AnyAsync(a => a.UserId == userId && a.AddressId != current.AddressId && a.IsDefault);

        if (!hasDefault)
        {
            current.IsDefault = true;
        }
    }

    private Guid GetUserId()
        => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private static UserProfileDto MapProfile(User user)
        => new(
            user.UserId,
            user.Email,
            user.FullName,
            user.Phone,
            user.AvatarUrl,
            user.RoleId,
            user.Role?.RoleName ?? "Customer");

    private static AddressDto MapAddress(Address address)
        => new(
            address.AddressId,
            address.ReceiverName,
            address.Phone,
            address.Province,
            address.District,
            address.Ward,
            address.Street,
            FormatAddress(address),
            address.IsDefault);

    private static string FormatAddress(Address address)
        => string.Join(", ", new[]
        {
            address.Street,
            address.Ward,
            address.District,
            address.Province
        }.Where(part => !string.IsNullOrWhiteSpace(part)));

    private static string Normalize(string? value)
        => value?.Trim() ?? string.Empty;

    private static string? NormalizeNullable(string? value)
    {
        var normalized = value?.Trim();
        return string.IsNullOrWhiteSpace(normalized) ? null : normalized;
    }
}
