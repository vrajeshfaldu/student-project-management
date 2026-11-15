using Microsoft.AspNetCore.Mvc;
using Student_Project_Management.Services.Interfaces;

namespace Student_Project_Management.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        #region Dependency Injection

        private readonly IDashboardService _dashboardService;

        public DashboardController(
            IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        #endregion


        #region 1. Total Students

        [HttpGet]
        public async Task<IActionResult> GetTotalStudents()
        {
            var response = await _dashboardService
                .GetTotalStudentsAsync();

            return Ok(response);
        }

        #endregion


        #region 2. Total Faculty

        [HttpGet]
        public async Task<IActionResult> GetTotalFaculty()
        {
            var response = await _dashboardService
                .GetTotalFacultyAsync();

            return Ok(response);
        }

        #endregion


        #region 3. Total Projects

        [HttpGet]
        public async Task<IActionResult> GetTotalProjects()
        {
            var response = await _dashboardService
                .GetTotalProjectsAsync();

            return Ok(response);
        }

        #endregion


        #region 4. Task Status Summary

        [HttpGet]
        public async Task<IActionResult> GetTaskStatusSummary()
        {
            var response = await _dashboardService
                .GetTaskStatusSummaryAsync();

            return Ok(response);
        }

        #endregion


        #region 5. Priority Wise Task Count

        [HttpGet]
        public async Task<IActionResult> GetPrioritySummary()
        {
            var response = await _dashboardService
                .GetPrioritySummaryAsync();

            return Ok(response);
        }

        #endregion


        #region 6. Faculty Workload

        [HttpGet]
        public async Task<IActionResult> GetFacultyWorkload()
        {
            var response = await _dashboardService
                .GetFacultyWorkloadAsync();

            return Ok(response);
        }

        #endregion


        #region 7. Student Task Count

        [HttpGet]
        public async Task<IActionResult> GetStudentTasks()
        {
            var response = await _dashboardService
                .GetStudentTasksAsync();

            return Ok(response);
        }

        #endregion


        #region 8. Top 10 Students

        [HttpGet]
        public async Task<IActionResult> GetTopStudents()
        {
            var response = await _dashboardService
                .GetTopStudentsAsync();

            return Ok(response);
        }

        #endregion


        #region 9. Bottom 10 Students

        [HttpGet]
        public async Task<IActionResult> GetBottomStudents()
        {
            var response = await _dashboardService
                .GetBottomStudentsAsync();

            return Ok(response);
        }

        #endregion


        #region 10. Overdue Tasks

        [HttpGet]
        public async Task<IActionResult> GetOverdueTasks()
        {
            var response = await _dashboardService
                .GetOverdueTasksAsync();

            return Ok(response);
        }

        #endregion


        #region 11. Upcoming Follow Ups

        [HttpGet]
        public async Task<IActionResult> GetUpcomingFollowUps()
        {
            var response = await _dashboardService
                .GetUpcomingFollowUpsAsync();

            return Ok(response);
        }

        #endregion


        #region 12. Grade Distribution

        [HttpGet]
        public async Task<IActionResult> GetGradeDistribution()
        {
            var response = await _dashboardService
                .GetGradeDistributionAsync();

            return Ok(response);
        }

        #endregion


        #region 13. Monthly Completed Tasks

        [HttpGet]
        public async Task<IActionResult> GetMonthlyCompletedTasks()
        {
            var response = await _dashboardService
                .GetMonthlyCompletedTasksAsync();

            return Ok(response);
        }

        #endregion


        #region 14. Active Users By Role

        [HttpGet]
        public async Task<IActionResult> GetActiveUsersByRole()
        {
            var response = await _dashboardService
                .GetActiveUsersByRoleAsync();

            return Ok(response);
        }

        #endregion


        #region 15. Users By Role

        [HttpGet]
        public async Task<IActionResult> GetUsersByRole()
        {
            var response = await _dashboardService
                .GetUsersByRoleAsync();

            return Ok(response);
        }

        #endregion


        #region 16. Roles Having More Than 10 Users

        [HttpGet]
        public async Task<IActionResult> GetRolesMoreThan10Users()
        {
            var response = await _dashboardService
                .GetRolesMoreThan10UsersAsync();

            return Ok(response);
        }

        #endregion


        #region 17. Role Statistics

        [HttpGet]
        public async Task<IActionResult> GetRoleStatistics()
        {
            var response = await _dashboardService
                .GetRoleStatisticsAsync();

            return Ok(response);
        }

        #endregion


        #region 18. Tasks Due Next 7 Days

        [HttpGet]
        public async Task<IActionResult> GetTasksDueNext7Days()
        {
            var response = await _dashboardService
                .GetTasksDueNext7DaysAsync();

            return Ok(response);
        }

        #endregion


        #region 19. Project Task Summary

        [HttpGet]
        public async Task<IActionResult> GetProjectTaskSummary()
        {
            var response = await _dashboardService
                .GetProjectTaskSummaryAsync();

            return Ok(response);
        }

        #endregion


        #region 20. Project Score Summary

        [HttpGet]
        public async Task<IActionResult> GetProjectScoreSummary()
        {
            var response = await _dashboardService
                .GetProjectScoreSummaryAsync();

            return Ok(response);
        }

        #endregion


        #region 21. Top 10 Projects

        [HttpGet]
        public async Task<IActionResult> GetTopProjects()
        {
            var response = await _dashboardService
                .GetTopProjectsAsync();

            return Ok(response);
        }

        #endregion


        #region 22. Faculty Statistics

        [HttpGet]
        public async Task<IActionResult> GetFacultyStatistics()
        {
            var response = await _dashboardService
                .GetFacultyStatisticsAsync();

            return Ok(response);
        }

        #endregion


        #region 23. Student Statistics

        [HttpGet]
        public async Task<IActionResult> GetStudentStatistics()
        {
            var response = await _dashboardService
                .GetStudentStatisticsAsync();

            return Ok(response);
        }

        #endregion


        #region 24. Overdue Projects

        [HttpGet]
        public async Task<IActionResult> GetOverdueProjects()
        {
            var response = await _dashboardService
                .GetOverdueProjectsAsync();

            return Ok(response);
        }

        #endregion


        #region 25. Completed Tasks By Month

        [HttpGet]
        public async Task<IActionResult> GetCompletedTasksByMonth()
        {
            var response = await _dashboardService
                .GetCompletedTasksByMonthAsync();

            return Ok(response);
        }

        #endregion


        #region 26. Faculty Ranking

        [HttpGet]
        public async Task<IActionResult> GetFacultyRanking()
        {
            var response = await _dashboardService
                .GetFacultyRankingAsync();

            return Ok(response);
        }

        #endregion


        #region 27. Project Task Statistics

        [HttpGet]
        public async Task<IActionResult> GetProjectTaskStatistics()
        {
            var response = await _dashboardService
                .GetProjectTaskStatisticsAsync();

            return Ok(response);
        }

        #endregion
    }
}