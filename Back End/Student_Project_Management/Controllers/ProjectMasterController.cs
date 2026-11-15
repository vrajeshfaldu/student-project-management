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
    public class ProjectMasterController : ControllerBase
    {
        #region Dependency Injection

        private readonly IProjectMasterService _projectService;

        public ProjectMasterController(IProjectMasterService projectService)
        {
            _projectService = projectService;
        }

        #endregion


        #region Get All Projects

        [HttpGet]
        [Authorize(Roles = "Admin,Faculty,Student")]
        public async Task<IActionResult> GetAllProjects([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var response = await _projectService.GetAllProjectsAsync(pageNumber, pageSize);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        #endregion


        #region Get Project By Id

        [HttpGet("{id:int}")]
        [Authorize(Roles = "Admin,Faculty,Student")]
        public async Task<IActionResult> GetProjectById([FromRoute] int id)
        {
            var response = await _projectService.GetProjectByIdAsync(id);

            if (!response.Success)
                return NotFound(response);

            return Ok(response);
        }

        #endregion


        #region Create Project

        [HttpPost]
        [Authorize(Roles = "Admin,Faculty")]
        public async Task<IActionResult> CreateProject(
            [FromBody] ProjectMasterDTO dto)
        {
            var response = await _projectService.CreateProjectAsync(dto);

            if (!response.Success)
                return BadRequest(response);


            return Ok(response);
        }

        #endregion


        #region Update Project

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin,Faculty")]
        public async Task<IActionResult> UpdateProject(
            [FromRoute] int id,
            [FromBody] ProjectMasterDTO dto)
        {
            var response = await _projectService.UpdateProjectAsync(id, dto);

            if (!response.Success)
                return BadRequest(response);


            return Ok(response);
        }

        #endregion


        #region Delete Project

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteProject([FromRoute] int id)
        {
            var response = await _projectService.DeleteProjectAsync(id);

            if (!response.Success)
                return NotFound(response);


            return Ok(response);
        }

        #endregion
    }
}
