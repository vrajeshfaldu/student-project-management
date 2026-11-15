using Microsoft.EntityFrameworkCore;
using Student_Project_Management.Data;
using Student_Project_Management.Models;
using Student_Project_Management.Repositories.Interfaces;
using Task = System.Threading.Tasks.Task;

namespace Student_Project_Management.Repositories.Implementations
{
    public class TaskPriorityRepository : ITaskPriorityRepository
    {
        private readonly AppDbContext _context;

        public TaskPriorityRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<TaskPriority>> GetAllAsync()
        {
            return await _context.TaskPriorities.ToListAsync();
        }

        public async Task<(List<TaskPriority> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize)
        {
            var query = _context.TaskPriorities
                .AsNoTracking();

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderBy(x => x.TaskPriorityID)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<TaskPriority?> GetByIdAsync(int id)
        {
            return await _context.TaskPriorities
                .FirstOrDefaultAsync(x => x.TaskPriorityID == id);
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.TaskPriorities.AnyAsync(x => x.TaskPriorityID == id);
        }

        public async Task AddAsync(TaskPriority taskPriority)
        {
            await _context.TaskPriorities.AddAsync(taskPriority);
        }

        public void Update(TaskPriority taskPriority)
        {
            _context.TaskPriorities.Update(taskPriority);
        }

        public void Delete(TaskPriority taskPriority)
        {
            _context.TaskPriorities.Remove(taskPriority);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
