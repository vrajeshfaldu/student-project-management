using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data;

namespace Student_Project_Management.Models
{
    public class UserRole
    {
        [Key]
        public int RolePermissionID { get; set; }

        [Required]
        [ForeignKey(nameof(RoleID))]
        public int RoleID { get; set; }

        [Required]
        [ForeignKey(nameof(UserID))]
        public int UserID { get; set; }

        // Navigation Properties
        public Role? Role { get; set; }
        public User? User { get; set; }
    }
}
