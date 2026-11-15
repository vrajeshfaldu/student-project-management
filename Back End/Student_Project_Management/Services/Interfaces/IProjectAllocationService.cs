using Student_Project_Management.DTOs;
using Student_Project_Management.Helpers;

namespace Student_Project_Management.Services.Interfaces
{
    public interface IProjectAllocationService
    {
        Task<ApiResponse<object>> GetAllProjectAllocationsAsync(int pageNumber = 1, int pageSize = 10);

        Task<ApiResponse<ProjectAllocationDTO>> GetProjectAllocationByIdAsync(int id);

        Task<ApiResponse<ProjectAllocationDTO>> CreateProjectAllocationAsync(ProjectAllocationDTO dto);

        Task<ApiResponse<ProjectAllocationDTO>> UpdateProjectAllocationAsync(
            int id,
            ProjectAllocationDTO dto);

        Task<ApiResponse<object>> DeleteProjectAllocationAsync(int id);
    }
}
