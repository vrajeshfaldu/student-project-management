using FluentValidation;
using Student_Project_Management.DTOs;

namespace Student_Project_Management.Validators
{
    public class ProjectMasterValidator : AbstractValidator<ProjectMasterDTO>
    {
        public ProjectMasterValidator()
        {
            RuleFor(x => x.ProjectTitle)
                .NotEmpty()
                .WithMessage("Project Title is required")
                .Must(title => !string.IsNullOrWhiteSpace(title))
                .WithMessage("Project Title cannot be empty or whitespace")
                .MaximumLength(200)
                .WithMessage("Project Title cannot exceed 200 characters");

            RuleFor(x => x.Description)
                .MaximumLength(1000)
                .When(x => !string.IsNullOrWhiteSpace(x.Description))
                .WithMessage("Description cannot exceed 1000 characters");
        }
    }
}
