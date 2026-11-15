using FluentValidation;
using Student_Project_Management.DTOs;
using Student_Project_Management.Helpers;
using Student_Project_Management.Models;
using Student_Project_Management.Repositories.Interfaces;
using Student_Project_Management.Services.Interfaces;

namespace Student_Project_Management.Services.Implementations
{
    public class RoleService : IRoleService
    {
        #region Dependency Injection

        private readonly IRoleRepository _roleRepository;
        private readonly IValidator<RoleDTO> _validator;

        public RoleService(IRoleRepository roleRepository, IValidator<RoleDTO> validator)
        {
            _roleRepository = roleRepository;
            _validator = validator;
        }

        #endregion

        #region Get All Roles

        public async Task<ApiResponse<object>> GetAllRolesAsync(
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

                var (items, totalCount) = await _roleRepository.GetPagedAsync(pageNumber, pageSize);

                var totalPages = (int)Math.Ceiling(
                    totalCount / (double)pageSize
                );

                var roleDTOs = items.Select(r => new RoleDTO
                {
                    RoleID = r.RoleID,
                    RoleName = r.RoleName,
                    Description = r.Description
                }).ToList();

                return new ApiResponse<object>
                (
                    true,
                    "Roles fetched successfully.",
                    new
                    {
                        items = roleDTOs,
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
                    "Failed to fetch roles.",
                    error: ex.Message
                );
            }
        }

        #endregion

        #region Get Role By Id

        public async Task<ApiResponse<RoleDTO>> GetRoleByIdAsync(int id)
        {
            try
            {
                var role = await _roleRepository.GetByIdAsync(id);

                if (role == null)
                {
                    return new ApiResponse<RoleDTO>
                    (
                        false,
                        "Role not found.",
                        error: "Invalid Role ID."
                    );
                }

                var roleDTO = new RoleDTO
                {
                    RoleID = role.RoleID,
                    RoleName = role.RoleName,
                    Description = role.Description
                };

                return new ApiResponse<RoleDTO>
                (
                    true,
                    "Role fetched successfully.",
                    roleDTO
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<RoleDTO>
                (
                    false,
                    "Something went wrong.",
                    error: ex.Message
                );
            }
        }

        #endregion

        #region Create Role

        public async Task<ApiResponse<RoleDTO>> CreateRoleAsync(RoleDTO roleDTO)
        {
            try
            {
                var validationResult = await _validator.ValidateAsync(roleDTO);
                if (!validationResult.IsValid)
                {
                    return new ApiResponse<RoleDTO>
                    (
                        false,
                        "Validation failed.",
                        error: validationResult.Errors.Select(x => new
                        {
                            propertyName = x.PropertyName,
                            errorMessage = x.ErrorMessage
                        }).ToList()
                    );
                }

                var role = new Role
                {
                    RoleName = roleDTO.RoleName,
                    Description = roleDTO.Description
                };

                await _roleRepository.AddAsync(role);
                await _roleRepository.SaveChangesAsync();

                roleDTO.RoleID = role.RoleID;

                return new ApiResponse<RoleDTO>
                (
                    true,
                    "Role created successfully.",
                    roleDTO
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<RoleDTO>
                (
                    false,
                    "Failed to create role.",
                    error: ex.Message
                );
            }
        }

        #endregion

        #region Update Role

        public async Task<ApiResponse<RoleDTO>> UpdateRoleAsync(int id, RoleDTO roleDTO)
        {
            try
            {
                if (id != roleDTO.RoleID)
                {
                    return new ApiResponse<RoleDTO>
                    (
                        false,
                        "Role ID mismatch."
                    );
                }

                var validationResult = await _validator.ValidateAsync(roleDTO);
                if (!validationResult.IsValid)
                {
                    return new ApiResponse<RoleDTO>
                    (
                        false,
                        "Validation failed.",
                        error: validationResult.Errors.Select(x => new
                        {
                            propertyName = x.PropertyName,
                            errorMessage = x.ErrorMessage
                        }).ToList()
                    );
                }

                var exists = await _roleRepository.ExistsAsync(id);
                if (!exists)
                {
                    return new ApiResponse<RoleDTO>
                    (
                        false,
                        "Role not found."
                    );
                }

                var role = new Role
                {
                    RoleID = roleDTO.RoleID,
                    RoleName = roleDTO.RoleName,
                    Description = roleDTO.Description
                };

                _roleRepository.Update(role);
                await _roleRepository.SaveChangesAsync();

                return new ApiResponse<RoleDTO>
                (
                    true,
                    "Role updated successfully.",
                    roleDTO
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<RoleDTO>
                (
                    false,
                    "Failed to update role.",
                    error: ex.Message
                );
            }
        }

        #endregion

        #region Delete Role

        public async Task<ApiResponse<object>> DeleteRoleAsync(int id)
        {
            try
            {
                var role = await _roleRepository.GetByIdAsync(id);

                if (role == null)
                {
                    return new ApiResponse<object>
                    (
                        false,
                        "Role not found."
                    );
                }

                _roleRepository.Delete(role);
                await _roleRepository.SaveChangesAsync();

                return new ApiResponse<object>
                (
                    true,
                    "Role deleted successfully."
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<object>
                (
                    false,
                    "Failed to delete role.",
                    error: ex.Message
                );
            }
        }

        #endregion
    }
}