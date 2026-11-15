using Microsoft.EntityFrameworkCore;
using Student_Project_Management.Data;
using Student_Project_Management.Models;
using Student_Project_Management.Repositories.Interfaces;
using Task = System.Threading.Tasks.Task;

namespace Student_Project_Management.Repositories.Implementations
{
    public class RoleRepository : IRoleRepository
    {
        private readonly AppDbContext _context;

        public RoleRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Role>> GetAllAsync()
        {
            return await _context.Roles
                .Include(r => r.UserRoles)
                .ToListAsync();
        }

        public async Task<(List<Role> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize)
        {
            var query = _context.Roles
                .AsNoTracking()
                .Include(r => r.UserRoles);

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderBy(r => r.RoleID)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<Role?> GetByIdAsync(int id)
        {
            return await _context.Roles
                .Include(r => r.UserRoles)
                .FirstOrDefaultAsync(r => r.RoleID == id);
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Roles.AnyAsync(r => r.RoleID == id);
        }

        public async Task AddAsync(Role role)
        {
            await _context.Roles.AddAsync(role);
        }

        public void Update(Role role)
        {
            _context.Roles.Update(role);
        }

        public void Delete(Role role)
        {
            _context.Roles.Remove(role);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}