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
    public class UserController : ControllerBase
    {
        #region Dependency Injection

        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        #endregion

        #region Get All Users

        [HttpGet]
        //[Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllUsers(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] int? userTypeId = null)
        {
            var response = await _userService.GetAllUsersAsync(pageNumber, pageSize, userTypeId);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        #endregion

        #region Get User By Id

        [HttpGet("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUserById([FromRoute] int id)
        {
            var response = await _userService.GetUserByIdAsync(id);

            if (!response.Success)
                return NotFound(response);

            return Ok(response);
        }

        #endregion

        #region Create User

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateUser([FromBody] UserDTO dto)
        {
            var response = await _userService.CreateUserAsync(dto);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        #endregion

        #region Update User

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUser([FromRoute] int id, [FromBody] UserDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var response = await _userService.UpdateUserAsync(id, dto);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        #endregion

        #region Delete User

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser([FromRoute] int id)
        {
            var response = await _userService.DeleteUserAsync(id);

            if (!response.Success)
                return NotFound(response);

            return Ok(response);
        }

        #endregion
    }
}
