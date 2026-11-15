using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Student_Project_Management.Models
{
    public class User
    {
        [Key]
        public int UserID { get; set; }

        [Required]
        [ForeignKey(nameof(UserTypeID))]
        public int UserTypeID { get; set; }

        [Required]
        [StringLength(150)]
        public string FullName { get; set; } = string.Empty;

        [StringLength(100)]
        public string? UserCode { get; set; }

        [Required]
        [StringLength(150)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;

        [Required]
        [StringLength(15)]
        public string MobileNumber { get; set; } = string.Empty;

        [Required]
        [StringLength(500)]
        public string ProfilePicturePath { get; set; } = string.Empty;

        [Required]
        public bool IsActive { get; set; }

        public bool? IsDeleted { get; set; }

        // Navigation Property
        
        public UserType? UserType { get; set; }

        // Navigation Property
        public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();

        // Student Project Allocations
        public ICollection<ProjectAllocation> StudentProjectAllocations { get; set; } = new List<ProjectAllocation>();

        // Faculty Project Allocations
        public ICollection<ProjectAllocation> FacultyProjectAllocations { get; set; } = new List<ProjectAllocation>();
    }      
}
