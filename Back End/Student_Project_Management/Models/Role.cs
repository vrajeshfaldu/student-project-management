using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Student_Project_Management.Models
{
    public class Role
    {
        [Key]
        public int RoleID { get; set; }

        [Required]
        [StringLength(50)]
        public string RoleName { get; set; } = string.Empty;

        [StringLength(250)]
        public string? Description { get; set; }

        // Navigation Property
        public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    }
}
