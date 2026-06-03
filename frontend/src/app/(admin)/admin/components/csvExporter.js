import toast from "react-hot-toast";

export const exportToCSV = (data, filename = "export.csv") => {
  if (!data || data.length === 0) {
    toast.error("No data available to export.");
  }

  // Extract keys from the first object to serve as CSV headers
  const headers = Object.keys(data[0]);

  // Map through objects to format rows
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((headerField) => {
          const value = row[headerField];

          // Clean data: Stringify objects/arrays. Escape double quotes, handle commas safely
          let stringifiedValue =
            typeof value === "object" && value !== null
              ? JSON.stringify(value)
              : String(value ?? "");

          stringifiedValue = stringifiedValue.replace(/"/g, '""'); // Escape inner quotes

          // Wrap in quotes if text contains commas, new lines and quotes
          if (/[",\n]/.test(stringifiedValue)) {
            stringifiedValue = `"${stringifiedValue}"`;
          }

          return stringifiedValue;
        })
        .join(","),
    ),
  ];

  // Create a Blob from the CSV data payload
  const csvContent = "\uFEFF" + csvRows.join("\n"); // \uFEFF fixes Excel encoding issues
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  // Trigger browser download anchor link
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
