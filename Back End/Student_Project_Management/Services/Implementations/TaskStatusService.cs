using FluentValidation;
using Student_Project_Management.DTOs;
using Student_Project_Management.Helpers;
using Student_Project_Management.Repositories.Interfaces;
using Student_Project_Management.Services.Interfaces;
using ModelTaskStatus = Student_Project_Management.Models.TaskStatus;

namespace Student_Project_Management.Services.Implementations
{
    public class TaskStatusService : ITaskStatusService
    {
        #region Dependency Injection

        private readonly ITaskStatusRepository _taskStatusRepository;
        private readonly IValidator<TaskStatusDTO> _validator;

        public TaskStatusService(ITaskStatusRepository taskStatusRepository, IValidator<TaskStatusDTO> validator)
        {
            _taskStatusRepository = taskStatusRepository;
            _validator = validator;
        }

        #endregion

        #region Get All Task Statuses

        public async Task<ApiResponse<object>> GetAllTaskStatusesAsync(
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

                var (items, totalCount) = await _taskStatusRepository.GetPagedAsync(pageNumber, pageSize);

                var totalPages = (int)Math.Ceiling(
                    totalCount / (double)pageSize
                );

                var dtoList = items.Select(x => new TaskStatusDTO
                {
                    TaskStatusID = x.TaskStatusID,
                    TaskStatusName = x.TaskStatusName,
                    TaskStatusCssClass = x.TaskStatusCssClass
                }).ToList();

                return new ApiResponse<object>
                (
                    true,
                    "Task Statuses fetched successfully.",
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
                    "Failed to fetch Task Statuses.",
                    error: ex.Message
                );
            }
        }

        #endregion

        #region Get Task Status By Id

        public async Task<ApiResponse<TaskStatusDTO>> GetTaskStatusByIdAsync(int id)
        {
            try
            {
                var taskStatus = await _taskStatusRepository.GetByIdAsync(id);

                if (taskStatus == null)
                {
                    return new ApiResponse<TaskStatusDTO>
                    (
                        false,
                        "Task Status not found."
                    );
                }

                var dto = new TaskStatusDTO
                {
                    TaskStatusID = taskStatus.TaskStatusID,
                    TaskStatusName = taskStatus.TaskStatusName,
                    TaskStatusCssClass = taskStatus.TaskStatusCssClass
                };

                return new ApiResponse<TaskStatusDTO>
                (
                    true,
                    "Task Status fetched successfully.",
                    dto
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<TaskStatusDTO>
                (
                    false,
                    "Something went wrong.",
                    error: ex.Message
                );
            }
        }

        #endregion

        #region Create Task Status

        public async Task<ApiResponse<TaskStatusDTO>> CreateTaskStatusAsync(TaskStatusDTO dto)
        {
            try
            {
                var validationResult = await _validator.ValidateAsync(dto);
                if (!validationResult.IsValid)
                {
                    return new ApiResponse<TaskStatusDTO>
                    (
                        false,
                        "Validation failed.",
                        error: validationResult.Errors.Select(x => new { propertyName = x.PropertyName, errorMessage = x.ErrorMessage }).ToList()
                    );
                }

                var entity = new ModelTaskStatus
                {
                    TaskStatusName = dto.TaskStatusName,
                    TaskStatusCssClass = dto.TaskStatusCssClass
                };

                await _taskStatusRepository.AddAsync(entity);
                await _taskStatusRepository.SaveChangesAsync();

                dto.TaskStatusID = entity.TaskStatusID;

                return new ApiResponse<TaskStatusDTO>
                (
                    true,
                    "Task Status created successfully.",
                    dto
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<TaskStatusDTO>
                (
                    false,
                    "Failed to create Task Status.",
                    error: ex.Message
                );
            }
        }

        #endregion

        #region Update Task Status

        public async Task<ApiResponse<TaskStatusDTO>> UpdateTaskStatusAsync(int id, TaskStatusDTO dto)
        {
            try
            {
                if (id != dto.TaskStatusID)
                {
                    return new ApiResponse<TaskStatusDTO>
                    (
                        false,
                        "Task Status ID mismatch."
                    );
                }

                var validationResult = await _validator.ValidateAsync(dto);
                if (!validationResult.IsValid)
                {
                    return new ApiResponse<TaskStatusDTO>
                    (
                        false,
                        "Validation failed.",
                        error: validationResult.Errors.Select(x => new { propertyName = x.PropertyName, errorMessage = x.ErrorMessage }).ToList()
                    );
                }

                var exists = await _taskStatusRepository.ExistsAsync(id);

                if (!exists)
                {
                    return new ApiResponse<TaskStatusDTO>
                    (
                        false,
                        "Task Status not found."
                    );
                }

                var entity = new ModelTaskStatus
                {
                    TaskStatusID = dto.TaskStatusID,
                    TaskStatusName = dto.TaskStatusName,
                    TaskStatusCssClass = dto.TaskStatusCssClass
                };

                _taskStatusRepository.Update(entity);
                await _taskStatusRepository.SaveChangesAsync();

                return new ApiResponse<TaskStatusDTO>
                (
                    true,
                    "Task Status updated successfully.",
                    dto
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<TaskStatusDTO>
                (
                    false,
                    "Failed to update Task Status.",
                    error: ex.Message
                );
            }
        }

        #endregion

        #region Delete Task Status

        public async Task<ApiResponse<object>> DeleteTaskStatusAsync(int id)
        {
            try
            {
                var entity = await _taskStatusRepository.GetByIdAsync(id);

                if (entity == null)
                {
                    return new ApiResponse<object>
                    (
                        false,
                        "Task Status not found."
                    );
                }

                _taskStatusRepository.Delete(entity);
                await _taskStatusRepository.SaveChangesAsync();

                return new ApiResponse<object>
                (
                    true,
                    "Task Status deleted successfully."
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<object>
                (
                    false,
                    "Failed to delete Task Status.",
                    error: ex.Message
                );
            }
        }

        #endregion
    }
}
