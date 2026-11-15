
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Student_Project_Management.Data;
using Student_Project_Management.DTOs;
using Student_Project_Management.Models;
using Student_Project_Management.Services.Interfaces;

namespace Student_Project_Management.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    //[Authorize]
    public class ProjectAllocationController : ControllerBase
    {
        #region Dependency Injection

        private readonly IProjectAllocationService _projectAllocationService;

        public ProjectAllocationController(
            IProjectAllocationService projectAllocationService)
        {
            _projectAllocationService = projectAllocationService;
        }

        #endregion


        #region Get All Project Allocations

        [HttpGet]
        [Authorize(Roles = "Admin,Faculty,Student")]
        public async Task<IActionResult> GetAllProjectAllocations([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var response = await _projectAllocationService
                .GetAllProjectAllocationsAsync(pageNumber, pageSize);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        #endregion


        #region Get Project Allocation By Id

        [HttpGet("{id:int}")]
        [Authorize(Roles = "Admin,Faculty,Student")]
        public async Task<IActionResult> GetProjectAllocationById([FromRoute] int id)
        {
            var response = await _projectAllocationService
                .GetProjectAllocationByIdAsync(id);

            if (!response.Success)
                return NotFound(response);

            return Ok(response);
        }

        #endregion


        #region Create Project Allocation

        [HttpPost]
        [Authorize(Roles = "Admin,Faculty")]
        public async Task<IActionResult> CreateProjectAllocation(
            [FromBody] ProjectAllocationDTO dto)
        {
            var response = await _projectAllocationService
                .CreateProjectAllocationAsync(dto);


            if (!response.Success)
                return BadRequest(response);


            return Ok(response);
        }

        #endregion


        #region Update Project Allocation

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin,Faculty")]
        public async Task<IActionResult> UpdateProjectAllocation(
            [FromRoute] int id,
            [FromBody] ProjectAllocationDTO dto)
        {
            var response = await _projectAllocationService
                .UpdateProjectAllocationAsync(id, dto);


            if (!response.Success)
                return BadRequest(response);


            return Ok(response);
        }

        #endregion


        #region Delete Project Allocation

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteProjectAllocation([FromRoute] int id)
        {
            var response = await _projectAllocationService
                .DeleteProjectAllocationAsync(id);


            if (!response.Success)
                return NotFound(response);


            return Ok(response);
        }

        #endregion 
    }
}
