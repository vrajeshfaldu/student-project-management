using FluentValidation;
using Student_Project_Management.DTOs;
using Student_Project_Management.Helpers;
using Student_Project_Management.Models;
using Student_Project_Management.Repositories.Interfaces;
using Student_Project_Management.Services.Interfaces;

namespace Student_Project_Management.Services.Implementations
{
    public class TaskPriorityService : ITaskPriorityService
    {
        #region Dependency Injection

        private readonly ITaskPriorityRepository _taskPriorityRepository;
        private readonly IValidator<TaskPriorityDTO> _validator;

        public TaskPriorityService(ITaskPriorityRepository taskPriorityRepository, IValidator<TaskPriorityDTO> validator)
        {
            _taskPriorityRepository = taskPriorityRepository;
            _validator = validator;
        }

        #endregion

        #region Get All Task Priorities

        public async Task<ApiResponse<object>> GetAllTaskPrioritiesAsync(
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

                var (items, totalCount) = await _taskPriorityRepository.GetPagedAsync(pageNumber, pageSize);

                var totalPages = (int)Math.Ceiling(
                    totalCount / (double)pageSize
                );

                var dtoList = items.Select(x => new TaskPriorityDTO
                {
                    TaskPriorityID = x.TaskPriorityID,
                    TaskPriorityName = x.TaskPriorityName,
                    TaskPriorityCssClass = x.TaskPriorityCssClass
                }).ToList();

                return new ApiResponse<object>
                (
                    true,
                    "Task Priorities fetched successfully.",
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
                    "Failed to fetch Task Priorities.",
                    error: ex.Message
                );
            }
        }

        #endregion

        #region Get Task Priority By Id

        public async Task<ApiResponse<TaskPriorityDTO>> GetTaskPriorityByIdAsync(int id)
        {
            try
            {
                var priority = await _taskPriorityRepository.GetByIdAsync(id);

                if (priority == null)
                {
                    return new ApiResponse<TaskPriorityDTO>
                    (
                        false,
                        "Task Priority not found."
                    );
                }

                var dto = new TaskPriorityDTO
                {
                    TaskPriorityID = priority.TaskPriorityID,
                    TaskPriorityName = priority.TaskPriorityName,
                    TaskPriorityCssClass = priority.TaskPriorityCssClass
                };

                return new ApiResponse<TaskPriorityDTO>
                (
                    true,
                    "Task Priority fetched successfully.",
                    dto
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<TaskPriorityDTO>
                (
                    false,
                    "Something went wrong.",
                    error: ex.Message
                );
            }
        }

        #endregion

        #region Create Task Priority

        public async Task<ApiResponse<TaskPriorityDTO>> CreateTaskPriorityAsync(TaskPriorityDTO dto)
        {
            try
            {
                var validationResult = await _validator.ValidateAsync(dto);
                if (!validationResult.IsValid)
                {
                    return new ApiResponse<TaskPriorityDTO>
                    (
                        false,
                        "Validation failed.",
                        error: validationResult.Errors.Select(x => new { propertyName = x.PropertyName, errorMessage = x.ErrorMessage }).ToList()
                    );
                }

                var entity = new TaskPriority
                {
                    TaskPriorityName = dto.TaskPriorityName,
                    TaskPriorityCssClass = dto.TaskPriorityCssClass
                };

                await _taskPriorityRepository.AddAsync(entity);
                await _taskPriorityRepository.SaveChangesAsync();

                dto.TaskPriorityID = entity.TaskPriorityID;

                return new ApiResponse<TaskPriorityDTO>
                (
                    true,
                    "Task Priority created successfully.",
                    dto
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<TaskPriorityDTO>
                (
                    false,
                    "Failed to create Task Priority.",
                    error: ex.Message
                );
            }
        }

        #endregion

        #region Update Task Priority

        public async Task<ApiResponse<TaskPriorityDTO>> UpdateTaskPriorityAsync(int id, TaskPriorityDTO dto)
        {
            try
            {
                if (id != dto.TaskPriorityID)
                {
                    return new ApiResponse<TaskPriorityDTO>
                    (
                        false,
                        "Task Priority ID mismatch."
                    );
                }

                var validationResult = await _validator.ValidateAsync(dto);
                if (!validationResult.IsValid)
                {
                    return new ApiResponse<TaskPriorityDTO>
                    (
                        false,
                        "Validation failed.",
                        error: validationResult.Errors.Select(x => new { propertyName = x.PropertyName, errorMessage = x.ErrorMessage }).ToList()
                    );
                }

                var exists = await _taskPriorityRepository.ExistsAsync(id);

                if (!exists)
                {
                    return new ApiResponse<TaskPriorityDTO>
                    (
                        false,
                        "Task Priority not found."
                    );
                }

                var entity = new TaskPriority
                {
                    TaskPriorityID = dto.TaskPriorityID,
                    TaskPriorityName = dto.TaskPriorityName,
                    TaskPriorityCssClass = dto.TaskPriorityCssClass
                };

                _taskPriorityRepository.Update(entity);
                await _taskPriorityRepository.SaveChangesAsync();

                return new ApiResponse<TaskPriorityDTO>
                (
                    true,
                    "Task Priority updated successfully.",
                    dto
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<TaskPriorityDTO>
                (
                    false,
                    "Failed to update Task Priority.",
                    error: ex.Message
                );
            }
        }

        #endregion

        #region Delete Task Priority

        public async Task<ApiResponse<object>> DeleteTaskPriorityAsync(int id)
        {
            try
            {
                var entity = await _taskPriorityRepository.GetByIdAsync(id);

                if (entity == null)
                {
                    return new ApiResponse<object>
                    (
                        false,
                        "Task Priority not found."
                    );
                }

                _taskPriorityRepository.Delete(entity);
                await _taskPriorityRepository.SaveChangesAsync();

                return new ApiResponse<object>
                (
                    true,
                    "Task Priority deleted successfully."
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<object>
                (
                    false,
                    "Failed to delete Task Priority.",
                    error: ex.Message
                );
            }
        }

        #endregion
    }
}
