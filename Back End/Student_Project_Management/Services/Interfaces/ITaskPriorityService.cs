using Student_Project_Management.DTOs;
using Student_Project_Management.Helpers;

namespace Student_Project_Management.Services.Interfaces
{
    public interface ITaskPriorityService
    {
        Task<ApiResponse<object>> GetAllTaskPrioritiesAsync(int pageNumber = 1, int pageSize = 10);

        Task<ApiResponse<TaskPriorityDTO>> GetTaskPriorityByIdAsync(int id);

        Task<ApiResponse<TaskPriorityDTO>> CreateTaskPriorityAsync(TaskPriorityDTO dto);

        Task<ApiResponse<TaskPriorityDTO>> UpdateTaskPriorityAsync(int id, TaskPriorityDTO dto);

        Task<ApiResponse<object>> DeleteTaskPriorityAsync(int id);
    }
}
