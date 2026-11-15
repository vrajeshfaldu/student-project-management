using Student_Project_Management.DTOs;
using Student_Project_Management.Helpers;

namespace Student_Project_Management.Services.Interfaces
{
    public interface ITaskStatusService
    {
        Task<ApiResponse<object>> GetAllTaskStatusesAsync(int pageNumber = 1, int pageSize = 10);

        Task<ApiResponse<TaskStatusDTO>> GetTaskStatusByIdAsync(int id);

        Task<ApiResponse<TaskStatusDTO>> CreateTaskStatusAsync(TaskStatusDTO dto);

        Task<ApiResponse<TaskStatusDTO>> UpdateTaskStatusAsync(int id, TaskStatusDTO dto);

        Task<ApiResponse<object>> DeleteTaskStatusAsync(int id);
    }
}
