using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Student_Project_Management.DTOs;
using Student_Project_Management.Services.Interfaces;
using System.Data;

namespace Student_Project_Management.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    //[Authorize]
    public class TaskStatusController : ControllerBase
    {
        #region Dependency Injection

        private readonly ITaskStatusService _taskStatusService;

        public TaskStatusController(ITaskStatusService taskStatusService)
        {
            _taskStatusService = taskStatusService;
        }

        #endregion


        #region Get All Task Statuses

        [HttpGet]
        [Authorize(Roles = "Admin,Faculty,Student")]
        public async Task<IActionResult> GetAllTaskStatuses([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var response = await _taskStatusService.GetAllTaskStatusesAsync(pageNumber, pageSize);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        #endregion


        #region Get Task Status By Id

        [HttpGet("{id:int}")]
        [Authorize(Roles = "Admin,Faculty,Student")]
        public async Task<IActionResult> GetTaskStatusById([FromRoute] int id)
        {
            var response = await _taskStatusService.GetTaskStatusByIdAsync(id);

            if (!response.Success)
                return NotFound(response);

            return Ok(response);
        }

        #endregion


        #region Create Task Status

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateTaskStatus([FromBody] TaskStatusDTO dto)
        {
            var response = await _taskStatusService.CreateTaskStatusAsync(dto);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        #endregion


        #region Update Task Status

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateTaskStatus(
            [FromRoute] int id,
            [FromBody] TaskStatusDTO dto)
        {
            var response = await _taskStatusService.UpdateTaskStatusAsync(id, dto);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        #endregion


        #region Delete Task Status

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteTaskStatus([FromRoute] int id)
        {
            var response = await _taskStatusService.DeleteTaskStatusAsync(id);

            if (!response.Success)
                return NotFound(response);

            return Ok(response);
        }

        #endregion
    }
}
