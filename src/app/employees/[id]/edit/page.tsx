import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getEmployeeById } from "@/lib/actions/employees";
import { AppHeader } from "@/components/layout/AppHeader";
import { EmployeeForm } from "@/components/employees/EmployeeForm";

interface EditEmployeePageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: EditEmployeePageProps): Promise<Metadata> {
  const { employee } = await getEmployeeById(params.id);
  const t = await getTranslations("employees");
  return {
    title: employee
      ? `${t("edit_employee")} — ${employee.full_name}`
      : t("edit_employee"),
  };
}

export const dynamic = "force-dynamic";

export default async function EditEmployeePage({
  params,
}: EditEmployeePageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const locale = await getLocale();
  const t = await getTranslations("employees");
  const { employee } = await getEmployeeById(params.id);

  if (!employee) {
    notFound();
  }

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
      <AppHeader locale={locale} userEmail={user.email} />

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 lg:ml-64 lg:max-w-[calc(100%-16rem)] max-w-3xl w-full mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {t("edit_employee")}
          </h1>
          <p className="mt-1 text-sm text-slate-500 font-mono">
            {employee.employee_code} — {employee.full_name}
          </p>
        </div>

        <EmployeeForm initialData={employee} isEditing={true} />
      </main>
    </div>
  );
}
