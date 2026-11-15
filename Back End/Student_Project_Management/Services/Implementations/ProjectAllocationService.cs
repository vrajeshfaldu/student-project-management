using FluentValidation;
using Student_Project_Management.DTOs;
using Student_Project_Management.Helpers;
using Student_Project_Management.Models;
using Student_Project_Management.Repositories.Interfaces;
using Student_Project_Management.Services.Interfaces;

namespace Student_Project_Management.Services.Implementations
{
    public class ProjectAllocationService : IProjectAllocationService
    {
        #region Dependency Injection

        private readonly IProjectAllocationRepository _projectAllocationRepository;
        private readonly IProjectMasterRepository _projectMasterRepository;
        private readonly IUserRepository _userRepository;
        private readonly IValidator<ProjectAllocationDTO> _validator;

        public ProjectAllocationService(
            IProjectAllocationRepository projectAllocationRepository,
            IProjectMasterRepository projectMasterRepository,
            IUserRepository userRepository,
            IValidator<ProjectAllocationDTO> validator)
        {
            _projectAllocationRepository = projectAllocationRepository;
            _projectMasterRepository = projectMasterRepository;
            _userRepository = userRepository;
            _validator = validator;
        }

        #endregion

        #region Get All Project Allocations

        public async Task<ApiResponse<object>> GetAllProjectAllocationsAsync(
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

                var (items, totalCount) = await _projectAllocationRepository.GetPagedAsync(pageNumber, pageSize);

                var totalPages = (int)Math.Ceiling(
                    totalCount / (double)pageSize
                );

                var dtoList = items.Select(x => new ProjectAllocationDTO
                {
                    ProjectAllocationID = x.ProjectAllocationID,
                    ProjectID = x.ProjectID,
                    ProjectTitle = x.Project?.ProjectTitle,
                    StudentID = x.StudentID,
                    StudentName = x.Student?.FullName,
                    FacultyID = x.FacultyID,
                    FacultyName = x.Faculty?.FullName,
                    AssignedDate = x.AssignedDate,
                    ProjectStartDate = x.ProjectStartDate,
                    ProjectEndDate = x.ProjectEndDate,
                    TotalTasksGiven = x.TotalTasksGiven,
                    TotalCompletedTasks = x.TotalCompletedTasks,
                    ProgressPercentage = x.ProgressPercentage,
                    OverAllGrade = x.OverAllGrade
                }).ToList();

                return new ApiResponse<object>
                (
                    true,
                    "Project Allocations fetched successfully.",
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
                    "Failed to fetch project allocations.",
                    error: ex.Message
                );
            }
        }

        #endregion

        #region Get Project Allocation By Id

