using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Student_Project_Management.Data;
using Student_Project_Management.DTOs;
using Student_Project_Management.Models;
using Student_Project_Management.Services.Interfaces;
using System.Data;

namespace Student_Project_Management.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    //[Authorize]
    public class TaskPriorityController : ControllerBase
    {
        #region Dependency Injection

        private readonly ITaskPriorityService _taskPriorityService;

        public TaskPriorityController(ITaskPriorityService taskPriorityService)
        {
            _taskPriorityService = taskPriorityService;
        }

        #endregion


        #region Get All Task Priorities

        [HttpGet]
        [Authorize(Roles = "Admin,Faculty,Student")]
        public async Task<IActionResult> GetAllTaskPriorities([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var response = await _taskPriorityService.GetAllTaskPrioritiesAsync(pageNumber, pageSize);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        #endregion


        #region Get Task Priority By Id

        [HttpGet("{id:int}")]
        [Authorize(Roles = "Admin,Faculty,Student")]
        public async Task<IActionResult> GetTaskPriorityById([FromRoute] int id)
        {
            var response = await _taskPriorityService.GetTaskPriorityByIdAsync(id);

            if (!response.Success)
                return NotFound(response);

            return Ok(response);
        }

        #endregion


        #region Create Task Priority

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateTaskPriority(
            [FromBody] TaskPriorityDTO dto)
        {
            var response = await _taskPriorityService.CreateTaskPriorityAsync(dto);

            if (!response.Success)
                return BadRequest(response);


            return Ok(response);
        }

        #endregion


        #region Update Task Priority

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateTaskPriority(
            [FromRoute] int id,
            [FromBody] TaskPriorityDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);


            var response = await _taskPriorityService.UpdateTaskPriorityAsync(id, dto);

            if (!response.Success)
                return BadRequest(response);


            return Ok(response);
        }

        #endregion


        #region Delete Task Priority

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteTaskPriority([FromRoute] int id)
        {
            var response = await _taskPriorityService.DeleteTaskPriorityAsync(id);

            if (!response.Success)
                return NotFound(response);


            return Ok(response);
        }

        #endregion
    }
}
