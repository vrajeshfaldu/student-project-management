using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Student_Project_Management.Models
{
    public class ProjectAllocation
    {
        [Key]
        public int ProjectAllocationID { get; set; }

        [Required]
        [ForeignKey(nameof(ProjectID))]
        public int ProjectID { get; set; }

        [Required]
        [ForeignKey(nameof(StudentID))]
        public int StudentID { get; set; }

        [Required]
        [ForeignKey(nameof(FacultyID))]
        public int FacultyID { get; set; }

        [Required]
        public DateTime AssignedDate { get; set; } = DateTime.Now;

        [Required]
        public DateTime ProjectStartDate { get; set; }

        [Required]
        public DateTime ProjectEndDate { get; set; }

        [Required]
        public int TotalTasksGiven { get; set; } = 0;

        [Required]
        public int TotalCompletedTasks { get; set; } = 0;

        [Required]
        [Column(TypeName = "decimal(5,2)")]
        public decimal ProgressPercentage { get; set; } = 0;

        [StringLength(1)]
        public string? OverAllGrade { get; set; }

        // Navigation Properties
        public ProjectMaster? Project { get; set; }
        public User? Student { get; set; }
        public User? Faculty { get; set; }
        public ICollection<Task> Tasks { get; set; } = new List<Task>();
    }
}
