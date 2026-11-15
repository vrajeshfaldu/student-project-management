using Student_Project_Management.Models;
using Task = System.Threading.Tasks.Task;

namespace Student_Project_Management.Repositories.Interfaces
{
    public interface IUserRepository
    {
        Task<List<User>> GetAllAsync();
        Task<(List<User> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize, int? userTypeId = null);
        Task<User?> GetByIdAsync(int id);
        Task<User?> GetByEmailAndPasswordAsync(string email, string password);
        Task<bool> ExistsAsync(int id);
        Task AddAsync(User user);
        void Update(User user);
        void Delete(User user);
        Task SaveChangesAsync();
    }
}
