using Student_Project_Management.DTOs;
using Student_Project_Management.Helpers;

namespace Student_Project_Management.Services.Interfaces
{
    public interface ITaskService
    {
        Task<ApiResponse<object>> GetAllTasksAsync(int pageNumber = 1, int pageSize = 10);

        Task<ApiResponse<TaskDTO>> GetTaskByIdAsync(int id);

        Task<ApiResponse<TaskDTO>> CreateTaskAsync(TaskDTO dto);

        Task<ApiResponse<TaskDTO>> UpdateTaskAsync(int id, TaskDTO dto);

        Task<ApiResponse<object>> DeleteTaskAsync(int id);
    }
}
