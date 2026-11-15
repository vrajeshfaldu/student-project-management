using ModelTaskStatus = Student_Project_Management.Models.TaskStatus;
using Task = System.Threading.Tasks.Task;

namespace Student_Project_Management.Repositories.Interfaces
{
    public interface ITaskStatusRepository
    {
        Task<List<ModelTaskStatus>> GetAllAsync();
        Task<(List<ModelTaskStatus> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize);
        Task<ModelTaskStatus?> GetByIdAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task AddAsync(ModelTaskStatus taskStatus);
        void Update(ModelTaskStatus taskStatus);
        void Delete(ModelTaskStatus taskStatus);
        Task SaveChangesAsync();
    }
}
