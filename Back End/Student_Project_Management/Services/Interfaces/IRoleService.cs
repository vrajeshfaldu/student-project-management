using Student_Project_Management.DTOs;
using Student_Project_Management.Helpers;

namespace Student_Project_Management.Services.Interfaces
{
    public interface IRoleService
    {
        Task<ApiResponse<object>> GetAllRolesAsync(int pageNumber = 1, int pageSize = 10);
        Task<ApiResponse<RoleDTO>> GetRoleByIdAsync(int id);
        Task<ApiResponse<RoleDTO>> CreateRoleAsync(RoleDTO roleDTO);
        Task<ApiResponse<RoleDTO>> UpdateRoleAsync(int id, RoleDTO roleDTO);
        Task<ApiResponse<object>> DeleteRoleAsync(int id);
    }
}