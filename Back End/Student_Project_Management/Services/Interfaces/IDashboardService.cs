namespace Student_Project_Management.Services.Interfaces
{
    public interface IDashboardService
    {
        Task<object> GetTotalStudentsAsync();

        Task<object> GetTotalFacultyAsync();

        Task<object> GetTotalProjectsAsync();

        Task<object> GetTaskStatusSummaryAsync();

        Task<object> GetPrioritySummaryAsync();

        Task<object> GetFacultyWorkloadAsync();

        Task<object> GetStudentTasksAsync();

        Task<object> GetTopStudentsAsync();

        Task<object> GetBottomStudentsAsync();

        Task<object> GetOverdueTasksAsync();

        Task<object> GetUpcomingFollowUpsAsync();

        Task<object> GetGradeDistributionAsync();

        Task<object> GetMonthlyCompletedTasksAsync();

        Task<object> GetActiveUsersByRoleAsync();

        Task<object> GetUsersByRoleAsync();

        Task<object> GetRolesMoreThan10UsersAsync();

        Task<object> GetRoleStatisticsAsync();

        Task<object> GetTasksDueNext7DaysAsync();

        Task<object> GetProjectTaskSummaryAsync();

        Task<object> GetProjectScoreSummaryAsync();

        Task<object> GetTopProjectsAsync();

        Task<object> GetFacultyStatisticsAsync();

        Task<object> GetStudentStatisticsAsync();

        Task<object> GetOverdueProjectsAsync();

        Task<object> GetCompletedTasksByMonthAsync();

        Task<object> GetFacultyRankingAsync();

        Task<object> GetProjectTaskStatisticsAsync();
    }
}