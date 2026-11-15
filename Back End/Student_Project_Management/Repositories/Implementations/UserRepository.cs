using Microsoft.EntityFrameworkCore;
using Student_Project_Management.Data;
using Student_Project_Management.Models;
using Student_Project_Management.Repositories.Interfaces;
using Task = System.Threading.Tasks.Task;

namespace Student_Project_Management.Repositories.Implementations
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<User>> GetAllAsync()
        {
            return await _context.Users
                .Include(u => u.UserType)
                .ToListAsync();
        }

        public async Task<(List<User> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize, int? userTypeId = null)
        {
            var query = _context.Users
                .AsNoTracking()
                .Include(u => u.UserType)
                .Where(u => u.IsDeleted != true);

            if (userTypeId.HasValue && userTypeId.Value > 0)
            {
                query = query.Where(u => u.UserTypeID == userTypeId.Value);
            }

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderBy(u => u.UserID)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            return await _context.Users
                .Include(u => u.UserType)
                .FirstOrDefaultAsync(u => u.UserID == id);
        }

        public async Task<User?> GetByEmailAndPasswordAsync(string email, string password)
        {
            return await _context.Users
                .Include(u => u.UserType)
                .FirstOrDefaultAsync(x => x.Email == email && x.Password == password);
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Users.AnyAsync(u => u.UserID == id);
        }

        public async Task AddAsync(User user)
        {
            await _context.Users.AddAsync(user);
        }

        public void Update(User user)
        {
            _context.Users.Update(user);
        }

        public void Delete(User user)
        {
            _context.Users.Remove(user);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
