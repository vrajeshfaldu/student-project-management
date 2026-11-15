using FluentValidation;
using Student_Project_Management.DTOs;

namespace Student_Project_Management.Validators
{
    public class ProjectAllocationValidator : AbstractValidator<ProjectAllocationDTO>
    {
        public ProjectAllocationValidator()
        {
            RuleFor(x => x.ProjectID)
                .GreaterThan(0)
                .WithMessage("Project is required");

            RuleFor(x => x.StudentID)
                .GreaterThan(0)
                .WithMessage("Student is required");

            RuleFor(x => x.FacultyID)
                .GreaterThan(0)
                .WithMessage("Faculty is required");

            RuleFor(x => x.AssignedDate)
                .NotEmpty()
                .WithMessage("Assigned Date is required");

            RuleFor(x => x.ProjectStartDate)
                .NotEmpty()
                .WithMessage("Project Start Date is required");

            RuleFor(x => x.ProjectEndDate)
                .NotEmpty()
                .WithMessage("Project End Date is required")
                .GreaterThanOrEqualTo(x => x.ProjectStartDate)
                .WithMessage("Project End Date must be on or after Project Start Date");

            RuleFor(x => x.TotalTasksGiven)
                .GreaterThanOrEqualTo(0)
                .WithMessage("Total Tasks Given must be 0 or greater");

            RuleFor(x => x.TotalCompletedTasks)
                .GreaterThanOrEqualTo(0)
                .WithMessage("Total Completed Tasks must be 0 or greater")
                .LessThanOrEqualTo(x => x.TotalTasksGiven)
                .When(x => x.TotalTasksGiven > 0)
                .WithMessage("Total Completed Tasks cannot exceed Total Tasks Given");

            RuleFor(x => x.ProgressPercentage)
                .InclusiveBetween(0, 100)
                .WithMessage("Progress Percentage must be between 0 and 100");

            RuleFor(x => x.OverAllGrade)
                .MaximumLength(1)
                .When(x => !string.IsNullOrWhiteSpace(x.OverAllGrade))
                .WithMessage("Overall Grade cannot exceed 1 character");
        }
    }
}
