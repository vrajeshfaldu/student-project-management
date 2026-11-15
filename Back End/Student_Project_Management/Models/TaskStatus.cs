using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Student_Project_Management.Models
{
    public class TaskStatus
    {
        [Key]
        public int TaskStatusID { get; set; }

        [Required]
        [StringLength(20)]
        public string TaskStatusName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string TaskStatusCssClass { get; set; } = string.Empty;

        // Navigation Property
        public ICollection<Task> Tasks { get; set; } = new List<Task>();
    }
}
