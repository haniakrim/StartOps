import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRealtimeTable } from "@/hooks/useRealtime";

export interface StaffMember {
  id: string;
  organization_id: string;
  name: string;
  job_title: string;
  zone: "Zone 1" | "Zone 2" | "Aml" | "HQ";
  department: "Medical" | "Nursing" | "Dental" | "Radiology" | "Operations" | "Patient Experience" | "Clinical" | "Finance" | "HR" | "IT";
  phone: string | null;
  email: string | null;
  photo_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export const staffKeys = {
  all: (orgId: string | null) => ["staff-directory", orgId] as const,
};

const ZONES = ["Zone 1", "Zone 2", "Aml", "HQ"] as const;
const DEPARTMENTS = ["Medical", "Nursing", "Dental", "Radiology", "Operations", "Patient Experience", "Clinical", "Finance", "HR", "IT"] as const;

export { ZONES, DEPARTMENTS };

async function fetchStaff(orgId: string | null): Promise<StaffMember[]> {
  let query = supabase
    .from("staff_directory")
    .select("*")
    .order("created_at", { ascending: false });
  if (orgId) {
    query = query.eq("organization_id", orgId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function createStaff(staff: Omit<StaffMember, "id" | "created_at" | "updated_at">): Promise<StaffMember> {
  const { data, error } = await supabase.from("staff_directory").insert(staff).select().single();
  if (error) throw error;
  return data;
}

async function updateStaff(id: string, updates: Partial<StaffMember>): Promise<StaffMember> {
  const { data, error } = await supabase.from("staff_directory").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

async function deleteStaff(id: string): Promise<void> {
  const { error } = await supabase.from("staff_directory").delete().eq("id", id);
  if (error) throw error;
}

export function useStaffDirectory(orgId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: staffKeys.all(orgId),
    queryFn: () => fetchStaff(orgId),
    enabled: true,
    staleTime: 1000 * 60 * 2,
  });

  useRealtimeTable("staff_directory", () => {
    queryClient.invalidateQueries({ queryKey: staffKeys.all(orgId) });
  }, [orgId], orgId);

  return {
    staff: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-directory"] });
      toast.success("Staff member added successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to add staff member: " + error.message);
    },
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<StaffMember> }) => updateStaff(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-directory"] });
      toast.success("Staff member updated successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to update staff member: " + error.message);
    },
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-directory"] });
      toast.success("Staff member removed");
    },
    onError: (error: any) => {
      toast.error("Failed to remove staff member: " + error.message);
    },
  });
}
