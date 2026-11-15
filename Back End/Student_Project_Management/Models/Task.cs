using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Student_Project_Management.Models
{
    public class Task
    {
        [Key]
        public int TaskID { get; set; }

        [Required]
        [ForeignKey(nameof(ProjectAllocationID))]
        public int ProjectAllocationID { get; set; }

        [Required]
        [StringLength(200)]
        public string TaskTitle { get; set; } = string.Empty;

        public string? TaskDescription { get; set; }

        [Required]
        [ForeignKey(nameof(TaskStatusID))]
        public int TaskStatusID { get; set; }

        [Required]
        [ForeignKey(nameof(TaskPriorityID))]
        public int TaskPriorityID { get; set; }

        [Required]
        [Column(TypeName = "decimal(5,2)")]
        public decimal AssignedScore { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal? EarnedScore { get; set; }

        [Required]
        [Column(TypeName = "decimal(5,2)")]
        public decimal ProgressPercentage { get; set; }

        [Required]
        public DateTime TaskAssignedDate { get; set; }

        public DateTime? TaskStartDate { get; set; }

        public DateTime? TaskDueDate { get; set; }

        public DateTime? TaskCompletedDate { get; set; }

        public DateTime? NextFollowUpDate { get; set; }

        [StringLength(500)]
        public string? FacultyRemarks { get; set; }

        [StringLength(500)]
        public string? StudentRemarks { get; set; }

        // Navigation Properties
        public ProjectAllocation? ProjectAllocation { get; set; }
        public TaskStatus? TaskStatus { get; set; }
        public TaskPriority? TaskPriority { get; set; }
    }
}
