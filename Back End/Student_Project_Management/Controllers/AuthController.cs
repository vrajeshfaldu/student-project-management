using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Student_Project_Management.Data;
using Student_Project_Management.DTOs;
using Student_Project_Management.Services.Interfaces;

namespace Student_Project_Management.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ITokenService _tokenService;

        public AuthController(
            AppDbContext context,
            ITokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDTO loginDTO)
        {
            var user = await _context.Users
                .Include(u => u.UserType)
                .FirstOrDefaultAsync(x =>
                    x.Email == loginDTO.Email &&
                    x.Password == loginDTO.Password);

            if (user == null)
            {
                return Unauthorized("Invalid Email or Password");
            }

            var token = _tokenService.GenerateToken(user);

            return Ok(new
            {
                Token = token
            });
        }
    }
}
