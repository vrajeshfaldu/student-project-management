using Student_Project_Management.DTOs;
using Student_Project_Management.Helpers;

namespace Student_Project_Management.Services.Interfaces
{
    public interface IUserService
    {
        Task<ApiResponse<object>> GetAllUsersAsync(
            int pageNumber = 1,
            int pageSize = 10,
            int? userTypeId = null);

        Task<ApiResponse<UserDTO>> GetUserByIdAsync(int id);

        Task<ApiResponse<UserDTO>> CreateUserAsync(UserDTO dto);

        Task<ApiResponse<UserDTO>> UpdateUserAsync(int id, UserDTO dto);

        Task<ApiResponse<object>> DeleteUserAsync(int id);
    }
}