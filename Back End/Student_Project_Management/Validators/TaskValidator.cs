using FluentValidation;
using Student_Project_Management.DTOs;

namespace Student_Project_Management.Validators
{
    public class TaskValidator : AbstractValidator<TaskDTO>
    {
        public TaskValidator()
        {
            RuleFor(x => x.ProjectAllocationID)
                .GreaterThan(0)
                .WithMessage("Project Allocation is required");

            RuleFor(x => x.TaskTitle)
                .NotEmpty()
                .WithMessage("Task Title is required")
                .Must(title => !string.IsNullOrWhiteSpace(title))
                .WithMessage("Task Title cannot be empty or whitespace")
                .MaximumLength(200)
                .WithMessage("Task Title cannot exceed 200 characters");

            RuleFor(x => x.TaskDescription)
                .MaximumLength(2000)
                .When(x => !string.IsNullOrWhiteSpace(x.TaskDescription))
                .WithMessage("Task Description cannot exceed 2000 characters");

            RuleFor(x => x.TaskStatusID)
                .GreaterThan(0)
                .WithMessage("Task Status is required");

            RuleFor(x => x.TaskPriorityID)
                .GreaterThan(0)
                .WithMessage("Task Priority is required");

            RuleFor(x => x.AssignedScore)
                .GreaterThanOrEqualTo(0)
                .WithMessage("Assigned Score must be 0 or greater");

            RuleFor(x => x.EarnedScore)
                .GreaterThanOrEqualTo(0)
                .When(x => x.EarnedScore.HasValue)
                .WithMessage("Earned Score must be 0 or greater")
                .LessThanOrEqualTo(x => x.AssignedScore)
                .When(x => x.EarnedScore.HasValue)
                .WithMessage("Earned Score cannot exceed Assigned Score");

            RuleFor(x => x.ProgressPercentage)
                .InclusiveBetween(0, 100)
                .WithMessage("Progress Percentage must be between 0 and 100");

            RuleFor(x => x.TaskAssignedDate)
                .NotEmpty()
                .WithMessage("Task Assigned Date is required");

            RuleFor(x => x.TaskDueDate)
                .GreaterThanOrEqualTo(x => x.TaskStartDate ?? x.TaskAssignedDate)
                .When(x => x.TaskDueDate.HasValue)
                .WithMessage("Task Due Date must be on or after Task Start Date or Assigned Date");

            RuleFor(x => x.FacultyRemarks)
                .MaximumLength(500)
                .When(x => !string.IsNullOrWhiteSpace(x.FacultyRemarks))
                .WithMessage("Faculty Remarks cannot exceed 500 characters");

            RuleFor(x => x.StudentRemarks)
                .MaximumLength(500)
                .When(x => !string.IsNullOrWhiteSpace(x.StudentRemarks))
                .WithMessage("Student Remarks cannot exceed 500 characters");
        }
    }
}
