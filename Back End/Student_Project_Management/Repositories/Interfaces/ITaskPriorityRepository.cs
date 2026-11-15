using Student_Project_Management.Models;
using Task = System.Threading.Tasks.Task;

namespace Student_Project_Management.Repositories.Interfaces
{
    public interface ITaskPriorityRepository
    {
        Task<List<TaskPriority>> GetAllAsync();
        Task<(List<TaskPriority> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize);
        Task<TaskPriority?> GetByIdAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task AddAsync(TaskPriority taskPriority);
        void Update(TaskPriority taskPriority);
        void Delete(TaskPriority taskPriority);
        Task SaveChangesAsync();
    }
}
