using Student_Project_Management.Models;
using Task = System.Threading.Tasks.Task;

namespace Student_Project_Management.Repositories.Interfaces
{
    public interface IProjectAllocationRepository
    {
        Task<List<ProjectAllocation>> GetAllAsync();
        Task<(List<ProjectAllocation> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize);
        Task<ProjectAllocation?> GetByIdAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task AddAsync(ProjectAllocation projectAllocation);
        void Update(ProjectAllocation projectAllocation);
        void Delete(ProjectAllocation projectAllocation);
        Task SaveChangesAsync();
    }
}
