using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Student_Project_Management.Data;
using Student_Project_Management.DTOs;

namespace Student_Project_Management.Validators
{
    public class UserValidator : AbstractValidator<UserDTO>
    {
        private readonly AppDbContext _context;
        public UserValidator(AppDbContext context)
        {
            _context = context;

            // User Type
            RuleFor(x => x.UserTypeID)
                .GreaterThan(0)
                .WithMessage("User Type is required.");

            // Full Name
            RuleFor(x => x.FullName)
                .NotEmpty()
                .WithMessage("Full Name is required.")
                .Must(x => !string.IsNullOrWhiteSpace(x))
                .WithMessage("Full Name cannot be empty or whitespace.")
                .MaximumLength(100)
                .WithMessage("Full Name cannot exceed 100 characters.");

            // User Code
            RuleFor(x => x.UserCode)
                .NotEmpty()
                .WithMessage("User Code is required.")
                .Must(x => !string.IsNullOrWhiteSpace(x))
                .WithMessage("User Code cannot be empty or whitespace.")
                .MaximumLength(50)
                .WithMessage("User Code cannot exceed 50 characters.")
                .MustAsync(async (user, userCode, cancellationToken) =>
                    !await _context.Users.AnyAsync(
                        u => u.UserCode == userCode &&
                             u.UserID != user.UserID,
                        cancellationToken))
                .WithMessage("User Code already exists.");

            // Email
            RuleFor(x => x.Email)
                .NotEmpty()
                .WithMessage("Email is required.")
                .Must(x => !string.IsNullOrWhiteSpace(x))
                .WithMessage("Email cannot be empty or whitespace.")
                .EmailAddress()
                .WithMessage("A valid email address is required.")
                .MaximumLength(150)
                .WithMessage("Email cannot exceed 150 characters.")
                .MustAsync(async (user, email, cancellationToken) =>
                    !await _context.Users.AnyAsync(
                        u => u.Email == email &&
                             u.UserID != user.UserID,
                        cancellationToken))
                .WithMessage("Email already exists.");

            // Password
            RuleFor(x => x.Password)
                .NotEmpty()
                .WithMessage("Password is required.")
                .Must(x => !string.IsNullOrWhiteSpace(x))
                .WithMessage("Password cannot be empty or whitespace.")
                .MinimumLength(6)
                .WithMessage("Password must be at least 6 characters.")
                .MaximumLength(100)
                .WithMessage("Password cannot exceed 100 characters.");

            // Mobile Number
            RuleFor(x => x.MobileNumber)
                .NotEmpty()
                .WithMessage("Mobile Number is required.")
                .Must(x => !string.IsNullOrWhiteSpace(x))
                .WithMessage("Mobile Number cannot be empty or whitespace.")
                .Matches(@"^[6-9]\d{9}$")
                .WithMessage("Mobile Number must be a valid 10-digit number.")
                .MustAsync(async (user, mobileNumber, cancellationToken) =>
                    !await _context.Users.AnyAsync(u => u.MobileNumber == mobileNumber && u.UserID != user.UserID,
                        cancellationToken))
                .WithMessage("Mobile Number already exists.");

            // Profile Picture Path
            RuleFor(x => x.ProfilePicturePath)
                .MaximumLength(500)
                .WithMessage("Profile Picture Path cannot exceed 500 characters.");

            // IsActive
            RuleFor(x => x.IsActive)
                .NotNull()
                .WithMessage("IsActive is required.");
        }
    }
}
