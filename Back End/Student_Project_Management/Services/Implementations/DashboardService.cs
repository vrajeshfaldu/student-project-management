using Microsoft.EntityFrameworkCore;
using Student_Project_Management.Data;
using Student_Project_Management.Services.Interfaces;

namespace Student_Project_Management.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly AppDbContext _context;

        public DashboardService(AppDbContext context)
        {
            _context = context;
        }
        //1
        public async Task<object> GetTotalStudentsAsync()
        {
            var totalStudents = await _context.Users
                .CountAsync(x => x.UserType.UserTypeName == "Student");

            return new
            {
                TotalStudents = totalStudents
            };
        }
        //2
        public async Task<object> GetTotalFacultyAsync()
        {
            var totalFaculty = await _context.Users
                .CountAsync(x => x.UserType.UserTypeName == "Faculty");

            return new
            {
                TotalFaculty = totalFaculty
            };
        }

        //3
        public async Task<object> GetTotalProjectsAsync()
        {
            var totalProjects = await _context.ProjectMasters
                .CountAsync();

            return new
            {
                TotalProjects = totalProjects
            };
        }
        //4
        public async Task<object> GetTaskStatusSummaryAsync()
        {
            var result = await _context.Tasks
                .GroupBy(x => x.TaskStatus.TaskStatusName)
                .Select(g => new
                {
                    TaskStatus = g.Key,
                    TotalTasks = g.Count()
                })
                .ToListAsync();

            return result;
        }

        //5
        public async Task<object> GetPrioritySummaryAsync()
        {
            var result = await _context.Tasks
                .GroupBy(x => x.TaskPriority.TaskPriorityName)
                .Select(g => new
                {
                    Priority = g.Key,
                    TotalTasks = g.Count()
                })
                .ToListAsync();

            return result;
        }

        //6
        public async Task<object> GetFacultyWorkloadAsync()
        {
            var result = await _context.ProjectAllocations
                .GroupBy(x => x.Faculty.FullName)
                .Select(g => new
                {
                    FacultyName = g.Key,
                    TotalProjects = g.Count()
                })
                .OrderByDescending(x => x.TotalProjects)
                .ToListAsync();

            return result;
        }

        //7
        public async Task<object> GetStudentTasksAsync()
        {
            var result = await _context.Tasks
                .GroupBy(x => x.ProjectAllocation.Student.FullName)
                .Select(g => new
                {
                    StudentName = g.Key,
                    TotalTasks = g.Count()
                })
                .OrderByDescending(x => x.TotalTasks)
                .ToListAsync();

            return result;
        }

        //8
        public async Task<object> GetTopStudentsAsync()
        {
            var result = await _context.Tasks
                .Where(x => x.EarnedScore != null)
                .GroupBy(x => x.ProjectAllocation.Student.FullName)
                .Select(g => new
                {
                    StudentName = g.Key,
                    AverageScore = g.Average(x => x.EarnedScore)
                })
                .OrderByDescending(x => x.AverageScore)
                .Take(10)
                .ToListAsync();

            return result;
        }

        //9
        public async Task<object> GetBottomStudentsAsync()
        {
            var result = await _context.Tasks
                .Where(x => x.EarnedScore != null)
                .GroupBy(x => x.ProjectAllocation.Student.FullName)
                .Select(g => new
                {
                    StudentName = g.Key,
                    AverageScore = g.Average(x => x.EarnedScore)
                })
                .OrderBy(x => x.AverageScore)
                .Take(10)
                .ToListAsync();

            return result;
        }

        //10
        public async Task<object> GetOverdueTasksAsync()
        {
            var result = await _context.Tasks
                .Where(x =>
                    x.TaskDueDate < DateTime.Now &&
                    x.TaskStatus.TaskStatusName != "Completed")
                .Select(x => new
                {
                    x.TaskTitle,
                    Student = x.ProjectAllocation.Student.FullName,
                    Faculty = x.ProjectAllocation.Faculty.FullName,
                    x.TaskDueDate,
                    DaysOverdue = EF.Functions.DateDiffDay(
                        x.TaskDueDate,
                        DateTime.Now)
                })
                .ToListAsync();

            return result;
        }

        //11
        public async Task<object> GetUpcomingFollowUpsAsync()
        {
            var result = await _context.Tasks
                .Where(x =>
                    x.NextFollowUpDate >= DateTime.Today &&
                    x.NextFollowUpDate <= DateTime.Today.AddDays(7))
                .Select(x => new
                {
                    x.TaskTitle,
                    Student = x.ProjectAllocation.Student.FullName,
                    Faculty = x.ProjectAllocation.Faculty.FullName,
                    x.NextFollowUpDate
                })
                .ToListAsync();

            return result;
        }
        //12
        public async Task<object> GetGradeDistributionAsync()
        {
            var result = await _context.ProjectAllocations
                .GroupBy(x => x.OverAllGrade)
                .Select(g => new
                {
                    Grade = g.Key,
                    Students = g.Count()
                })
                .OrderBy(x => x.Grade)
                .ToListAsync();

            return result;
        }
        //13
        public async Task<object> GetMonthlyCompletedTasksAsync()
        {
            var result = await _context.Tasks
                .Where(x => x.TaskCompletedDate != null)
                .GroupBy(x => new
                {
                    Year = x.TaskCompletedDate.Value.Year,
                    Month = x.TaskCompletedDate.Value.Month
                })
                .Select(g => new
                {
                    g.Key.Year,
                    g.Key.Month,
                    CompletedTasks = g.Count()
                })
                .OrderBy(x => x.Year)
                .ThenBy(x => x.Month)
                .ToListAsync();

            return result;
        }
        //14
        public async Task<object> GetActiveUsersByRoleAsync()
        {
            var result = await _context.UserRoles
                .Where(x => x.User.IsActive)
                .GroupBy(x => x.Role.RoleName)
                .Select(g => new
                {
                    RoleName = g.Key,
                    ActiveUsers = g.Count()
                })
                .OrderByDescending(x => x.ActiveUsers)
                .ToListAsync();

            return result;
        }
        //15
        public async Task<object> GetUsersByRoleAsync()
        {
            var result = await _context.UserRoles
                .GroupBy(x => x.Role.RoleName)
                .Select(g => new
                {
                    RoleName = g.Key,
                    Users = g.Select(x => x.User.FullName).ToList()
                })
                .ToListAsync();

            return result;
        }
        //16
        public async Task<object> GetRolesMoreThan10UsersAsync()
        {
            var result = await _context.UserRoles
                .GroupBy(x => x.Role.RoleName)
                .Select(g => new
                {
                    RoleName = g.Key,
                    TotalUsers = g.Count()
                })
                .Where(x => x.TotalUsers > 10)
                .ToListAsync();

            return result;
        }
        //17
        public async Task<object> GetRoleStatisticsAsync()
        {
            var result = await _context.UserRoles
                .GroupBy(x => x.Role.RoleName)
                .Select(g => new
                {
                    RoleName = g.Key,
                    TotalUsers = g.Count(),
                    ActiveUsers = g.Count(x => x.User.IsActive),
                    InactiveUsers = g.Count(x => !x.User.IsActive)
                })
                .OrderByDescending(x => x.TotalUsers)
                .ToListAsync();

            return result;
        }
        //18
        public async Task<object> GetTasksDueNext7DaysAsync()
        {
            var result = await _context.Tasks
                .Where(x =>
                    x.TaskDueDate >= DateTime.Today &&
                    x.TaskDueDate <= DateTime.Today.AddDays(7))
                .Select(x => new
                {
                    x.TaskTitle,
                    x.TaskDueDate,
                    Project = x.ProjectAllocation.Project.ProjectTitle,
                    Student = x.ProjectAllocation.Student.FullName,
                    RemainingDays = EF.Functions.DateDiffDay(
                        DateTime.Today,
                        x.TaskDueDate)
                })
                .OrderBy(x => x.TaskDueDate)
                .ToListAsync();

            return result;
        }
        //19
        public async Task<object> GetProjectTaskSummaryAsync()
        {
            var result = await _context.Tasks
                .GroupBy(x => x.ProjectAllocation.Project.ProjectTitle)
                .Select(g => new
                {
                    Project = g.Key,
                    TotalTasks = g.Count(),

                    CompletedTasks = g.Count(
                        x => x.TaskStatus.TaskStatusName == "Completed"),

                    PendingTasks = g.Count(
                        x => x.TaskStatus.TaskStatusName == "Pending"),

                    AverageProgress = g.Average(
                        x => x.ProgressPercentage)
                })
                .ToListAsync();

            return result;
        }
        //20
        public async Task<object> GetProjectScoreSummaryAsync()
        {
            var result = await _context.Tasks
                .GroupBy(x => x.ProjectAllocation.Project.ProjectTitle)
                .Select(g => new
                {
                    Project = g.Key,

                    TotalAssignedScore = g.Sum(x => x.AssignedScore),

                    TotalEarnedScore = g.Sum(x => x.EarnedScore),

                    ScorePercentage =
                        g.Sum(x => x.AssignedScore) == 0
                            ? 0
                            : (g.Sum(x => x.EarnedScore) /
                               g.Sum(x => x.AssignedScore)) * 100
                })
                .ToListAsync();

            return result;
        }
        //21
        public async Task<object> GetTopProjectsAsync()
        {
            var result = await _context.Tasks
                .Where(x => x.EarnedScore != null)
                .GroupBy(x => x.ProjectAllocation.Project.ProjectTitle)
                .Select(g => new
                {
                    Project = g.Key,
                    AverageScore = g.Average(x => x.EarnedScore)
                })
                .OrderByDescending(x => x.AverageScore)
                .Take(10)
                .ToListAsync();

            return result;
        }
        //22
        public async Task<object> GetFacultyStatisticsAsync()
        {
            var result = await _context.ProjectAllocations
                .GroupBy(x => x.Faculty.FullName)
                .Select(g => new
                {
                    Faculty = g.Key,
                    TotalProjects = g.Count(),
                    TotalTasks = g.Sum(x => x.TotalTasksGiven),
                    AverageProgress = g.Average(x => x.ProgressPercentage)
                })
                .ToListAsync();

            return result;
        }
        //23
        public async Task<object> GetStudentStatisticsAsync()
        {
            var result = await _context.Tasks
                .GroupBy(x => x.ProjectAllocation.Student.FullName)
                .Select(g => new
                {
                    Student = g.Key,

                    TotalTasks = g.Count(),

                    CompletedTasks = g.Count(
                        x => x.TaskStatus.TaskStatusName == "Completed"),

                    PendingTasks = g.Count(
                        x => x.TaskStatus.TaskStatusName == "Pending"),

                    AverageScore = g.Average(x => x.EarnedScore)
                })
                .ToListAsync();

            return result;
        }
        //24
        public async Task<object> GetOverdueProjectsAsync()
        {
            var result = await _context.ProjectAllocations
                .Where(x =>
                    x.ProjectEndDate < DateTime.Now &&
                    x.ProgressPercentage < 100)
                .Select(x => new
                {
                    Project = x.Project.ProjectTitle,
                    Student = x.Student.FullName,
                    Faculty = x.Faculty.FullName,
                    x.ProjectEndDate,
                    x.ProgressPercentage
                })
                .ToListAsync();

            return result;
        }
        //25
        public async Task<object> GetCompletedTasksByMonthAsync()
        {
            var result = await _context.Tasks
                .Where(x => x.TaskCompletedDate != null)
                .GroupBy(x => new
                {
                    Year = x.TaskCompletedDate.Value.Year,
                    Month = x.TaskCompletedDate.Value.Month
                })
                .Select(g => new
                {
                    g.Key.Year,
                    g.Key.Month,
                    CompletedTasks = g.Count()
                })
                .OrderBy(x => x.Year)
                .ThenBy(x => x.Month)
                .ToListAsync();

            return result;
        }
        //26
        public async Task<object> GetFacultyRankingAsync()
        {
            var result = await _context.ProjectAllocations
                .GroupBy(x => x.Faculty.FullName)
                .Select(g => new
                {
                    Faculty = g.Key,
                    AverageProgress = g.Average(x => x.ProgressPercentage)
                })
                .OrderByDescending(x => x.AverageProgress)
                .ToListAsync();

            return result
                .Select((x, index) => new
                {
                    Rank = index + 1,
                    x.Faculty,
                    x.AverageProgress
                })
                .ToList();
        }
        //27
        public async Task<object> GetProjectTaskStatisticsAsync()
        {
            var result = await _context.Tasks
                .GroupBy(x => x.ProjectAllocation.Project.ProjectTitle)
                .Select(g => new
                {
                    Project = g.Key,

                    TotalTasks = g.Count(),

                    CompletedTasks = g.Count(
                        x => x.TaskStatus.TaskStatusName == "Completed"),

                    PendingTasks = g.Count(
                        x => x.TaskStatus.TaskStatusName == "Pending"),

                    OverdueTasks = g.Count(x =>
                        x.TaskDueDate < DateTime.Now &&
                        x.TaskStatus.TaskStatusName != "Completed")
                })
                .ToListAsync();

            return result;
        }


    }
}