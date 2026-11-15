using Student_Project_Management.Models;
using Task = System.Threading.Tasks.Task;

namespace Student_Project_Management.Repositories.Interfaces
{
    public interface IRoleRepository
    {
        Task<List<Role>> GetAllAsync();
        Task<(List<Role> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize);
        Task<Role?> GetByIdAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task AddAsync(Role role);
        void Update(Role role);
        void Delete(Role role);
        Task SaveChangesAsync();
    }
}