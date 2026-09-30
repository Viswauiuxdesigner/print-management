"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  salaryPaymentSchema,
  generateSalarySchema,
  type SalaryPaymentFormValues,
  type GenerateSalaryFormValues,
} from "@/lib/validators/salary";
import type {
  SalaryRecord,
  SalaryRecordWithEmployee,
  SalaryPayment,
  PayrollSummary,
  SalaryFilters,
  SalaryStatus,
} from "@/lib/types/salary";
import type { Employee } from "@/lib/types/employee";
import { calculatePayroll, getDaysInMonth, roundCurrency } from "@/lib/payroll/calculations";
import type { ActionResult } from "./clients";

/**
 * Fetch monthly aggregate summary for the payroll dashboard
 */
export async function getPayrollSummary(
  year: number,
  month: number
): Promise<{ summary: PayrollSummary; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        summary: {
          payroll_year: year,
          payroll_month: month,
          total_employees: 0,
          total_gross_salary: 0,
          total_net_salary: 0,
          total_paid_amount: 0,
          total_pending_amount: 0,
          total_advances_amount: 0,
          paid_records_count: 0,
          pending_records_count: 0,
          partially_paid_count: 0,
        },
        error: "unauthorized",
      };
    }

    // 1. Fetch salary records for this month
    const { data: salaryData, error: salError } = await supabase
      .from("salary_records")
      .select("gross_salary, net_salary, paid_amount, pending_amount, status")
      .eq("payroll_year", year)
      .eq("payroll_month", month);

    if (salError) {
      console.error("[getPayrollSummary] Error:", salError.message);
    }

    const records = (salaryData as { gross_salary: number; net_salary: number; paid_amount: number; pending_amount: number; status: SalaryStatus }[]) || [];

    let totalGross = 0;
    let totalNet = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let partialCount = 0;

    records.forEach((rec) => {
      totalGross += Number(rec.gross_salary || 0);
      totalNet += Number(rec.net_salary || 0);
      totalPaid += Number(rec.paid_amount || 0);
      totalPending += Number(rec.pending_amount || 0);

      if (rec.status === "paid") {
        paidCount++;
      } else if (rec.status === "partially_paid") {
        partialCount++;
      } else {
        pendingCount++;
      }
    });

    // 2. Fetch advances given in this calendar month
    const monthStr = String(month).padStart(2, "0");
    const startDate = `${year}-${monthStr}-01`;
    const daysInM = getDaysInMonth(year, month);
    const endDate = `${year}-${monthStr}-${String(daysInM).padStart(2, "0")}`;

    const { data: advData } = await supabase
      .from("salary_advances")
      .select("amount")
      .gte("advance_date", startDate)
      .lte("advance_date", endDate);

    const advances = (advData as { amount: number }[]) || [];
    const totalAdvances = advances.reduce((sum, a) => sum + Number(a.amount || 0), 0);

    return {
      summary: {
        payroll_year: year,
        payroll_month: month,
        total_employees: records.length,
        total_gross_salary: roundCurrency(totalGross),
        total_net_salary: roundCurrency(totalNet),
        total_paid_amount: roundCurrency(totalPaid),
        total_pending_amount: roundCurrency(totalPending),
        total_advances_amount: roundCurrency(totalAdvances),
        paid_records_count: paidCount,
        pending_records_count: pendingCount,
        partially_paid_count: partialCount,
      },
    };
  } catch (err) {
    console.error("[getPayrollSummary] Unexpected error:", err);
    return {
      summary: {
        payroll_year: year,
        payroll_month: month,
        total_employees: 0,
        total_gross_salary: 0,
        total_net_salary: 0,
        total_paid_amount: 0,
        total_pending_amount: 0,
        total_advances_amount: 0,
        paid_records_count: 0,
        pending_records_count: 0,
        partially_paid_count: 0,
      },
      error: "Failed to fetch payroll summary",
    };
  }
}

/**
 * Fetch salary records for a specific payroll month/year with optional status filter
 */
export async function getSalaryRecords(
  filters: SalaryFilters
): Promise<{ records: SalaryRecordWithEmployee[]; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { records: [], error: "unauthorized" };
    }

    let query = supabase
      .from("salary_records")
      .select(`
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
      `)
      .eq("payroll_year", filters.year)
      .eq("payroll_month", filters.month);

    if (filters.employee_id && filters.employee_id !== "all") {
      query = query.eq("employee_id", filters.employee_id);
    }

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("[getSalaryRecords] Error:", error.message);
      return { records: [], error: error.message };
    }

    return { records: (data as SalaryRecordWithEmployee[]) || [] };
  } catch (err) {
    console.error("[getSalaryRecords] Unexpected error:", err);
    return { records: [], error: "Failed to fetch salary records" };
  }
}

/**
 * Fetch single salary record by ID with full employee details and payment disbursements
 */
