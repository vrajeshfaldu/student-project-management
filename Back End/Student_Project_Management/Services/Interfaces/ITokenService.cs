using Student_Project_Management.Models;

namespace Student_Project_Management.Services.Interfaces
{
    public interface ITokenService
    {
        public string GenerateToken(User user);
    }
}
