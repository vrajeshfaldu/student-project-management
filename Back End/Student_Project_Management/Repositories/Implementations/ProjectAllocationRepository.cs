using Microsoft.EntityFrameworkCore;
using Student_Project_Management.Data;
using Student_Project_Management.Models;
using Student_Project_Management.Repositories.Interfaces;
using Task = System.Threading.Tasks.Task;

namespace Student_Project_Management.Repositories.Implementations
{
    public class ProjectAllocationRepository : IProjectAllocationRepository
    {
        private readonly AppDbContext _context;

        public ProjectAllocationRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ProjectAllocation>> GetAllAsync()
        {
            return await _context.ProjectAllocations
                .Include(x => x.Project)
                .Include(x => x.Student)
                .Include(x => x.Faculty)
                .ToListAsync();
        }

        public async Task<(List<ProjectAllocation> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize)
        {
            var query = _context.ProjectAllocations
                .AsNoTracking()
                .Include(x => x.Project)
                .Include(x => x.Student)
                .Include(x => x.Faculty);

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderBy(x => x.ProjectAllocationID)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<ProjectAllocation?> GetByIdAsync(int id)
        {
            return await _context.ProjectAllocations
                .Include(x => x.Project)
                .Include(x => x.Student)
                .Include(x => x.Faculty)
                .FirstOrDefaultAsync(x => x.ProjectAllocationID == id);
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.ProjectAllocations.AnyAsync(x => x.ProjectAllocationID == id);
        }

        public async Task AddAsync(ProjectAllocation projectAllocation)
        {
            await _context.ProjectAllocations.AddAsync(projectAllocation);
        }

        public void Update(ProjectAllocation projectAllocation)
        {
            _context.ProjectAllocations.Update(projectAllocation);
        }

        public void Delete(ProjectAllocation projectAllocation)
        {
            _context.ProjectAllocations.Remove(projectAllocation);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
