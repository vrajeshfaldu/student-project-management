using Student_Project_Management.DTOs;
using Student_Project_Management.Helpers;

namespace Student_Project_Management.Services.Interfaces
{
    public interface IUserTypeService
    {
        Task<ApiResponse<object>> GetAllUserTypesAsync(int pageNumber = 1, int pageSize = 10);
        Task<ApiResponse<UserTypeDTO>> GetUserTypeByIdAsync(int id);
        Task<ApiResponse<UserTypeDTO>> CreateUserTypeAsync(UserTypeDTO dto);
        Task<ApiResponse<UserTypeDTO>> UpdateUserTypeAsync(int id, UserTypeDTO dto);
        Task<ApiResponse<object>> DeleteUserTypeAsync(int id);
    }
}
