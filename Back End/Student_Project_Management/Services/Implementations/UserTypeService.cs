using FluentValidation;
using Student_Project_Management.DTOs;
using Student_Project_Management.Helpers;
using Student_Project_Management.Models;
using Student_Project_Management.Repositories.Interfaces;
using Student_Project_Management.Services.Interfaces;

namespace Student_Project_Management.Services.Implementations
{
    public class UserTypeService : IUserTypeService
    {
        #region Dependency Injection

        private readonly IUserTypeRepository _userTypeRepository;
        private readonly IValidator<UserTypeDTO> _validator;

        public UserTypeService(IUserTypeRepository userTypeRepository, IValidator<UserTypeDTO> validator)
        {
            _userTypeRepository = userTypeRepository;
            _validator = validator;
        }

        #endregion

        #region Get All UserTypes

        public async Task<ApiResponse<object>> GetAllUserTypesAsync(
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

                var (items, totalCount) = await _userTypeRepository.GetPagedAsync(pageNumber, pageSize);

                var totalPages = (int)Math.Ceiling(
                    totalCount / (double)pageSize
                );

                var userTypeDTOs = items.Select(u => new UserTypeDTO
                {
                    UserTypeID = u.UserTypeID,
                    UserTypeName = u.UserTypeName,
                    Description = u.Description
                }).ToList();

                return new ApiResponse<object>
                (
                    true,
                    "User Types fetched successfully.",
                    new
                    {
                        items = userTypeDTOs,
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
                    "Failed to fetch User Types.",
                    error: ex.Message
                );
            }
        }

        #endregion

        #region Get UserType By Id

        public async Task<ApiResponse<UserTypeDTO>> GetUserTypeByIdAsync(int id)
        {
            try
            {
                var userType = await _userTypeRepository.GetByIdAsync(id);

                if (userType == null)
                {
                    return new ApiResponse<UserTypeDTO>
                    (
                        false,
                        "User Type not found.",
                        error: "Invalid UserType ID."
                    );
                }

                var dto = new UserTypeDTO
                {
                    UserTypeID = userType.UserTypeID,
                    UserTypeName = userType.UserTypeName,
                    Description = userType.Description
                };

                return new ApiResponse<UserTypeDTO>
                (
                    true,
                    "User Type fetched successfully.",
                    dto
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<UserTypeDTO>
                (
                    false,
                    "Something went wrong.",
                    error: ex.Message
                );
            }
        }

        #endregion

        #region Create UserType

        public async Task<ApiResponse<UserTypeDTO>> CreateUserTypeAsync(UserTypeDTO dto)
        {
            try
            {
                var validationResult = await _validator.ValidateAsync(dto);
                if (!validationResult.IsValid)
                {
                    return new ApiResponse<UserTypeDTO>
                    (
                        false,
                        "Validation failed.",
                        error: validationResult.Errors.Select(x => new {
                            propertyName = x.PropertyName,
                            errorMessage = x.ErrorMessage }).ToList()
                    );
                }

                var entity = new UserType
                {
                    UserTypeName = dto.UserTypeName,
                    Description = dto.Description
                };

                await _userTypeRepository.AddAsync(entity);
                await _userTypeRepository.SaveChangesAsync();

                dto.UserTypeID = entity.UserTypeID;

                return new ApiResponse<UserTypeDTO>
                (
                    true,
                    "User Type created successfully.",
                    dto
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<UserTypeDTO>
                (
                    false,
                    "Failed to create User Type.",
                    error: ex.Message
                );
            }
        }

        #endregion

        #region Update UserType

        public async Task<ApiResponse<UserTypeDTO>> UpdateUserTypeAsync(int id, UserTypeDTO dto)
        {
            try
            {
                if (id != dto.UserTypeID)
                {
                    return new ApiResponse<UserTypeDTO>
                    (
                        false,
                        "UserType ID mismatch."
                    );
                }

                var validationResult = await _validator.ValidateAsync(dto);
                if (!validationResult.IsValid)
                {
                    return new ApiResponse<UserTypeDTO>
                    (
                        false,
                        "Validation failed.",
                        error: validationResult.Errors.Select(x => new {
                            propertyName = x.PropertyName,
                            errorMessage = x.ErrorMessage }).ToList()
                    );
                }

                var exists = await _userTypeRepository.ExistsAsync(id);

                if (!exists)
                {
                    return new ApiResponse<UserTypeDTO>
                    (
                        false,
                        "User Type not found."
                    );
                }

                var entity = new UserType
                {
                    UserTypeID = dto.UserTypeID,
                    UserTypeName = dto.UserTypeName,
                    Description = dto.Description
                };

                _userTypeRepository.Update(entity);
                await _userTypeRepository.SaveChangesAsync();

                return new ApiResponse<UserTypeDTO>
                (
                    true,
                    "User Type updated successfully.",
                    dto
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<UserTypeDTO>
                (
                    false,
                    "Failed to update User Type.",
                    error: ex.Message
                );
            }
        }

        #endregion

        #region Delete UserType

        public async Task<ApiResponse<object>> DeleteUserTypeAsync(int id)
        {
            try
            {
                var entity = await _userTypeRepository.GetByIdAsync(id);

                if (entity == null)
                {
                    return new ApiResponse<object>
                    (
                        false,
                        "User Type not found."
                    );
                }

                _userTypeRepository.Delete(entity);
                await _userTypeRepository.SaveChangesAsync();

                return new ApiResponse<object>
                (
                    true,
                    "User Type deleted successfully."
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<object>
                (
                    false,
                    "Failed to delete User Type.",
                    error: ex.Message
                );
            }
        }

        #endregion
    }
}
