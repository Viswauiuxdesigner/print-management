"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { employeeSchema, type EmployeeFormValues } from "@/lib/validators/employee";
import type { Employee, EmployeeFilters } from "@/lib/types/employee";
import type { ActionResult } from "./clients";

/**
 * Fetch all employees with optional search, status filtering, and sorting
 */
export async function getEmployees(
  filters: EmployeeFilters = {}
): Promise<{ employees: Employee[]; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { employees: [], error: "unauthorized" };
    }

    let query = supabase.from("employees").select("*");

    // Status filter
    if (filters.status === "active") {
      query = query.eq("is_active", true);
    } else if (filters.status === "inactive") {
      query = query.eq("is_active", false);
    }

    // Text search (name, phone, designation, employee_code)
    if (filters.query && filters.query.trim().length > 0) {
      const q = filters.query.trim();
      query = query.or(
        `full_name.ilike.%${q}%,phone.ilike.%${q}%,designation.ilike.%${q}%,employee_code.ilike.%${q}%`
      );
    }

    // Sorting
    const sortField = filters.sortBy || "full_name";
    const sortOrder = filters.sortOrder || "asc";
    query = query.order(sortField, { ascending: sortOrder === "asc" });

    const { data, error } = await query;

    if (error) {
      console.error("[getEmployees] Error:", error.message);
      return { employees: [], error: error.message };
    }

    return { employees: (data as Employee[]) ?? [] };
  } catch (err) {
    console.error("[getEmployees] Unexpected error:", err);
    return { employees: [], error: "Failed to fetch employees" };
  }
}

/**
 * Fetch single employee by ID
 */
export async function getEmployeeById(
  id: string
): Promise<{ employee: Employee | null; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { employee: null, error: "unauthorized" };
    }

    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("[getEmployeeById] Error:", error.message);
      return { employee: null, error: error.message };
    }

    return { employee: data as Employee };
  } catch (err) {
    console.error("[getEmployeeById] Unexpected error:", err);
    return { employee: null, error: "Failed to fetch employee details" };
  }
}

/**
 * Create a new employee
 */
export async function createEmployeeAction(
  values: EmployeeFormValues
): Promise<ActionResult<{ id: string; employee_code: string }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized. Please log in again." };
    }

    const validated = employeeSchema.safeParse(values);
    if (!validated.success) {
      const firstError = validated.error.errors[0]?.message ?? "Invalid input data";
      return { success: false, error: firstError };
    }

    const { data, error } = await supabase
      .from("employees")
      .insert({
        full_name: validated.data.full_name,
        phone: validated.data.phone,
        alternate_phone: validated.data.alternate_phone,
        email: validated.data.email,
        address: validated.data.address,
        designation: validated.data.designation,
        joining_date: validated.data.joining_date,
        salary_type: validated.data.salary_type,
        salary_amount: validated.data.salary_amount,
        notes: validated.data.notes,
        created_by: user.id,
        updated_by: user.id,
      })
      .select("id, employee_code")
      .single();

    if (error) {
      console.error("[createEmployeeAction] Insert error:", error.message);
      return { success: false, error: error.message };
    }

    revalidatePath("/employees");
    revalidatePath("/attendance");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: { id: data.id, employee_code: data.employee_code },
    };
  } catch (err) {
    console.error("[createEmployeeAction] Unexpected error:", err);
    return { success: false, error: "An unexpected error occurred while adding the employee." };
  }
}

/**
 * Update an existing employee
 */
export async function updateEmployeeAction(
  id: string,
  values: EmployeeFormValues
): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized. Please log in again." };
    }

    const validated = employeeSchema.safeParse(values);
    if (!validated.success) {
      const firstError = validated.error.errors[0]?.message ?? "Invalid input data";
      return { success: false, error: firstError };
    }

    const { error } = await supabase
      .from("employees")
      .update({
        full_name: validated.data.full_name,
        phone: validated.data.phone,
        alternate_phone: validated.data.alternate_phone,
        email: validated.data.email,
        address: validated.data.address,
        designation: validated.data.designation,
        joining_date: validated.data.joining_date,
        salary_type: validated.data.salary_type,
        salary_amount: validated.data.salary_amount,
        notes: validated.data.notes,
        updated_by: user.id,
      })
      .eq("id", id);

    if (error) {
      console.error("[updateEmployeeAction] Update error:", error.message);
      return { success: false, error: error.message };
    }

    revalidatePath("/employees");
    revalidatePath(`/employees/${id}`);
    revalidatePath("/attendance");
    revalidatePath("/dashboard");

    return { success: true, data: { id } };
  } catch (err) {
    console.error("[updateEmployeeAction] Unexpected error:", err);
    return { success: false, error: "An unexpected error occurred while updating the employee." };
  }
}

/**
 * Soft deactivate or reactivate an employee
 */
export async function toggleEmployeeStatusAction(
  id: string,
  isActive: boolean
): Promise<ActionResult<{ is_active: boolean }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized. Please log in again." };
    }

    const { error } = await supabase
      .from("employees")
      .update({
        is_active: isActive,
        updated_by: user.id,
      })
      .eq("id", id);

    if (error) {
      console.error("[toggleEmployeeStatusAction] Error:", error.message);
      return { success: false, error: error.message };
    }

    revalidatePath("/employees");
    revalidatePath(`/employees/${id}`);
    revalidatePath("/attendance");
    revalidatePath("/dashboard");

    return { success: true, data: { is_active: isActive } };
  } catch (err) {
    console.error("[toggleEmployeeStatusAction] Unexpected error:", err);
    return { success: false, error: "Failed to update employee status." };
  }
}
