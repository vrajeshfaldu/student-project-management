using Microsoft.EntityFrameworkCore;
using Student_Project_Management.Data;
using Student_Project_Management.Models;
using Student_Project_Management.Repositories.Interfaces;
using Task = System.Threading.Tasks.Task;

namespace Student_Project_Management.Repositories.Implementations
{
    public class ProjectMasterRepository : IProjectMasterRepository
    {
        private readonly AppDbContext _context;

        public ProjectMasterRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ProjectMaster>> GetAllAsync()
        {
            return await _context.ProjectMasters.ToListAsync();
        }

        public async Task<(List<ProjectMaster> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize)
        {
            var query = _context.ProjectMasters
                .AsNoTracking();

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderBy(x => x.ProjectID)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<ProjectMaster?> GetByIdAsync(int id)
        {
            return await _context.ProjectMasters
                .FirstOrDefaultAsync(x => x.ProjectID == id);
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.ProjectMasters.AnyAsync(x => x.ProjectID == id);
        }

        public async Task AddAsync(ProjectMaster project)
        {
            await _context.ProjectMasters.AddAsync(project);
        }

        public void Update(ProjectMaster project)
        {
            _context.ProjectMasters.Update(project);
        }

        public void Delete(ProjectMaster project)
        {
            _context.ProjectMasters.Remove(project);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
