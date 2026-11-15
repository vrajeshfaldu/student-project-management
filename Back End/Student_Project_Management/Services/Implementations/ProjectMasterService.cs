using FluentValidation;
using Student_Project_Management.DTOs;
using Student_Project_Management.Helpers;
using Student_Project_Management.Models;
using Student_Project_Management.Repositories.Interfaces;
using Student_Project_Management.Services.Interfaces;

namespace Student_Project_Management.Services.Implementations
{
    public class ProjectMasterService : IProjectMasterService
    {
        #region Dependency Injection

        private readonly IProjectMasterRepository _projectMasterRepository;
        private readonly IValidator<ProjectMasterDTO> _validator;

        public ProjectMasterService(IProjectMasterRepository projectMasterRepository, IValidator<ProjectMasterDTO> validator)
        {
            _projectMasterRepository = projectMasterRepository;
            _validator = validator;
        }

        #endregion

        #region Get All Projects

        public async Task<ApiResponse<object>> GetAllProjectsAsync(
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

                var (items, totalCount) = await _projectMasterRepository.GetPagedAsync(pageNumber, pageSize);

                var totalPages = (int)Math.Ceiling(
                    totalCount / (double)pageSize
                );

                var dtoList = items.Select(x => new ProjectMasterDTO
                {
                    ProjectID = x.ProjectID,
                    ProjectTitle = x.ProjectTitle,
                    Description = x.Description
                }).ToList();

                return new ApiResponse<object>
                (
                    true,
                    "Projects fetched successfully.",
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
                    "Failed to fetch projects.",
                    error: ex.Message
                );
            }
        }

        #endregion

        #region Get Project By Id

        public async Task<ApiResponse<ProjectMasterDTO>> GetProjectByIdAsync(int id)
        {
            try
            {
                var project = await _projectMasterRepository.GetByIdAsync(id);

                if (project == null)
                {
                    return new ApiResponse<ProjectMasterDTO>
                    (
                        false,
                        "Project not found."
                    );
                }

                var dto = new ProjectMasterDTO
                {
                    ProjectID = project.ProjectID,
                    ProjectTitle = project.ProjectTitle,
                    Description = project.Description
                };

                return new ApiResponse<ProjectMasterDTO>
                (
                    true,
                    "Project fetched successfully.",
                    dto
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<ProjectMasterDTO>
                (
                    false,
                    "Something went wrong.",
                    error: ex.Message
                );
            }
        }

        #endregion

        #region Create Project

        public async Task<ApiResponse<ProjectMasterDTO>> CreateProjectAsync(ProjectMasterDTO dto)
        {
            try
            {
                var validationResult = await _validator.ValidateAsync(dto);
                if (!validationResult.IsValid)
                {
                    return new ApiResponse<ProjectMasterDTO>
                    (
                        false,
                        "Validation failed.",
                        error: validationResult.Errors.Select(x => new { propertyName = x.PropertyName, errorMessage = x.ErrorMessage }).ToList()
                    );
                }

                var entity = new ProjectMaster
                {
                    ProjectTitle = dto.ProjectTitle,
                    Description = dto.Description
                };

                await _projectMasterRepository.AddAsync(entity);
                await _projectMasterRepository.SaveChangesAsync();

                dto.ProjectID = entity.ProjectID;

                return new ApiResponse<ProjectMasterDTO>
                (
                    true,
                    "Project created successfully.",
                    dto
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<ProjectMasterDTO>
                (
                    false,
                    "Failed to create project.",
                    error: ex.Message
                );
            }
        }

        #endregion

        #region Update Project

        public async Task<ApiResponse<ProjectMasterDTO>> UpdateProjectAsync(int id, ProjectMasterDTO dto)
        {
            try
            {
                if (id != dto.ProjectID)
                {
                    return new ApiResponse<ProjectMasterDTO>
                    (
                        false,
                        "Project ID mismatch."
                    );
                }

                var validationResult = await _validator.ValidateAsync(dto);
                if (!validationResult.IsValid)
                {
                    return new ApiResponse<ProjectMasterDTO>
                    (
                        false,
                        "Validation failed.",
                        error: validationResult.Errors.Select(x => new { propertyName = x.PropertyName, errorMessage = x.ErrorMessage }).ToList()
                    );
                }

                var exists = await _projectMasterRepository.ExistsAsync(id);

                if (!exists)
                {
                    return new ApiResponse<ProjectMasterDTO>
                    (
                        false,
                        "Project not found."
                    );
                }

                var entity = new ProjectMaster
                {
                    ProjectID = dto.ProjectID,
                    ProjectTitle = dto.ProjectTitle,
                    Description = dto.Description
                };

                _projectMasterRepository.Update(entity);
                await _projectMasterRepository.SaveChangesAsync();

                return new ApiResponse<ProjectMasterDTO>
                (
                    true,
                    "Project updated successfully.",
                    dto
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<ProjectMasterDTO>
                (
                    false,
                    "Failed to update project.",
                    error: ex.Message
                );
            }
        }

        #endregion

        #region Delete Project

        public async Task<ApiResponse<object>> DeleteProjectAsync(int id)
        {
            try
            {
                var entity = await _projectMasterRepository.GetByIdAsync(id);

                if (entity == null)
                {
                    return new ApiResponse<object>
                    (
                        false,
                        "Project not found."
                    );
                }

                _projectMasterRepository.Delete(entity);
                await _projectMasterRepository.SaveChangesAsync();

                return new ApiResponse<object>
                (
                    true,
                    "Project deleted successfully."
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<object>
                (
                    false,
                    "Failed to delete project.",
                    error: ex.Message
                );
            }
        }

        #endregion
    }
}
