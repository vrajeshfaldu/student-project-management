using Microsoft.AspNetCore.Authorization;

using Microsoft.AspNetCore.Mvc;
using Student_Project_Management.DTOs;
using Student_Project_Management.Services.Interfaces;


namespace Student_Project_Management.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    //[Authorize]
    public class RoleController : ControllerBase
    {
        #region Dependency Injection

        private readonly IRoleService _roleService;

        public RoleController(IRoleService roleService)
        {
            _roleService = roleService;
        }

        #endregion

        #region Get All Roles

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllRoles([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var response = await _roleService.GetAllRolesAsync(pageNumber, pageSize);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        #endregion

        #region Get Role By Id

        [HttpGet("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetRoleById([FromRoute] int id)
        {
            var response = await _roleService.GetRoleByIdAsync(id);

            if (!response.Success)
                return NotFound(response);

            return Ok(response);
        }

        #endregion

        #region Create Role

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateRole([FromBody] RoleDTO roleDTO)
        {
            var response = await _roleService.CreateRoleAsync(roleDTO);

            if (!response.Success)
                return BadRequest(response);

            return CreatedAtAction(
                nameof(GetRoleById),
                new { id = response.Data!.RoleID },
                response);
        }

        #endregion

        #region Update Role

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateRole([FromRoute] int id, [FromBody] RoleDTO roleDTO)
        {
            var response = await _roleService.UpdateRoleAsync(id, roleDTO);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        #endregion

        #region Delete Role

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteRole([FromRoute] int id)
        {
            var response = await _roleService.DeleteRoleAsync(id);

            if (!response.Success)
                return NotFound(response);

            return Ok(response);
        }

        #endregion 
    }
}
