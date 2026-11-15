using FluentValidation;
using Student_Project_Management.DTOs;
using Student_Project_Management.Helpers;
using Student_Project_Management.Repositories.Interfaces;
using Student_Project_Management.Services.Interfaces;
using ModelTask = Student_Project_Management.Models.Task;

namespace Student_Project_Management.Services.Implementations
{
    public class TaskService : ITaskService
    {
        #region Dependency Injection

        private readonly ITaskRepository _taskRepository;
        private readonly IProjectAllocationRepository _projectAllocationRepository;
        private readonly ITaskStatusRepository _taskStatusRepository;
        private readonly ITaskPriorityRepository _taskPriorityRepository;
        private readonly IValidator<TaskDTO> _validator;

        public TaskService(
            ITaskRepository taskRepository,
            IProjectAllocationRepository projectAllocationRepository,
            ITaskStatusRepository taskStatusRepository,
            ITaskPriorityRepository taskPriorityRepository,
            IValidator<TaskDTO> validator)
        {
            _taskRepository = taskRepository;
            _projectAllocationRepository = projectAllocationRepository;
            _taskStatusRepository = taskStatusRepository;
            _taskPriorityRepository = taskPriorityRepository;
            _validator = validator;
        }

        #endregion

        #region Get All Tasks

        public async Task<ApiResponse<object>> GetAllTasksAsync(
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

                var (items, totalCount) = await _taskRepository.GetPagedAsync(pageNumber, pageSize);

                var totalPages = (int)Math.Ceiling(
                    totalCount / (double)pageSize
                );

                var dtoList = items.Select(x => new TaskDTO
                {
                    TaskID = x.TaskID,
                    ProjectAllocationID = x.ProjectAllocationID,
                    ProjectTitle = x.ProjectAllocation?.Project?.ProjectTitle,
                    TaskTitle = x.TaskTitle,
                    TaskDescription = x.TaskDescription,
                    TaskStatusID = x.TaskStatusID,
                    TaskStatusName = x.TaskStatus?.TaskStatusName,
                    TaskPriorityID = x.TaskPriorityID,
                    TaskPriorityName = x.TaskPriority?.TaskPriorityName,
                    AssignedScore = x.AssignedScore,
                    EarnedScore = x.EarnedScore,
                    ProgressPercentage = x.ProgressPercentage,
                    TaskAssignedDate = x.TaskAssignedDate,
                    TaskStartDate = x.TaskStartDate,
                    TaskDueDate = x.TaskDueDate,
                    TaskCompletedDate = x.TaskCompletedDate,
                    NextFollowUpDate = x.NextFollowUpDate,
                    FacultyRemarks = x.FacultyRemarks,
                    StudentRemarks = x.StudentRemarks
                }).ToList();

                return new ApiResponse<object>
                (
                    true,
                    "Tasks fetched successfully.",
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
                    "Failed to fetch tasks.",
                    error: ex.Message
                );
            }
        }

        #endregion

        #region Get Task By Id

