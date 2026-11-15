using ModelTask = Student_Project_Management.Models.Task;
using Task = System.Threading.Tasks.Task;

namespace Student_Project_Management.Repositories.Interfaces
{
    public interface ITaskRepository
    {
        Task<List<ModelTask>> GetAllAsync();
        Task<(List<ModelTask> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize);
        Task<ModelTask?> GetByIdAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task AddAsync(ModelTask task);
        void Update(ModelTask task);
        void Delete(ModelTask task);
        Task SaveChangesAsync();
    }
}
