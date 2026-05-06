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
  draft: "bg-white/10 text-white/50",
  sent: "bg-[#5683da]/20 text-[#5683da]",
  paid: "bg-[#8dc572]/20 text-[#8dc572]",
  overdue: "bg-[#be6464]/20 text-[#be6464]",
  pending: "bg-[#f0ad4e]/20 text-[#f0ad4e]",
  open: "bg-[#5683da]/20 text-[#5683da]",
  completed: "bg-[#8dc572]/20 text-[#8dc572]",
  cancelled: "bg-[#be6464]/20 text-[#be6464]",
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