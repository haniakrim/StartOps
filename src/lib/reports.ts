import { toast } from "sonner";

export interface DateRange {
  label: string;
  start: string;
  end: string;
}

export const dateRanges: DateRange[] = [
  {
    label: "Last 7 days",
    start: new Date(Date.now() - 7 * 86400000).toISOString(),
    end: new Date().toISOString(),
  },
  {
    label: "Last 30 days",
    start: new Date(Date.now() - 30 * 86400000).toISOString(),
    end: new Date().toISOString(),
  },
  {
    label: "This quarter",
    start: new Date(
      new Date().getFullYear(),
      Math.floor(new Date().getMonth() / 3) * 3,
      1
    ).toISOString(),
    end: new Date().toISOString(),
  },
  {
    label: "This year",
    start: new Date(new Date().getFullYear(), 0, 1).toISOString(),
    end: new Date().toISOString(),
  },
  {
    label: "All time",
    start: new Date(2020, 0, 1).toISOString(),
    end: new Date().toISOString(),
  },
];

export const COLORS = [
  "#6452db",
  "#ff8964",
  "#5683da",
  "#8dc572",
  "#f0ad4e",
  "#be6464",
];

export const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-blue-500/15 text-blue-600",
  paid: "bg-emerald-500/15 text-emerald-600",
  overdue: "bg-red-500/15 text-red-600",
  pending: "bg-yellow-500/15 text-yellow-600",
  open: "bg-blue-500/15 text-blue-600",
  completed: "bg-emerald-500/15 text-emerald-600",
  cancelled: "bg-red-500/15 text-red-600",
};

export function downloadCSV(
  data: Record<string, any>[],
  filename: string
) {
  if (data.length === 0) {
    toast.error("No data to export");
    return;
  }
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`)
        .join(",")
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Report downloaded");
}