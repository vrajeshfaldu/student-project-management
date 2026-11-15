using Student_Project_Management.Models;
using Task = System.Threading.Tasks.Task;

namespace Student_Project_Management.Repositories.Interfaces
{
    public interface IUserRoleRepository
    {
        Task<List<UserRole>> GetAllAsync();
        Task<(List<UserRole> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize);
        Task<UserRole?> GetByIdAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task AddAsync(UserRole userRole);
        void Update(UserRole userRole);
        void Delete(UserRole userRole);
        Task SaveChangesAsync();
    }
}
