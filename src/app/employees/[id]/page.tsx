import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getEmployeeById } from "@/lib/actions/employees";
import { getEmployeeAttendanceHistory } from "@/lib/actions/attendance";
import { AppHeader } from "@/components/layout/AppHeader";
import { EmployeeDetail } from "@/components/employees/EmployeeDetail";

interface EmployeeDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: EmployeeDetailPageProps): Promise<Metadata> {
  const { employee } = await getEmployeeById(params.id);
  return {
    title: employee
      ? `${employee.full_name} (${employee.employee_code})`
      : "Employee Details",
  };
}

export const dynamic = "force-dynamic";

export default async function EmployeeDetailPage({
  params,
}: EmployeeDetailPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const locale = await getLocale();
  const [employeeRes, attendanceRes] = await Promise.all([
    getEmployeeById(params.id),
    getEmployeeAttendanceHistory(params.id, 20),
  ]);

  if (!employeeRes.employee) {
    notFound();
  }

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <AppHeader locale={locale} userEmail={user.email} />

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-5xl w-full mx-auto">
        <EmployeeDetail
          employee={employeeRes.employee}
          recentAttendance={attendanceRes.records || []}
          locale={locale}
        />
      </main>
    </div>
  );
}
