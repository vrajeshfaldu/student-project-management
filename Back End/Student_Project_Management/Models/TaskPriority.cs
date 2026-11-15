using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Student_Project_Management.Models
{
    public class TaskPriority
    {
        [Key]
        public int TaskPriorityID { get; set; }

        [Required]
        [StringLength(20)]
        public string TaskPriorityName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string TaskPriorityCssClass { get; set; } = string.Empty;

        // Navigation Property
        public ICollection<Task> Tasks { get; set; } = new List<Task>();
    }
}