        public async Task<ApiResponse<ProjectAllocationDTO>> GetProjectAllocationByIdAsync(int id)
        {
            try
            {
                var allocation = await _projectAllocationRepository.GetByIdAsync(id);

                if (allocation == null)
                {
                    return new ApiResponse<ProjectAllocationDTO>
                    (
                        false,
                        "Project Allocation not found."
                    );
                }

                var dto = new ProjectAllocationDTO
                {
                    ProjectAllocationID = allocation.ProjectAllocationID,
                    ProjectID = allocation.ProjectID,
                    ProjectTitle = allocation.Project?.ProjectTitle,
                    StudentID = allocation.StudentID,
                    StudentName = allocation.Student?.FullName,
                    FacultyID = allocation.FacultyID,
                    FacultyName = allocation.Faculty?.FullName,
                    AssignedDate = allocation.AssignedDate,
                    ProjectStartDate = allocation.ProjectStartDate,
                    ProjectEndDate = allocation.ProjectEndDate,
                    TotalTasksGiven = allocation.TotalTasksGiven,
                    TotalCompletedTasks = allocation.TotalCompletedTasks,
                    ProgressPercentage = allocation.ProgressPercentage,
                    OverAllGrade = allocation.OverAllGrade
                };

                return new ApiResponse<ProjectAllocationDTO>
                (
                    true,
                    "Project Allocation fetched successfully.",
                    dto
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<ProjectAllocationDTO>
                (
                    false,
                    "Something went wrong.",
                    error: ex.Message
                );
            }
        }

        #endregion

        #region Create Project Allocation

        public async Task<ApiResponse<ProjectAllocationDTO>> CreateProjectAllocationAsync(
            ProjectAllocationDTO dto)
        {
            try
            {
                var validationResult = await _validator.ValidateAsync(dto);
                if (!validationResult.IsValid)
                {
                    return new ApiResponse<ProjectAllocationDTO>
                    (
                        false,
                        "Validation failed.",
                        error: validationResult.Errors.Select(x => new { propertyName = x.PropertyName, errorMessage = x.ErrorMessage }).ToList()
                    );
                }

                var projectExists = await _projectMasterRepository.ExistsAsync(dto.ProjectID);

                if (!projectExists)
                {
                    return new ApiResponse<ProjectAllocationDTO>
                    (
                        false,
                        "Invalid Project."
                    );
                }

                var studentExists = await _userRepository.ExistsAsync(dto.StudentID);

                if (!studentExists)
                {
                    return new ApiResponse<ProjectAllocationDTO>
                    (
                        false,
                        "Invalid Student."
                    );
                }

                var facultyExists = await _userRepository.ExistsAsync(dto.FacultyID);

                if (!facultyExists)
                {
                    return new ApiResponse<ProjectAllocationDTO>
                    (
                        false,
                        "Invalid Faculty."
                    );
                }

                var entity = new ProjectAllocation
                {
                    ProjectID = dto.ProjectID,
                    StudentID = dto.StudentID,
                    FacultyID = dto.FacultyID,
                    AssignedDate = dto.AssignedDate,
                    ProjectStartDate = dto.ProjectStartDate,
                    ProjectEndDate = dto.ProjectEndDate,
                    TotalTasksGiven = dto.TotalTasksGiven,
                    TotalCompletedTasks = dto.TotalCompletedTasks,
                    ProgressPercentage = dto.ProgressPercentage,
                    OverAllGrade = dto.OverAllGrade
                };

                await _projectAllocationRepository.AddAsync(entity);
                await _projectAllocationRepository.SaveChangesAsync();

                dto.ProjectAllocationID = entity.ProjectAllocationID;

                return new ApiResponse<ProjectAllocationDTO>
                (
                    true,
                    "Project Allocation created successfully.",
                    dto
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<ProjectAllocationDTO>
                (
                    false,
                    "Failed to create project allocation.",
                    error: ex.Message
                );
            }
        }

        #endregion

        #region Update Project Allocation

        public async Task<ApiResponse<ProjectAllocationDTO>> UpdateProjectAllocationAsync(
            int id,
            ProjectAllocationDTO dto)
        {
            try
            {
                if (id != dto.ProjectAllocationID)
                {
                    return new ApiResponse<ProjectAllocationDTO>
                    (
                        false,
                        "Project Allocation ID mismatch."
                    );
                }

                var validationResult = await _validator.ValidateAsync(dto);
                if (!validationResult.IsValid)
                {
                    return new ApiResponse<ProjectAllocationDTO>
                    (
                        false,
                        "Validation failed.",
                        error: validationResult.Errors.Select(x => new { propertyName = x.PropertyName, errorMessage = x.ErrorMessage }).ToList()
                    );
                }

                var exists = await _projectAllocationRepository.ExistsAsync(id);

                if (!exists)
                {
                    return new ApiResponse<ProjectAllocationDTO>
                    (
                        false,
                        "Project Allocation not found."
                    );
                }

                var projectExists = await _projectMasterRepository.ExistsAsync(dto.ProjectID);

                if (!projectExists)
                {
                    return new ApiResponse<ProjectAllocationDTO>
                    (
                        false,
                        "Invalid Project."
                    );
                }

                var studentExists = await _userRepository.ExistsAsync(dto.StudentID);

                if (!studentExists)
                {
                    return new ApiResponse<ProjectAllocationDTO>
                    (
                        false,
                        "Invalid Student."
                    );
                }

                var facultyExists = await _userRepository.ExistsAsync(dto.FacultyID);

                if (!facultyExists)
                {
                    return new ApiResponse<ProjectAllocationDTO>
                    (
                        false,
                        "Invalid Faculty."
                    );
                }

                var entity = new ProjectAllocation
                {
                    ProjectAllocationID = dto.ProjectAllocationID,
                    ProjectID = dto.ProjectID,
                    StudentID = dto.StudentID,
                    FacultyID = dto.FacultyID,
                    AssignedDate = dto.AssignedDate,
                    ProjectStartDate = dto.ProjectStartDate,
                    ProjectEndDate = dto.ProjectEndDate,
                    TotalTasksGiven = dto.TotalTasksGiven,
                    TotalCompletedTasks = dto.TotalCompletedTasks,
                    ProgressPercentage = dto.ProgressPercentage,
                    OverAllGrade = dto.OverAllGrade
                };

                _projectAllocationRepository.Update(entity);
                await _projectAllocationRepository.SaveChangesAsync();

                return new ApiResponse<ProjectAllocationDTO>
                (
                    true,
                    "Project Allocation updated successfully.",
                    dto
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<ProjectAllocationDTO>
                (
                    false,
                    "Failed to update project allocation.",
                    error: ex.Message
                );
            }
        }

        #endregion

        #region Delete Project Allocation

        public async Task<ApiResponse<object>> DeleteProjectAllocationAsync(int id)
        {
            try
            {
                var entity = await _projectAllocationRepository.GetByIdAsync(id);

                if (entity == null)
                {
                    return new ApiResponse<object>
                    (
                        false,
                        "Project Allocation not found."
                    );
                }

                _projectAllocationRepository.Delete(entity);
                await _projectAllocationRepository.SaveChangesAsync();

                return new ApiResponse<object>
                (
                    true,
                    "Project Allocation deleted successfully."
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<object>
                (
                    false,
                    "Failed to delete project allocation.",
                    error: ex.Message
                );
            }
        }

        #endregion
    }
}
