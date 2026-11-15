using FluentValidation;
using Student_Project_Management.DTOs;

namespace Student_Project_Management.Validators
{
    public class TaskStatusValidator : AbstractValidator<TaskStatusDTO>
    {
        public TaskStatusValidator()
        {
            RuleFor(x => x.TaskStatusName)
                .NotEmpty()
                .WithMessage("Task Status Name is required")
                .Must(name => !string.IsNullOrWhiteSpace(name))
                .WithMessage("Task Status Name cannot be empty or whitespace")
                .MaximumLength(20)
                .WithMessage("Task Status Name cannot exceed 20 characters");

            RuleFor(x => x.TaskStatusCssClass)
                .NotEmpty()
                .WithMessage("Task Status CSS Class is required")
                .Must(name => !string.IsNullOrWhiteSpace(name))
                .WithMessage("Task Status CSS Class cannot be empty or whitespace")
                .MaximumLength(100)
                .WithMessage("Task Status CSS Class cannot exceed 100 characters");
        }
    }
}