export async function getSalaryRecordById(
  id: string
): Promise<{ record: SalaryRecordWithEmployee | null; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { record: null, error: "unauthorized" };
    }

    const { data: recordData, error: recordError } = await supabase
      .from("salary_records")
      .select(`
        *,
        employee:employees (
          id,
          employee_code,
          full_name,
          phone,
          alternate_phone,
          email,
          address,
          designation,
          joining_date,
          is_active,
          salary_type,
          salary_amount
        )
      `)
      .eq("id", id)
      .single();

    if (recordError || !recordData) {
      return { record: null, error: recordError?.message || "Record not found" };
    }

    // Fetch payments history for this salary record
    const { data: paymentsData } = await supabase
      .from("salary_payments")
      .select("*")
      .eq("salary_record_id", id)
      .order("payment_date", { ascending: false });

    const fullRecord: SalaryRecordWithEmployee = {
      ...(recordData as SalaryRecordWithEmployee),
      payments: (paymentsData as SalaryPayment[]) || [],
    };

    return { record: fullRecord };
  } catch (err) {
    console.error("[getSalaryRecordById] Unexpected error:", err);
    return { record: null, error: "Failed to fetch salary details" };
  }
}

/**
 * Generate or recalculate a salary record for an employee for a specific month
 */
export async function generateSalaryRecordAction(
  values: GenerateSalaryFormValues
): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized. Please log in again." };
    }

    const validated = generateSalarySchema.safeParse(values);
    if (!validated.success) {
      const firstError = validated.error.errors[0]?.message ?? "Invalid payroll parameters";
      return { success: false, error: firstError };
    }

    const { employee_id, payroll_year, payroll_month, advance_deduction, other_deduction, notes } =
      validated.data;

    // 1. Fetch employee configuration
    const { data: empData, error: empError } = await supabase
      .from("employees")
      .select("*")
      .eq("id", employee_id)
      .single();

    if (empError || !empData) {
      return { success: false, error: "Employee not found." };
    }

    const employee = empData as Employee;

    // 2. Fetch attendance records for this month
    const monthStr = String(payroll_month).padStart(2, "0");
    const startDate = `${payroll_year}-${monthStr}-01`;
    const daysInM = getDaysInMonth(payroll_year, payroll_month);
    const endDate = `${payroll_year}-${monthStr}-${String(daysInM).padStart(2, "0")}`;

    const { data: attData } = await supabase
      .from("attendance")
      .select("status")
      .eq("employee_id", employee_id)
      .gte("attendance_date", startDate)
      .lte("attendance_date", endDate);

    const attendanceRecords = (attData as { status: string }[]) || [];
    let presentCount = 0;
    let halfDayCount = 0;
    let absentCount = 0;
    let leaveCount = 0;

    attendanceRecords.forEach((r) => {
      if (r.status === "present") presentCount++;
      else if (r.status === "half_day") halfDayCount++;
      else if (r.status === "absent") absentCount++;
      else if (r.status === "leave") leaveCount++;
    });

    // 3. Compute payroll calculation
    const calc = calculatePayroll({
      salaryType: employee.salary_type,
      baseSalary: Number(employee.salary_amount || 0),
      year: payroll_year,
      month: payroll_month,
      attendance: {
        present: presentCount,
        half_day: halfDayCount,
        absent: absentCount,
        leave: leaveCount,
      },
      advanceDeduction: advance_deduction,
      otherDeduction: other_deduction,
    });

    // 4. Check if a salary record already exists to preserve previous payments
    const { data: existingRec } = await supabase
      .from("salary_records")
      .select("id, paid_amount")
      .eq("employee_id", employee_id)
      .eq("payroll_year", payroll_year)
      .eq("payroll_month", payroll_month)
      .maybeSingle();

    const existingPaid = Number(existingRec?.paid_amount || 0);
    const pendingAmount = Math.max(0, roundCurrency(calc.netSalary - existingPaid));
    let status: SalaryStatus = "pending";
    if (existingPaid >= calc.netSalary && calc.netSalary > 0) {
      status = "paid";
    } else if (existingPaid > 0) {
      status = "partially_paid";
    }

    // 5. Upsert salary record using unique constraint (employee_id, payroll_year, payroll_month)
    const { data: savedRecord, error: upsertError } = await supabase
      .from("salary_records")
      .upsert(
        {
          employee_id,
          payroll_year,
          payroll_month,
          salary_type: employee.salary_type,
          base_salary: Number(employee.salary_amount || 0),
          working_days: calc.workingDays,
          present_days: calc.presentDays,
          half_days: calc.halfDays,
          absent_days: calc.absentDays,
          leave_days: calc.leaveDays,
          payable_days: calc.payableDays,
          attendance_deduction: calc.attendanceDeduction,
          advance_deduction: calc.advanceDeduction,
          other_deduction: calc.otherDeduction,
          gross_salary: calc.grossSalary,
          net_salary: calc.netSalary,
          paid_amount: existingPaid,
          pending_amount: pendingAmount,
          status,
          notes: notes || null,
          created_by: user.id,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "employee_id,payroll_year,payroll_month",
        }
      )
      .select("id")
      .single();

    if (upsertError) {
      console.error("[generateSalaryRecordAction] Upsert error:", upsertError.message);
      return { success: false, error: upsertError.message };
    }

    revalidatePath("/salary");
    revalidatePath(`/salary/${savedRecord.id}`);
    revalidatePath(`/employees/${employee_id}`);

    return { success: true, data: { id: savedRecord.id } };
  } catch (err) {
    console.error("[generateSalaryRecordAction] Unexpected error:", err);
    return { success: false, error: "An unexpected error occurred while generating the salary record." };
  }
}

