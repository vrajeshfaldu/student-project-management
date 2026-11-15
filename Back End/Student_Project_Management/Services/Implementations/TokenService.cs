using Microsoft.IdentityModel.Tokens;
using Student_Project_Management.Models;
using Student_Project_Management.Services.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Student_Project_Management.Services.Implementations
{
    public class TokenService : ITokenService
    {
        private readonly IConfiguration _config;

        public TokenService(IConfiguration config)
        {
            _config = config;
        }

        public string GenerateToken(User user)
{
    // Info on the ID card (email, unique ID, token ID, and role)
    var claims = new[]
    {
        new Claim(JwtRegisteredClaimNames.Sub, user.Email),
        new Claim(ClaimTypes.NameIdentifier, user.UserID.ToString()),
        new Claim(ClaimTypes.Email, user.Email),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        new Claim(ClaimTypes.Role, user.UserType?.UserTypeName ?? string.Empty) 
    };


    var key = new SymmetricSecurityKey(
        Encoding.UTF8.GetBytes(_config["Jwt:Key"]!)
    );

    var credentials = new SigningCredentials(
        key,
        SecurityAlgorithms.HmacSha256
    );

    // JwtSecurityToken: the actual card with issuer, audience, claims, expiry
    var token = new JwtSecurityToken(
        issuer: _config["Jwt:Issuer"],
        audience: _config["Jwt:Audience"],
        claims: claims,
        expires: DateTime.UtcNow.AddMinutes(
            double.Parse(_config["Jwt:ExpiresInMinutes"]!)
        ),
        signingCredentials: credentials // Key + algorithm combo used to sign the token
    );

    return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}

