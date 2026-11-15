namespace Student_Project_Management.DTOs
{
    public class TaskPriorityDTO
    {
        public int TaskPriorityID { get; set; }
        public string TaskPriorityName { get; set; } = string.Empty;
        public string? TaskPriorityCssClass { get; set; }
    }
}
