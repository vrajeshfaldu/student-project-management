using System;
using System.IO;

namespace Student_Project_Management.Helpers
{
    public static class DotEnv
    {
        public static void Load(string? filePath = null)
        {
            var path = filePath ?? FindEnvFile();
            if (string.IsNullOrEmpty(path) || !File.Exists(path))
            {
                return;
            }

            foreach (var line in File.ReadAllLines(path))
            {
                var trimmed = line.Trim();
                if (string.IsNullOrWhiteSpace(trimmed) || trimmed.StartsWith("#"))
                {
                    continue;
                }

                var index = trimmed.IndexOf('=');
                if (index <= 0)
                {
                    continue;
                }

                var key = trimmed.Substring(0, index).Trim();
                var value = trimmed.Substring(index + 1).Trim();

                if ((value.StartsWith("\"") && value.EndsWith("\"")) ||
                    (value.StartsWith("'") && value.EndsWith("'")))
                {
                    value = value.Substring(1, value.Length - 2);
                }

                Environment.SetEnvironmentVariable(key, value);

                // Normalise common variations for ASP.NET Core configuration
                if (key.Equals("DEFAULT_CONNECTION", StringComparison.OrdinalIgnoreCase) ||
                    key.Equals("DefaultConnection", StringComparison.OrdinalIgnoreCase))
                {
                    Environment.SetEnvironmentVariable("ConnectionStrings__DefaultConnection", value);
                }
                else if (key.Equals("JWT_KEY", StringComparison.OrdinalIgnoreCase))
                {
                    Environment.SetEnvironmentVariable("Jwt__Key", value);
                }
            }
        }

        public static string? FindEnvFile()
        {
            // Search upward from current working directory
            var dir = new DirectoryInfo(Directory.GetCurrentDirectory());
            while (dir != null)
            {
                var path = Path.Combine(dir.FullName, ".env");
                if (File.Exists(path))
                {
                    return path;
                }

                var subfolderPath = Path.Combine(dir.FullName, "Back End", "Student_Project_Management", ".env");
                if (File.Exists(subfolderPath))
                {
                    return subfolderPath;
                }

                dir = dir.Parent;
            }

            // Search upward from application binary directory
            var appDir = new DirectoryInfo(AppContext.BaseDirectory);
            while (appDir != null)
            {
                var path = Path.Combine(appDir.FullName, ".env");
                if (File.Exists(path))
                {
                    return path;
                }
                appDir = appDir.Parent;
            }

            return null;
        }
    }
}