        public async Task<ApiResponse<TaskDTO>> GetTaskByIdAsync(int id)
        {
            try
            {
                var task = await _taskRepository.GetByIdAsync(id);

                if (task == null)
                {
                    return new ApiResponse<TaskDTO>
                    (
                        false,
                        "Task not found."
                    );
                }

                var dto = new TaskDTO
                {
                    TaskID = task.TaskID,
                    ProjectAllocationID = task.ProjectAllocationID,
                    ProjectTitle = task.ProjectAllocation?.Project?.ProjectTitle,
                    TaskTitle = task.TaskTitle,
                    TaskDescription = task.TaskDescription,
                    TaskStatusID = task.TaskStatusID,
                    TaskStatusName = task.TaskStatus?.TaskStatusName,
                    TaskPriorityID = task.TaskPriorityID,
                    TaskPriorityName = task.TaskPriority?.TaskPriorityName,
                    AssignedScore = task.AssignedScore,
                    EarnedScore = task.EarnedScore,
                    ProgressPercentage = task.ProgressPercentage,
                    TaskAssignedDate = task.TaskAssignedDate,
                    TaskStartDate = task.TaskStartDate,
                    TaskDueDate = task.TaskDueDate,
                    TaskCompletedDate = task.TaskCompletedDate,
                    NextFollowUpDate = task.NextFollowUpDate,
                    FacultyRemarks = task.FacultyRemarks,
                    StudentRemarks = task.StudentRemarks
                };

                return new ApiResponse<TaskDTO>
                (
                    true,
                    "Task fetched successfully.",
                    dto
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<TaskDTO>
                (
                    false,
                    "Something went wrong.",
                    error: ex.Message
                );
            }
        }

        #endregion

        #region Create Task

        public async Task<ApiResponse<TaskDTO>> CreateTaskAsync(TaskDTO dto)
        {
            try
            {
                var validationResult = await _validator.ValidateAsync(dto);
                if (!validationResult.IsValid)
                {
                    return new ApiResponse<TaskDTO>
                    (
                        false,
                        "Validation failed.",
                        error: validationResult.Errors.Select(x => new { propertyName = x.PropertyName, errorMessage = x.ErrorMessage }).ToList()
                    );
                }

                var allocationExists = await _projectAllocationRepository.ExistsAsync(dto.ProjectAllocationID);

                if (!allocationExists)
                {
                    return new ApiResponse<TaskDTO>
                    (
                        false,
                        "Invalid Project Allocation."
                    );
                }

                var statusExists = await _taskStatusRepository.ExistsAsync(dto.TaskStatusID);

                if (!statusExists)
                {
                    return new ApiResponse<TaskDTO>
                    (
                        false,
                        "Invalid Task Status."
                    );
                }

                var priorityExists = await _taskPriorityRepository.ExistsAsync(dto.TaskPriorityID);

                if (!priorityExists)
                {
                    return new ApiResponse<TaskDTO>
                    (
                        false,
                        "Invalid Task Priority."
                    );
                }

                var entity = new ModelTask
                {
                    ProjectAllocationID = dto.ProjectAllocationID,
                    TaskTitle = dto.TaskTitle,
                    TaskDescription = dto.TaskDescription,
                    TaskStatusID = dto.TaskStatusID,
                    TaskPriorityID = dto.TaskPriorityID,
                    AssignedScore = dto.AssignedScore,
                    EarnedScore = dto.EarnedScore,
                    ProgressPercentage = dto.ProgressPercentage,
                    TaskAssignedDate = dto.TaskAssignedDate,
                    TaskStartDate = dto.TaskStartDate,
                    TaskDueDate = dto.TaskDueDate,
                    TaskCompletedDate = dto.TaskCompletedDate,
                    NextFollowUpDate = dto.NextFollowUpDate,
                    FacultyRemarks = dto.FacultyRemarks,
                    StudentRemarks = dto.StudentRemarks
                };

                await _taskRepository.AddAsync(entity);
                await _taskRepository.SaveChangesAsync();

                dto.TaskID = entity.TaskID;

                return new ApiResponse<TaskDTO>
                (
                    true,
                    "Task created successfully.",
                    dto
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<TaskDTO>
                (
                    false,
                    "Failed to create task.",
                    error: ex.Message
                );
            }
        }

        #endregion

        #region Update Task

        public async Task<ApiResponse<TaskDTO>> UpdateTaskAsync(
            int id,
            TaskDTO dto)
        {
            try
            {
                if (id != dto.TaskID)
                {
                    return new ApiResponse<TaskDTO>
                    (
                        false,
                        "Task ID mismatch."
                    );
                }

                var validationResult = await _validator.ValidateAsync(dto);
                if (!validationResult.IsValid)
                {
                    return new ApiResponse<TaskDTO>
                    (
                        false,
                        "Validation failed.",
                        error: validationResult.Errors.Select(x => new { propertyName = x.PropertyName, errorMessage = x.ErrorMessage }).ToList()
                    );
                }

                var exists = await _taskRepository.ExistsAsync(id);

                if (!exists)
                {
                    return new ApiResponse<TaskDTO>
                    (
                        false,
                        "Task not found."
                    );
                }

                var allocationExists = await _projectAllocationRepository.ExistsAsync(dto.ProjectAllocationID);

                if (!allocationExists)
                {
                    return new ApiResponse<TaskDTO>
                    (
                        false,
                        "Invalid Project Allocation."
                    );
                }

                var statusExists = await _taskStatusRepository.ExistsAsync(dto.TaskStatusID);

                if (!statusExists)
                {
                    return new ApiResponse<TaskDTO>
                    (
                        false,
                        "Invalid Task Status."
                    );
                }

                var priorityExists = await _taskPriorityRepository.ExistsAsync(dto.TaskPriorityID);

                if (!priorityExists)
                {
                    return new ApiResponse<TaskDTO>
                    (
                        false,
                        "Invalid Task Priority."
                    );
                }

                var entity = new ModelTask
                {
                    TaskID = dto.TaskID,
                    ProjectAllocationID = dto.ProjectAllocationID,
                    TaskTitle = dto.TaskTitle,
                    TaskDescription = dto.TaskDescription,
                    TaskStatusID = dto.TaskStatusID,
                    TaskPriorityID = dto.TaskPriorityID,
                    AssignedScore = dto.AssignedScore,
                    EarnedScore = dto.EarnedScore,
                    ProgressPercentage = dto.ProgressPercentage,
                    TaskAssignedDate = dto.TaskAssignedDate,
                    TaskStartDate = dto.TaskStartDate,
                    TaskDueDate = dto.TaskDueDate,
                    TaskCompletedDate = dto.TaskCompletedDate,
                    NextFollowUpDate = dto.NextFollowUpDate,
                    FacultyRemarks = dto.FacultyRemarks,
                    StudentRemarks = dto.StudentRemarks
                };

                _taskRepository.Update(entity);
                await _taskRepository.SaveChangesAsync();

                return new ApiResponse<TaskDTO>
                (
                    true,
                    "Task updated successfully.",
                    dto
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<TaskDTO>
                (
                    false,
                    "Failed to update task.",
                    error: ex.Message
                );
            }
        }

        #endregion

        #region Delete Task

        public async Task<ApiResponse<object>> DeleteTaskAsync(int id)
        {
            try
            {
                var entity = await _taskRepository.GetByIdAsync(id);

                if (entity == null)
                {
                    return new ApiResponse<object>
                    (
                        false,
                        "Task not found."
                    );
                }

                _taskRepository.Delete(entity);
                await _taskRepository.SaveChangesAsync();

                return new ApiResponse<object>
                (
                    true,
                    "Task deleted successfully."
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<object>
                (
                    false,
                    "Failed to delete task.",
                    error: ex.Message
                );
            }
        }

        #endregion
    }
}
