using Microsoft.EntityFrameworkCore;
using Student_Project_Management.Data;
using Student_Project_Management.Repositories.Interfaces;
using ModelTask = Student_Project_Management.Models.Task;
using Task = System.Threading.Tasks.Task;

namespace Student_Project_Management.Repositories.Implementations
{
    public class TaskRepository : ITaskRepository
    {
        private readonly AppDbContext _context;

        public TaskRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ModelTask>> GetAllAsync()
        {
            return await _context.Tasks
                .Include(x => x.ProjectAllocation)
                    .ThenInclude(pa => pa!.Project)
                .Include(x => x.TaskStatus)
                .Include(x => x.TaskPriority)
                .ToListAsync();
        }

        public async Task<(List<ModelTask> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize)
        {
            var query = _context.Tasks
                .AsNoTracking()
                .Include(x => x.ProjectAllocation)
                    .ThenInclude(pa => pa!.Project)
                .Include(x => x.TaskStatus)
                .Include(x => x.TaskPriority);

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderBy(x => x.TaskID)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<ModelTask?> GetByIdAsync(int id)
        {
            return await _context.Tasks
                .Include(x => x.ProjectAllocation)
                    .ThenInclude(pa => pa!.Project)
                .Include(x => x.TaskStatus)
                .Include(x => x.TaskPriority)
                .FirstOrDefaultAsync(x => x.TaskID == id);
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Tasks.AnyAsync(x => x.TaskID == id);
        }

        public async Task AddAsync(ModelTask task)
        {
            await _context.Tasks.AddAsync(task);
        }

        public void Update(ModelTask task)
        {
            _context.Tasks.Update(task);
        }

        public void Delete(ModelTask task)
        {
            _context.Tasks.Remove(task);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
