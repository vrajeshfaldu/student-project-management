using FluentValidation;
using Student_Project_Management.DTOs;

namespace Student_Project_Management.Validators
{
    public class UserRoleValidator : AbstractValidator<UserRoleDTO>
    {
        public UserRoleValidator()
        {
            RuleFor(x => x.RoleID)
                .GreaterThan(0)
                .WithMessage("Role is required");

            RuleFor(x => x.UserID)
                .GreaterThan(0)
                .WithMessage("User is required");
        }
    }
}
