using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Student_Project_Management.Models
{
    public class UserType
    {
        [Key]
        public int UserTypeID { get; set; }

        [Required]
        [StringLength(50)]
        public string UserTypeName { get; set; } = string.Empty;

        [StringLength(250)]
        public string? Description { get; set; }

        // Navigation Property
        public ICollection<User> Users { get; set; } = new List<User>();
    }
}
