using Student_Project_Management.DTOs;
using Student_Project_Management.Helpers;

namespace Student_Project_Management.Services.Interfaces
{
    public interface IUserRoleService
    {
        Task<ApiResponse<object>> GetAllUserRolesAsync(int pageNumber = 1, int pageSize = 10);

        Task<ApiResponse<UserRoleDTO>> GetUserRoleByIdAsync(int id);

        Task<ApiResponse<UserRoleDTO>> CreateUserRoleAsync(UserRoleDTO dto);

        Task<ApiResponse<UserRoleDTO>> UpdateUserRoleAsync(int id, UserRoleDTO dto);

        Task<ApiResponse<object>> DeleteUserRoleAsync(int id);
    }
}
