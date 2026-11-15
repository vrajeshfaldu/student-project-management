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
    public class UserRoleController : ControllerBase
    {
        #region Dependency Injection

        private readonly IUserRoleService _userRoleService;

        public UserRoleController(IUserRoleService userRoleService)
        {
            _userRoleService = userRoleService;
        }

        #endregion


        #region Get All User Roles

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllUserRoles([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var response = await _userRoleService.GetAllUserRolesAsync(pageNumber, pageSize);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        #endregion


        #region Get User Role By Id

        [HttpGet("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUserRoleById([FromRoute] int id)
        {
            var response = await _userRoleService.GetUserRoleByIdAsync(id);

            if (!response.Success)
                return NotFound(response);

            return Ok(response);
        }

        #endregion


        #region Create User Role

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateUserRole([FromBody] UserRoleDTO dto)
        {
            var response = await _userRoleService.CreateUserRoleAsync(dto);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        #endregion


        #region Update User Role

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUserRole(
            [FromRoute] int id,
            [FromBody] UserRoleDTO dto)
        {
            var response = await _userRoleService.UpdateUserRoleAsync(id, dto);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        #endregion


        #region Delete User Role

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUserRole([FromRoute] int id)
        {
            var response = await _userRoleService.DeleteUserRoleAsync(id);

            if (!response.Success)
                return NotFound(response);

            return Ok(response);
        }

        #endregion
    }
}
