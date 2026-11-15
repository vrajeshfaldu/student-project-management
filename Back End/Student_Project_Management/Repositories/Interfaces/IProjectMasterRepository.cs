using Student_Project_Management.Models;
using Task = System.Threading.Tasks.Task;

namespace Student_Project_Management.Repositories.Interfaces
{
    public interface IProjectMasterRepository
    {
        Task<List<ProjectMaster>> GetAllAsync();
        Task<(List<ProjectMaster> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize);
        Task<ProjectMaster?> GetByIdAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task AddAsync(ProjectMaster project);
        void Update(ProjectMaster project);
        void Delete(ProjectMaster project);
        Task SaveChangesAsync();
    }
}
