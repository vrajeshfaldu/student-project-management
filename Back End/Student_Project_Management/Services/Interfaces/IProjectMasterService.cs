using Student_Project_Management.DTOs;
using Student_Project_Management.Helpers;

namespace Student_Project_Management.Services.Interfaces
{
    public interface IProjectMasterService
    {
        Task<ApiResponse<object>> GetAllProjectsAsync(int pageNumber = 1, int pageSize = 10);

        Task<ApiResponse<ProjectMasterDTO>> GetProjectByIdAsync(int id);

        Task<ApiResponse<ProjectMasterDTO>> CreateProjectAsync(ProjectMasterDTO dto);

        Task<ApiResponse<ProjectMasterDTO>> UpdateProjectAsync(int id, ProjectMasterDTO dto);

        Task<ApiResponse<object>> DeleteProjectAsync(int id);
    }
}
