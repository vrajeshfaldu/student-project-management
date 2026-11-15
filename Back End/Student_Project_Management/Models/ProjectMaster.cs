using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Student_Project_Management.Models
{
    public class ProjectMaster
    {
        [Key]
        public int ProjectID { get; set; }

        [Required]
        [StringLength(200)]
        public string ProjectTitle { get; set; } = string.Empty;

        public string? Description { get; set; }

        // Navigation Property
        public ICollection<ProjectAllocation> ProjectAllocations { get; set; } = new List<ProjectAllocation>();
    }
}
