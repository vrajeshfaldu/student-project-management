using FluentValidation;
using Student_Project_Management.DTOs;

namespace Student_Project_Management.Validators
{
    public class UserTypeValidator : AbstractValidator<UserTypeDTO>
    {
        public UserTypeValidator()
        {
            RuleFor(x => x.UserTypeName)
                .NotEmpty()
                .WithMessage("User Type Name is required")
                .Must(name => !string.IsNullOrWhiteSpace(name))
                .WithMessage("User Type Name cannot be empty or whitespace")
                .MaximumLength(50)
                .WithMessage("User Type Name cannot exceed 50 characters");

            RuleFor(x => x.Description)
                .MaximumLength(250)
                .When(x => !string.IsNullOrWhiteSpace(x.Description))
                .WithMessage("Description cannot exceed 250 characters");
        }
    }
}
