using Microsoft.EntityFrameworkCore;
using Student_Project_Management.Models;

namespace Student_Project_Management.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Role> Roles => Set<Role>();
        public DbSet<UserType> UserTypes => Set<UserType>();
        public DbSet<User> Users => Set<User>();
        public DbSet<UserRole> UserRoles => Set<UserRole>();
        public DbSet<Models.TaskStatus> TaskStatuses => base.Set<Models.TaskStatus>();
        public DbSet<TaskPriority> TaskPriorities => Set<TaskPriority>();
        public DbSet<ProjectMaster> ProjectMasters => Set<ProjectMaster>();
        public DbSet<ProjectAllocation> ProjectAllocations => Set<ProjectAllocation>();
        public DbSet<Models.Task> Tasks => base.Set<Models.Task>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

           
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<ProjectAllocation>()
                .Property(p => p.ProgressPercentage)
                .HasPrecision(5, 2);

            modelBuilder.Entity<Models.Task>()
                .Property(t => t.AssignedScore)
                .HasPrecision(5, 2);

            modelBuilder.Entity<Models.Task>()
                .Property(t => t.EarnedScore)
                .HasPrecision(5, 2);

            modelBuilder.Entity<Models.Task>()
                .Property(t => t.ProgressPercentage)
                .HasPrecision(5, 2);

            // Default Value
            modelBuilder.Entity<ProjectAllocation>()
                .Property(p => p.AssignedDate)
                .HasDefaultValueSql("GETDATE()");

            // User -> UserType
            modelBuilder.Entity<User>()
                .HasOne(u => u.UserType)
                .WithMany(ut => ut.Users)
                .HasForeignKey(u => u.UserTypeID)
                .OnDelete(DeleteBehavior.Restrict);

            // UserRole -> User
            modelBuilder.Entity<UserRole>()
                .HasOne(ur => ur.User)
                .WithMany(u => u.UserRoles)
                .HasForeignKey(ur => ur.UserID)
                .OnDelete(DeleteBehavior.Restrict);

            // UserRole -> Role
            modelBuilder.Entity<UserRole>()
                .HasOne(ur => ur.Role)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(ur => ur.RoleID)
                .OnDelete(DeleteBehavior.Restrict);

            // ProjectAllocation -> ProjectMaster
            modelBuilder.Entity<ProjectAllocation>()
                .HasOne(pa => pa.Project)
                .WithMany(pm => pm.ProjectAllocations)
                .HasForeignKey(pa => pa.ProjectID)
                .OnDelete(DeleteBehavior.Restrict);

            // ProjectAllocation -> Student(User)
            modelBuilder.Entity<ProjectAllocation>()
                .HasOne(pa => pa.Student)
                .WithMany(u => u.StudentProjectAllocations)
                .HasForeignKey(pa => pa.StudentID)
                .OnDelete(DeleteBehavior.Restrict);

            // ProjectAllocation -> Faculty(User)
            modelBuilder.Entity<ProjectAllocation>()
                .HasOne(pa => pa.Faculty)
                .WithMany(u => u.FacultyProjectAllocations)
                .HasForeignKey(pa => pa.FacultyID)
                .OnDelete(DeleteBehavior.Restrict);

            // Task -> ProjectAllocation
            modelBuilder.Entity<Models.Task>()
                .HasOne(t => t.ProjectAllocation)
                .WithMany(pa => pa.Tasks)
                .HasForeignKey(t => t.ProjectAllocationID)
                .OnDelete(DeleteBehavior.Restrict);

            // Task -> TaskStatus
            modelBuilder.Entity<Models.Task>()
                .HasOne(t => t.TaskStatus)
                .WithMany(ts => ts.Tasks)
                .HasForeignKey(t => t.TaskStatusID)
                .OnDelete(DeleteBehavior.Restrict);

            // Task -> TaskPriority
            modelBuilder.Entity<Models.Task>()
                .HasOne(t => t.TaskPriority)
                .WithMany(tp => tp.Tasks)
                .HasForeignKey(t => t.TaskPriorityID)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}