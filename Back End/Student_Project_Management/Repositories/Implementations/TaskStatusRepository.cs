using Microsoft.EntityFrameworkCore;
using Student_Project_Management.Data;
using Student_Project_Management.Repositories.Interfaces;
using ModelTaskStatus = Student_Project_Management.Models.TaskStatus;
using Task = System.Threading.Tasks.Task;

namespace Student_Project_Management.Repositories.Implementations
{
    public class TaskStatusRepository : ITaskStatusRepository
    {
        private readonly AppDbContext _context;

        public TaskStatusRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ModelTaskStatus>> GetAllAsync()
        {
            return await _context.TaskStatuses.ToListAsync();
        }

        public async Task<(List<ModelTaskStatus> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize)
        {
            var query = _context.TaskStatuses
                .AsNoTracking();

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderBy(x => x.TaskStatusID)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<ModelTaskStatus?> GetByIdAsync(int id)
        {
            return await _context.TaskStatuses
                .FirstOrDefaultAsync(x => x.TaskStatusID == id);
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.TaskStatuses.AnyAsync(x => x.TaskStatusID == id);
        }

        public async Task AddAsync(ModelTaskStatus taskStatus)
        {
            await _context.TaskStatuses.AddAsync(taskStatus);
        }

        public void Update(ModelTaskStatus taskStatus)
        {
            _context.TaskStatuses.Update(taskStatus);
        }

        public void Delete(ModelTaskStatus taskStatus)
        {
            _context.TaskStatuses.Remove(taskStatus);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
