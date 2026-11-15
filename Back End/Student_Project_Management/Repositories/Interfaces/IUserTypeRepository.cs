using Student_Project_Management.Models;
using Task = System.Threading.Tasks.Task;

namespace Student_Project_Management.Repositories.Interfaces
{
    public interface IUserTypeRepository
    {
        Task<List<UserType>> GetAllAsync();
        Task<(List<UserType> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize);
        Task<UserType?> GetByIdAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task AddAsync(UserType userType);
        void Update(UserType userType);
        void Delete(UserType userType);
        Task SaveChangesAsync();
    }
}
