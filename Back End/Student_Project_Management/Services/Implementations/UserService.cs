using FluentValidation;
using Student_Project_Management.DTOs;
using Student_Project_Management.Helpers;
using Student_Project_Management.Models;
using Student_Project_Management.Repositories.Interfaces;
using Student_Project_Management.Services.Interfaces;

namespace Student_Project_Management.Services.Implementations
{
    public class UserService : IUserService
    {
        #region Dependency Injection

        private readonly IUserRepository _userRepository;
        private readonly IUserTypeRepository _userTypeRepository;
        private readonly IValidator<UserDTO> _validator;

        public UserService(
            IUserRepository userRepository,
            IUserTypeRepository userTypeRepository,
            IValidator<UserDTO> validator)
        {
            _userRepository = userRepository;
            _userTypeRepository = userTypeRepository;
            _validator = validator;
        }

        #endregion

        #region Get All Users

        public async Task<ApiResponse<object>> GetAllUsersAsync(
            int pageNumber = 1,
            int pageSize = 10,
            int? userTypeId = null)
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

                var (items, totalCount) = await _userRepository.GetPagedAsync(pageNumber, pageSize, userTypeId);

                var totalPages = (int)Math.Ceiling(
                    totalCount / (double)pageSize
                );

                var users = items.Select(u => new UserDTO
                {
                    UserID = u.UserID,
                    UserTypeID = u.UserTypeID,
                    UserTypeName = u.UserType != null
                        ? u.UserType.UserTypeName
                        : null,
                    FullName = u.FullName,
                    UserCode = u.UserCode,
                    Email = u.Email,
                    Password = u.Password,
                    MobileNumber = u.MobileNumber,
                    ProfilePicturePath = u.ProfilePicturePath,
                    IsActive = u.IsActive,
                    IsDeleted = u.IsDeleted
                }).ToList();

                return new ApiResponse<object>(
                    true,
                    "Users fetched successfully.",
                    new
                    {
                        items = users,
                        pageNumber = pageNumber,
                        pageSize = pageSize,
                        totalCount = totalCount,
                        totalPages = totalPages,
                        userTypeId = userTypeId
                    }
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<object>(
                    false,
                    "Failed to fetch users.",
                    error: ex.Message
                );
            }
        }
        #endregion

        #region Get User By Id

        public async Task<ApiResponse<UserDTO>> GetUserByIdAsync(int id)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(id);

                if (user == null)
                {
                    return new ApiResponse<UserDTO>
                    (
                        false,
                        "User not found.",
                        error: "Invalid User ID."
                    );
                }

                var dto = new UserDTO
                {
                    UserID = user.UserID,
                    UserTypeID = user.UserTypeID,
                    UserTypeName = user.UserType != null ? user.UserType.UserTypeName : null,
                    FullName = user.FullName,
                    UserCode = user.UserCode,
                    Email = user.Email,
                    Password = user.Password,
                    MobileNumber = user.MobileNumber,
                    ProfilePicturePath = user.ProfilePicturePath,
                    IsActive = user.IsActive,
                    IsDeleted = user.IsDeleted
                };

                return new ApiResponse<UserDTO>
                (
                    true,
                    "User fetched successfully.",
                    dto
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<UserDTO>
                (
                    false,
                    "Something went wrong.",
                    error: ex.Message
                );
            }
        }

        #endregion

        #region Create User

        public async Task<ApiResponse<UserDTO>> CreateUserAsync(UserDTO dto)
        {
            try
            {
                var validationResult = await _validator.ValidateAsync(dto);
                if (!validationResult.IsValid)
                {
                    return new ApiResponse<UserDTO>
                    (
                        false,
                        "Validation failed.",
                        error: validationResult.Errors.Select(x => new { propertyName = x.PropertyName, errorMessage = x.ErrorMessage }).ToList()
                    );
                }

                var userTypeExists = await _userTypeRepository.ExistsAsync(dto.UserTypeID);

                if (!userTypeExists)
                {
                    return new ApiResponse<UserDTO>
                    (
                        false,
                        "Invalid User Type."
                    );
                }

                var user = new User
                {
                    UserTypeID = dto.UserTypeID,
                    FullName = dto.FullName,
                    UserCode = dto.UserCode,
                    Email = dto.Email,
                    Password = dto.Password,
                    MobileNumber = dto.MobileNumber,
                    ProfilePicturePath = dto.ProfilePicturePath,
                    IsActive = dto.IsActive,
                    IsDeleted = dto.IsDeleted
                };

                await _userRepository.AddAsync(user);
                await _userRepository.SaveChangesAsync();

                dto.UserID = user.UserID;

                return new ApiResponse<UserDTO>
                (
                    true,
                    "User created successfully.",
                    dto
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<UserDTO>
                (
                    false,
                    "Failed to create user.",
                    error: ex.Message
                );
            }
        }

        #endregion

        #region Update User

        public async Task<ApiResponse<UserDTO>> UpdateUserAsync(int id, UserDTO dto)
        {
            try
            {
                if (id != dto.UserID)
                {
                    return new ApiResponse<UserDTO>
                    (
                        false,
                        "User ID mismatch."
                    );
                }

                var validationResult = await _validator.ValidateAsync(dto);
                if (!validationResult.IsValid)
                {
                    return new ApiResponse<UserDTO>
                    (
                        false,
                        "Validation failed.",
                        error: validationResult.Errors.Select(x => new { propertyName = x.PropertyName, errorMessage = x.ErrorMessage }).ToList()
                    );
                }

                var userExists = await _userRepository.ExistsAsync(id);

                if (!userExists)
                {
                    return new ApiResponse<UserDTO>
                    (
                        false,
                        "User not found."
                    );
                }

                var userTypeExists = await _userTypeRepository.ExistsAsync(dto.UserTypeID);

                if (!userTypeExists)
                {
                    return new ApiResponse<UserDTO>
                    (
                        false,
                        "Invalid User Type."
                    );
                }

                var user = new User
                {
                    UserID = dto.UserID,
                    UserTypeID = dto.UserTypeID,
                    FullName = dto.FullName,
                    UserCode = dto.UserCode,
                    Email = dto.Email,
                    Password = dto.Password,
                    MobileNumber = dto.MobileNumber,
                    ProfilePicturePath = dto.ProfilePicturePath,
                    IsActive = dto.IsActive,
                    IsDeleted = dto.IsDeleted
                };

                _userRepository.Update(user);
                await _userRepository.SaveChangesAsync();

                return new ApiResponse<UserDTO>
                (
                    true,
                    "User updated successfully.",
                    dto
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<UserDTO>
                (
                    false,
                    "Failed to update user.",
                    error: ex.Message
                );
            }
        }

        #endregion

        #region Delete User

        public async Task<ApiResponse<object>> DeleteUserAsync(int id)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(id);

                if (user == null)
                {
                    return new ApiResponse<object>
                    (
                        false,
                        "User not found."
                    );
                }

                _userRepository.Delete(user);
                await _userRepository.SaveChangesAsync();

                return new ApiResponse<object>
                (
                    true,
                    "User deleted successfully."
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<object>
                (
                    false,
                    "Failed to delete user.",
                    error: ex.Message
                );
            }
        }

        #endregion
    }
}
