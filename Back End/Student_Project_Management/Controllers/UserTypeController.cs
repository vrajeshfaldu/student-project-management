using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Student_Project_Management.DTOs;
using Student_Project_Management.Services.Interfaces;


namespace Student_Project_Management.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    //[Authorize]
    public class UserTypeController : ControllerBase
    {
        #region Dependency Injection

        private readonly IUserTypeService _userTypeService;

        public UserTypeController(IUserTypeService userTypeService)
        {
            _userTypeService = userTypeService;
        }

        #endregion

        #region Get All UserTypes

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllUserTypes([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var response = await _userTypeService.GetAllUserTypesAsync(pageNumber, pageSize);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        #endregion

        #region Get UserType By Id

        [HttpGet("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUserTypeById([FromRoute] int id)
        {
            var response = await _userTypeService.GetUserTypeByIdAsync(id);

            if (!response.Success)
                return NotFound(response);

            return Ok(response);
        }

        #endregion

        #region Create UserType

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateUserType([FromBody] UserTypeDTO dto)
        {
            var response = await _userTypeService.CreateUserTypeAsync(dto);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        #endregion

        #region Update UserType

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUserType([FromRoute] int id, [FromBody] UserTypeDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var response = await _userTypeService.UpdateUserTypeAsync(id, dto);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        #endregion

        #region Delete UserType

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUserType([FromRoute] int id)
        {
            var response = await _userTypeService.DeleteUserTypeAsync(id);

            if (!response.Success)
                return NotFound(response);

            return Ok(response);
        }

        #endregion

    }
}