/**
 * Generate/refresh salary records for all active employees for a given month
 */
export async function generateAllMonthlySalaryRecordsAction(
  year: number,
  month: number
): Promise<ActionResult<{ count: number }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized. Please log in again." };
    }

    const { data: employees, error: empError } = await supabase
      .from("employees")
      .select("id")
      .eq("is_active", true);

    if (empError || !employees) {
      return { success: false, error: "Failed to fetch active employees" };
    }

    let successCount = 0;
    for (const emp of employees) {
      const res = await generateSalaryRecordAction({
        employee_id: emp.id,
        payroll_year: year,
        payroll_month: month,
        advance_deduction: 0,
        other_deduction: 0,
        notes: null,
      });
      if (res.success) {
        successCount++;
      }
    }

    revalidatePath("/salary");
    return { success: true, data: { count: successCount } };
  } catch (err) {
    console.error("[generateAllMonthlySalaryRecordsAction] Unexpected error:", err);
    return { success: false, error: "Failed to batch generate payroll records." };
  }
}

/**
 * Record a salary payment/disbursement against a salary record
 */
export async function recordSalaryPaymentAction(
  values: SalaryPaymentFormValues
): Promise<ActionResult<{ paymentId: string }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized. Please log in again." };
    }

    const validated = salaryPaymentSchema.safeParse(values);
    if (!validated.success) {
      const firstError = validated.error.errors[0]?.message ?? "Invalid payment data";
      return { success: false, error: firstError };
    }

    const { salary_record_id, payment_date, amount, payment_method, reference_number, notes } =
      validated.data;

    // 1. Fetch current salary record
    const { data: recordData, error: recError } = await supabase
      .from("salary_records")
      .select("id, employee_id, net_salary, paid_amount, pending_amount")
      .eq("id", salary_record_id)
      .single();

    if (recError || !recordData) {
      return { success: false, error: "Salary record not found." };
    }

    const currentPaid = Number(recordData.paid_amount || 0);
    const netSalary = Number(recordData.net_salary || 0);
    const currentPending = Number(recordData.pending_amount || 0);

    if (amount > currentPending) {
      return {
        success: false,
        error: `Payment amount (₹${amount}) exceeds pending balance (₹${currentPending}).`,
      };
    }

    // 2. Insert payment record into salary_payments
    const { data: paymentRecord, error: payError } = await supabase
      .from("salary_payments")
      .insert({
        salary_record_id,
        payment_date,
        amount,
        payment_method,
        reference_number,
        notes,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (payError) {
      console.error("[recordSalaryPaymentAction] Insert error:", payError.message);
      return { success: false, error: payError.message };
    }

    // 3. Update salary_records summary
    const newPaid = roundCurrency(currentPaid + amount);
    const newPending = Math.max(0, roundCurrency(netSalary - newPaid));
    let newStatus: SalaryStatus = "partially_paid";
    if (newPending <= 0) {
      newStatus = "paid";
    }

    const { error: updateError } = await supabase
      .from("salary_records")
      .update({
        paid_amount: newPaid,
        pending_amount: newPending,
        status: newStatus,
        payment_date,
        payment_method,
        payment_reference: reference_number,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", salary_record_id);

    if (updateError) {
      console.error("[recordSalaryPaymentAction] Update salary record error:", updateError.message);
    }

    revalidatePath("/salary");
    revalidatePath(`/salary/${salary_record_id}`);
    revalidatePath(`/employees/${recordData.employee_id}`);

    return { success: true, data: { paymentId: paymentRecord.id } };
  } catch (err) {
    console.error("[recordSalaryPaymentAction] Unexpected error:", err);
    return { success: false, error: "An unexpected error occurred while recording payment." };
  }
}

/**
 * Fetch salary history for an individual employee
 */
export async function getEmployeeSalaryHistory(
  employeeId: string,
  limit = 12
): Promise<{ records: SalaryRecord[]; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { records: [], error: "unauthorized" };
    }

    const { data, error } = await supabase
      .from("salary_records")
      .select("*")
      .eq("employee_id", employeeId)
      .order("payroll_year", { ascending: false })
      .order("payroll_month", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[getEmployeeSalaryHistory] Error:", error.message);
      return { records: [], error: error.message };
    }

    return { records: (data as SalaryRecord[]) || [] };
  } catch (err) {
    console.error("[getEmployeeSalaryHistory] Unexpected error:", err);
    return { records: [], error: "Failed to fetch employee salary history" };
  }
}
