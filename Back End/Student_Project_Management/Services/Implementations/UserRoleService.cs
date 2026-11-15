using FluentValidation;
using Student_Project_Management.DTOs;
using Student_Project_Management.Helpers;
using Student_Project_Management.Models;
using Student_Project_Management.Repositories.Interfaces;
using Student_Project_Management.Services.Interfaces;

namespace Student_Project_Management.Services.Implementations
{
    public class UserRoleService : IUserRoleService
    {
        #region Dependency Injection

        private readonly IUserRoleRepository _userRoleRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly IUserRepository _userRepository;
        private readonly IValidator<UserRoleDTO> _validator;

        public UserRoleService(
            IUserRoleRepository userRoleRepository,
            IRoleRepository roleRepository,
            IUserRepository userRepository,
            IValidator<UserRoleDTO> validator)
        {
            _userRoleRepository = userRoleRepository;
            _roleRepository = roleRepository;
            _userRepository = userRepository;
            _validator = validator;
        }

        #endregion

        #region Get All User Roles

        public async Task<ApiResponse<object>> GetAllUserRolesAsync(
            int pageNumber = 1,
            int pageSize = 10)
        {
            try
            {
                if (pageNumber < 1 || pageSize < 1)
                {
                    return new ApiResponse<object>(
                        false,
                        "Page number and page size must be greater than 0."
                    );
                }

                var (items, totalCount) = await _userRoleRepository.GetPagedAsync(pageNumber, pageSize);

                var totalPages = (int)Math.Ceiling(
                    totalCount / (double)pageSize
                );

                var dtoList = items.Select(x => new UserRoleDTO
                {
                    RolePermissionID = x.RolePermissionID,
                    UserID = x.UserID,
                    UserName = x.User != null ? x.User.FullName : null,
                    RoleID = x.RoleID,
                    RoleName = x.Role != null ? x.Role.RoleName : null
                }).ToList();

                return new ApiResponse<object>
                (
                    true,
                    "User Roles fetched successfully.",
                    new
                    {
                        items = dtoList,
                        pageNumber = pageNumber,
                        pageSize = pageSize,
                        totalCount = totalCount,
                        totalPages = totalPages
                    }
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<object>
                (
                    false,
                    "Failed to fetch User Roles.",
                    error: ex.Message
                );
            }
        }

        #endregion

        #region Get User Role By Id

        public async Task<ApiResponse<UserRoleDTO>> GetUserRoleByIdAsync(int id)
        {
            try
            {
                var entity = await _userRoleRepository.GetByIdAsync(id);

                if (entity == null)
                {
                    return new ApiResponse<UserRoleDTO>
                    (
                        false,
                        "User Role not found."
                    );
                }

                var dto = new UserRoleDTO
                {
                    RolePermissionID = entity.RolePermissionID,
                    UserID = entity.UserID,
                    UserName = entity.User?.FullName,
                    RoleID = entity.RoleID,
                    RoleName = entity.Role?.RoleName
                };

                return new ApiResponse<UserRoleDTO>
                (
                    true,
                    "User Role fetched successfully.",
                    dto
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<UserRoleDTO>
                (
                    false,
                    "Something went wrong.",
                    error: ex.Message
                );
            }
        }

        #endregion

        #region Create User Role

        public async Task<ApiResponse<UserRoleDTO>> CreateUserRoleAsync(UserRoleDTO dto)
        {
            try
            {
                var validationResult = await _validator.ValidateAsync(dto);
                if (!validationResult.IsValid)
                {
                    return new ApiResponse<UserRoleDTO>
                    (
                        false,
                        "Validation failed.",
                        error: validationResult.Errors.Select(x => new { propertyName = x.PropertyName, errorMessage = x.ErrorMessage }).ToList()
                    );
                }

                var roleExists = await _roleRepository.ExistsAsync(dto.RoleID);

                if (!roleExists)
                {
                    return new ApiResponse<UserRoleDTO>
                    (
                        false,
                        "Invalid Role."
                    );
                }

                var userExists = await _userRepository.ExistsAsync(dto.UserID);

                if (!userExists)
                {
                    return new ApiResponse<UserRoleDTO>
                    (
                        false,
                        "Invalid User."
                    );
                }

                var entity = new UserRole
                {
                    RoleID = dto.RoleID,
                    UserID = dto.UserID
                };

                await _userRoleRepository.AddAsync(entity);
                await _userRoleRepository.SaveChangesAsync();

                dto.RolePermissionID = entity.RolePermissionID;

                return new ApiResponse<UserRoleDTO>
                (
                    true,
                    "User Role created successfully.",
                    dto
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<UserRoleDTO>
                (
                    false,
                    "Failed to create User Role.",
                    error: ex.Message
                );
            }
        }

        #endregion

        #region Update User Role

        public async Task<ApiResponse<UserRoleDTO>> UpdateUserRoleAsync(int id, UserRoleDTO dto)
        {
            try
            {
                if (id != dto.RolePermissionID)
                {
                    return new ApiResponse<UserRoleDTO>
                    (
                        false,
                        "Role Permission ID mismatch."
                    );
                }

                var validationResult = await _validator.ValidateAsync(dto);
                if (!validationResult.IsValid)
                {
                    return new ApiResponse<UserRoleDTO>
                    (
                        false,
                        "Validation failed.",
                        error: validationResult.Errors.Select(x => new { propertyName = x.PropertyName, errorMessage = x.ErrorMessage }).ToList()
                    );
                }

                var exists = await _userRoleRepository.ExistsAsync(id);

                if (!exists)
                {
                    return new ApiResponse<UserRoleDTO>
                    (
                        false,
                        "User Role not found."
                    );
                }

                var roleExists = await _roleRepository.ExistsAsync(dto.RoleID);

                if (!roleExists)
                {
                    return new ApiResponse<UserRoleDTO>
                    (
                        false,
                        "Invalid Role."
                    );
                }

                var userExists = await _userRepository.ExistsAsync(dto.UserID);

                if (!userExists)
                {
                    return new ApiResponse<UserRoleDTO>
                    (
                        false,
                        "Invalid User."
                    );
                }

                var entity = new UserRole
                {
                    RolePermissionID = dto.RolePermissionID,
                    RoleID = dto.RoleID,
                    UserID = dto.UserID
                };

                _userRoleRepository.Update(entity);

                await _userRoleRepository.SaveChangesAsync();

                return new ApiResponse<UserRoleDTO>
                (
                    true,
                    "User Role updated successfully.",
                    dto
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<UserRoleDTO>
                (
                    false,
                    "Failed to update User Role.",
                    error: ex.Message
                );
            }
        }

        #endregion

        #region Delete User Role

        public async Task<ApiResponse<object>> DeleteUserRoleAsync(int id)
        {
            try
            {
                var entity = await _userRoleRepository.GetByIdAsync(id);

                if (entity == null)
                {
                    return new ApiResponse<object>
                    (
                        false,
                        "User Role not found."
                    );
                }

                _userRoleRepository.Delete(entity);

                await _userRoleRepository.SaveChangesAsync();

                return new ApiResponse<object>
                (
                    true,
                    "User Role deleted successfully."
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<object>
                (
                    false,
                    "Failed to delete User Role.",
                    error: ex.Message
                );
            }
        }

        #endregion
    }
}
