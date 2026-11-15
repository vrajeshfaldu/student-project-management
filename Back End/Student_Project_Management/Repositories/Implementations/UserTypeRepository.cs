using Microsoft.EntityFrameworkCore;
using Student_Project_Management.Data;
using Student_Project_Management.Models;
using Student_Project_Management.Repositories.Interfaces;
using Task = System.Threading.Tasks.Task;

namespace Student_Project_Management.Repositories.Implementations
{
    public class UserTypeRepository : IUserTypeRepository
    {
        private readonly AppDbContext _context;

        public UserTypeRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<UserType>> GetAllAsync()
        {
            return await _context.UserTypes
                .Include(u => u.Users)
                .ToListAsync();
        }

        public async Task<(List<UserType> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize)
        {
            var query = _context.UserTypes
                .AsNoTracking()
                .Include(u => u.Users);

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderBy(u => u.UserTypeID)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<UserType?> GetByIdAsync(int id)
        {
            return await _context.UserTypes
                .Include(u => u.Users)
                .FirstOrDefaultAsync(u => u.UserTypeID == id);
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.UserTypes.AnyAsync(u => u.UserTypeID == id);
        }

        public async Task AddAsync(UserType userType)
        {
            await _context.UserTypes.AddAsync(userType);
        }

        public void Update(UserType userType)
        {
            _context.UserTypes.Update(userType);
        }

        public void Delete(UserType userType)
        {
            _context.UserTypes.Remove(userType);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
