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
    public class TaskController : ControllerBase
    {
        #region Dependency Injection

        private readonly ITaskService _taskService;

        public TaskController(ITaskService taskService)
        {
            _taskService = taskService;
        }

        #endregion


        #region Get All Tasks

        [HttpGet]
        [Authorize(Roles = "Admin,Faculty,Student")]
        public async Task<IActionResult> GetAllTasks([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var response = await _taskService.GetAllTasksAsync(pageNumber, pageSize);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        #endregion


        #region Get Task By Id

        [HttpGet("{id:int}")]
        [Authorize(Roles = "Admin,Faculty,Student")]
        public async Task<IActionResult> GetTaskById([FromRoute] int id)
        {
            var response = await _taskService.GetTaskByIdAsync(id);

            if (!response.Success)
                return NotFound(response);

            return Ok(response);
        }

        #endregion


        #region Create Task

        [HttpPost]
        [Authorize(Roles = "Admin,Faculty")]
        public async Task<IActionResult> CreateTask(
            [FromBody] TaskDTO dto)
        {
            var response = await _taskService.CreateTaskAsync(dto);


            if (!response.Success)
                return BadRequest(response);


            return Ok(response);
        }

        #endregion


        #region Update Task

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin,Faculty,Student")]
        public async Task<IActionResult> UpdateTask(
            [FromRoute] int id,
            [FromBody] TaskDTO dto)
        {
            var response = await _taskService.UpdateTaskAsync(id, dto);


            if (!response.Success)
                return BadRequest(response);


            return Ok(response);
        }

        #endregion


        #region Delete Task

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin,Faculty")]
        public async Task<IActionResult> DeleteTask([FromRoute] int id)
        {
            var response = await _taskService.DeleteTaskAsync(id);


            if (!response.Success)
                return NotFound(response);


            return Ok(response);
        }

        #endregion

    }
}
