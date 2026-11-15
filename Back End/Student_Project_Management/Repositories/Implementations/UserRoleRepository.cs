using Microsoft.EntityFrameworkCore;
using Student_Project_Management.Data;
using Student_Project_Management.Models;
using Student_Project_Management.Repositories.Interfaces;
using Task = System.Threading.Tasks.Task;

namespace Student_Project_Management.Repositories.Implementations
{
    public class UserRoleRepository : IUserRoleRepository
    {
        private readonly AppDbContext _context;

        public UserRoleRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<UserRole>> GetAllAsync()
        {
            return await _context.UserRoles
                .Include(x => x.User)
                .Include(x => x.Role)
                .ToListAsync();
        }

        public async Task<(List<UserRole> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize)
        {
            var query = _context.UserRoles
                .AsNoTracking()
                .Include(x => x.User)
                .Include(x => x.Role);

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderBy(x => x.RolePermissionID)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<UserRole?> GetByIdAsync(int id)
        {
            return await _context.UserRoles
                .Include(x => x.User)
                .Include(x => x.Role)
                .FirstOrDefaultAsync(x => x.RolePermissionID == id);
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.UserRoles.AnyAsync(x => x.RolePermissionID == id);
        }

        public async Task AddAsync(UserRole userRole)
        {
            await _context.UserRoles.AddAsync(userRole);
        }

        public void Update(UserRole userRole)
        {
            _context.UserRoles.Update(userRole);
        }

        public void Delete(UserRole userRole)
        {
            _context.UserRoles.Remove(userRole);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
