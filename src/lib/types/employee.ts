export type SalaryType = "monthly" | "daily";

export type AttendanceStatus = "present" | "absent" | "half_day" | "leave";

export interface Employee {
  id: string;
  employee_code: string;
  full_name: string;
  phone: string | null;
  alternate_phone: string | null;
  email: string | null;
  address: string | null;
  designation: string | null;
  joining_date: string | null;
  salary_type: SalaryType;
  salary_amount: number;
  notes: string | null;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  employee_id: string;
  attendance_date: string;
  status: AttendanceStatus;
  notes: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttendanceWithEmployee extends Attendance {
  employee: Employee;
}

export interface EmployeeFilters {
  query?: string;
  status?: "all" | "active" | "inactive";
  sortBy?: "full_name" | "employee_code" | "created_at";
  sortOrder?: "asc" | "desc";
}

export interface AttendanceFilters {
  date?: string;
  month?: string; // e.g. "2026-09"
  employee_id?: string;
  status?: AttendanceStatus | "all";
}

export interface DailyAttendanceSummary {
  total_active: number;
  present: number;
  absent: number;
  half_day: number;
  leave: number;
  unmarked: number;
}
