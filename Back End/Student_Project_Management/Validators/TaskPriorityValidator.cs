using FluentValidation;
using Student_Project_Management.DTOs;

namespace Student_Project_Management.Validators
{
    public class TaskPriorityValidator : AbstractValidator<TaskPriorityDTO>
    {
        public TaskPriorityValidator()
        {
            RuleFor(x => x.TaskPriorityName)
                .NotEmpty()
                .WithMessage("Task Priority Name is required")
                .Must(name => !string.IsNullOrWhiteSpace(name))
                .WithMessage("Task Priority Name cannot be empty or whitespace")
                .MaximumLength(20)
                .WithMessage("Task Priority Name cannot exceed 20 characters");

            RuleFor(x => x.TaskPriorityCssClass)
                .MaximumLength(100)
                .When(x => !string.IsNullOrWhiteSpace(x.TaskPriorityCssClass))
                .WithMessage("Task Priority CSS Class cannot exceed 100 characters");
        }
    }
}
