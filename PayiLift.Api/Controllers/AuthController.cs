
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PayiLift.Api.Data;
using PayiLift.Api.Models;

namespace PayiLift.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly PayiLiftDbContext _dbContext;
    private readonly IConfiguration _configuration;
    private readonly PasswordHasher<User> _passwordHasher = new();

    public AuthController(
        PayiLiftDbContext dbContext,
        IConfiguration configuration)
    {
        _dbContext = dbContext;
        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(
        [FromBody] RegisterRequest request)
    {
        var fullName = request.FullName?.Trim();
        var email = request.Email?.Trim().ToLowerInvariant();
        var phoneNumber = request.PhoneNumber?.Trim();

        if (string.IsNullOrWhiteSpace(fullName) ||
            string.IsNullOrWhiteSpace(email) ||
            string.IsNullOrWhiteSpace(phoneNumber) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new
            {
                message = "All fields are required."
            });
        }

        if (fullName.Length > 100 ||
            email.Length > 254 ||
            phoneNumber.Length > 20)
        {
            return BadRequest(new
            {
                message = "One or more fields exceed the allowed length."
            });
        }

        if (!new System.ComponentModel.DataAnnotations
                .EmailAddressAttribute().IsValid(email))
        {
            return BadRequest(new
            {
                message = "Enter a valid email address."
            });
        }

        if (request.Password.Length < 8)
        {
            return BadRequest(new
            {
                message = "Password must be at least 8 characters long."
            });
        }

        bool emailExists = await _dbContext.Users
            .AnyAsync(user => user.Email == email);

        if (emailExists)
        {
            return Conflict(new
            {
                message = "An account with this email already exists."
            });
        }

        var requestedRole = request.Role?.Trim().ToLowerInvariant();

        var role = requestedRole switch
        {
            "passenger" => "Passenger",
            "driver" => "Driver",
            "both" => "Both",
            _ => null
        };

        if (role is null)
        {
            return BadRequest(new
            {
                message = "Please select Passenger, Driver, or Both."
            });
        }

        var user = new User
        {
            FullName = fullName,
            Email = email,
            PhoneNumber = phoneNumber,
            Role = role,
            CreatedAtUtc = DateTime.UtcNow
        };

        user.PasswordHash = _passwordHasher.HashPassword(
            user, request.Password);

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync();

        return StatusCode(201, new
        {
            message = "Registration successful.",
            user = new
            {
                user.Id,
                user.FullName,
                user.Email,
                user.PhoneNumber,
                user.Role,
                user.CreatedAtUtc
            }
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest request)
    {
        var email = request.Email?.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new
            {
                message = "Email and password are required."
            });
        }

        var user = await _dbContext.Users
            .SingleOrDefaultAsync(user => user.Email == email);

        if (user is null)
        {
            return Unauthorized(new
            {
                message = "Invalid email or password."
            });
        }

        var passwordResult = _passwordHasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            request.Password);

        if (passwordResult == PasswordVerificationResult.Failed)
        {
            return Unauthorized(new
            {
                message = "Invalid email or password."
            });
        }

        var jwtKey = _configuration["Jwt:Key"]!;
        var jwtIssuer = _configuration["Jwt:Issuer"]!;
        var jwtAudience = _configuration["Jwt:Audience"]!;

        var keyBytes = Convert.FromBase64String(jwtKey);
        var signingKey = new SymmetricSecurityKey(keyBytes);

        var claims = new[]
        {
            new Claim(
                ClaimTypes.NameIdentifier,
                user.Id.ToString()),

            new Claim(ClaimTypes.Name, user.FullName),

            new Claim(ClaimTypes.Email, user.Email),

            new Claim(ClaimTypes.Role, user.Role)
        };

        var expiresAtUtc = DateTime.UtcNow.AddMinutes(60);

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtAudience,
            claims: claims,
            expires: expiresAtUtc,
            signingCredentials: new SigningCredentials(
                signingKey,
                SecurityAlgorithms.HmacSha256));

        var tokenString = new JwtSecurityTokenHandler()
            .WriteToken(token);

        return Ok(new
        {
            message = "Login successful.",
            token = tokenString,
            expiresAtUtc,
            user = new
            {
                user.Id,
                user.FullName,
                user.Email,
                user.PhoneNumber,
                user.Role
            }
        });
    }
}

public class RegisterRequest
{
    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;
}
