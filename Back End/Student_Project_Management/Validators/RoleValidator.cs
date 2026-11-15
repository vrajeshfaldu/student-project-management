using FluentValidation;
using Student_Project_Management.DTOs;

namespace Student_Project_Management.Validators
{
    public class RoleValidator : AbstractValidator<RoleDTO>
    {
        public RoleValidator()
        {
            RuleFor(x => x.RoleName)
                .NotEmpty()
                .WithMessage("Role Name is required")
                .Must(name => !string.IsNullOrWhiteSpace(name))
                .WithMessage("Role Name cannot be empty or whitespace")
                .Must(name => !name.Any(char.IsDigit))
                .WithMessage("Role Name cannot contain digits")
                .MaximumLength(50)
                .WithMessage("Role Name cannot exceed 50 characters");

            RuleFor(x => x.Description)
                .MaximumLength(250)
                .When(x => !string.IsNullOrWhiteSpace(x.Description))
                .WithMessage("Description cannot exceed 250 characters");
        }
    }
}
