"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  attendanceRecordSchema,
  type AttendanceRecordValues,
} from "@/lib/validators/employee";
import type {
  Employee,
  Attendance,
  AttendanceWithEmployee,
  AttendanceStatus,
  AttendanceFilters,
  DailyAttendanceSummary,
} from "@/lib/types/employee";
import type { ActionResult } from "./clients";

export interface EmployeeWithDailyAttendance extends Employee {
  attendanceRecord: Attendance | null;
}

/**
 * Fetch active employees and their attendance records for a specific date,
 * along with daily summary metrics.
 */
export async function getDailyAttendance(
  dateStr?: string
): Promise<{
  date: string;
  employees: EmployeeWithDailyAttendance[];
  summary: DailyAttendanceSummary;
  error?: string;
}> {
  const targetDate = dateStr || new Date().toISOString().split("T")[0];

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        date: targetDate,
        employees: [],
        summary: {
          total_active: 0,
          present: 0,
          absent: 0,
          half_day: 0,
          leave: 0,
          unmarked: 0,
        },
        error: "unauthorized",
      };
    }

    // 1. Fetch active employees
    const { data: employeesData, error: empError } = await supabase
      .from("employees")
      .select("*")
      .eq("is_active", true)
      .order("full_name", { ascending: true });

    if (empError) {
      console.error("[getDailyAttendance] Employees fetch error:", empError.message);
      return {
        date: targetDate,
        employees: [],
        summary: {
          total_active: 0,
          present: 0,
          absent: 0,
          half_day: 0,
          leave: 0,
          unmarked: 0,
        },
        error: empError.message,
      };
    }

    const employees = (employeesData as Employee[]) || [];

    // 2. Fetch attendance records for this date
    const { data: attendanceData, error: attError } = await supabase
      .from("attendance")
      .select("*")
      .eq("attendance_date", targetDate);

    if (attError) {
      console.error("[getDailyAttendance] Attendance fetch error:", attError.message);
    }

    const attendanceRecords = (attendanceData as Attendance[]) || [];
    const attendanceMap = new Map<string, Attendance>();
    attendanceRecords.forEach((att) => {
      attendanceMap.set(att.employee_id, att);
    });

    // 3. Combine employees with their attendance record and compute summary
    let presentCount = 0;
    let absentCount = 0;
    let halfDayCount = 0;
    let leaveCount = 0;
    let unmarkedCount = 0;

    const combined: EmployeeWithDailyAttendance[] = employees.map((emp) => {
      const record = attendanceMap.get(emp.id) || null;
      if (!record) {
        unmarkedCount++;
      } else {
        switch (record.status) {
          case "present":
            presentCount++;
            break;
          case "absent":
            absentCount++;
            break;
          case "half_day":
            halfDayCount++;
            break;
          case "leave":
            leaveCount++;
            break;
        }
      }

      return {
        ...emp,
        attendanceRecord: record,
      };
    });

    const summary: DailyAttendanceSummary = {
      total_active: employees.length,
      present: presentCount,
      absent: absentCount,
      half_day: halfDayCount,
      leave: leaveCount,
      unmarked: unmarkedCount,
    };

    return {
      date: targetDate,
      employees: combined,
      summary,
    };
  } catch (err) {
    console.error("[getDailyAttendance] Unexpected error:", err);
    return {
      date: targetDate,
      employees: [],
      summary: {
        total_active: 0,
        present: 0,
        absent: 0,
        half_day: 0,
        leave: 0,
        unmarked: 0,
      },
      error: "Failed to fetch daily attendance.",
    };
  }
}

/**
 * Mark or update attendance for an employee on a specific date (Upsert)
 */
export async function markAttendanceAction(
  values: AttendanceRecordValues
): Promise<ActionResult<{ id: string; status: AttendanceStatus }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized. Please log in again." };
    }

    const validated = attendanceRecordSchema.safeParse(values);
    if (!validated.success) {
      const firstError = validated.error.errors[0]?.message ?? "Invalid input data";
      return { success: false, error: firstError };
    }

    // Upsert using the UNIQUE constraint (employee_id, attendance_date)
    const { data, error } = await supabase
      .from("attendance")
      .upsert(
        {
          employee_id: validated.data.employee_id,
          attendance_date: validated.data.attendance_date,
          status: validated.data.status,
          notes: validated.data.notes,
          created_by: user.id,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "employee_id,attendance_date",
        }
      )
      .select("id, status")
      .single();

    if (error) {
      console.error("[markAttendanceAction] Upsert error:", error.message);
      return { success: false, error: error.message };
    }

    revalidatePath("/attendance");
    revalidatePath(`/employees/${validated.data.employee_id}`);
    revalidatePath("/dashboard");

    return {
      success: true,
      data: { id: data.id, status: data.status as AttendanceStatus },
    };
  } catch (err) {
    console.error("[markAttendanceAction] Unexpected error:", err);
    return { success: false, error: "An unexpected error occurred while recording attendance." };
  }
}

/**
 * Fetch attendance history with filters (Date, Month, Employee, Status)
 */
export async function getAttendanceHistory(
  filters: AttendanceFilters = {}
): Promise<{ records: AttendanceWithEmployee[]; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { records: [], error: "unauthorized" };
    }

    let query = supabase.from("attendance").select(`
      *,
      employee:employees (
        id,
        employee_code,
        full_name,
        phone,
        designation,
        is_active,
        salary_type,
        salary_amount
      )
    `);

    // Specific date filter
    if (filters.date) {
      query = query.eq("attendance_date", filters.date);
    } else if (filters.month) {
      // e.g. "2026-09" -> >= 2026-09-01 and <= 2026-09-31
      const [year, month] = filters.month.split("-");
      const startDate = `${year}-${month}-01`;
      const nextMonthYear = Number(month) === 12 ? Number(year) + 1 : Number(year);
      const nextMonthVal = Number(month) === 12 ? "01" : String(Number(month) + 1).padStart(2, "0");
      const endDate = `${nextMonthYear}-${nextMonthVal}-01`;

      query = query.gte("attendance_date", startDate).lt("attendance_date", endDate);
    }

    // Employee filter
    if (filters.employee_id && filters.employee_id !== "all") {
      query = query.eq("employee_id", filters.employee_id);
    }

    // Status filter
    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    query = query
      .order("attendance_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(200);

    const { data, error } = await query;

    if (error) {
      console.error("[getAttendanceHistory] Error:", error.message);
      return { records: [], error: error.message };
    }

    return { records: (data as AttendanceWithEmployee[]) || [] };
  } catch (err) {
    console.error("[getAttendanceHistory] Unexpected error:", err);
    return { records: [], error: "Failed to fetch attendance history." };
  }
}

/**
 * Fetch attendance records for a specific employee
 */
export async function getEmployeeAttendanceHistory(
  employeeId: string,
  limit = 30
): Promise<{ records: Attendance[]; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { records: [], error: "unauthorized" };
    }

    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("employee_id", employeeId)
      .order("attendance_date", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[getEmployeeAttendanceHistory] Error:", error.message);
      return { records: [], error: error.message };
    }

    return { records: (data as Attendance[]) || [] };
  } catch (err) {
    console.error("[getEmployeeAttendanceHistory] Unexpected error:", err);
    return { records: [], error: "Failed to fetch employee attendance records." };
  }
}
