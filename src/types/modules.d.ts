/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "lucide-react" {
  import * as React from "react";
  export interface LucideProps extends React.SVGAttributes<SVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
    absoluteStrokeWidth?: boolean;
    className?: string;
  }
  export type LucideIcon = React.ForwardRefExoticComponent<
    LucideProps & React.RefAttributes<SVGSVGElement>
  >;

  export const Filter: LucideIcon;
  export const Calendar: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const Plus: LucideIcon;
  export const UserPlus: LucideIcon;
  export const PackagePlus: LucideIcon;
  export const CalendarCheck: LucideIcon;
  export const PlusCircle: LucideIcon;
  export const Search: LucideIcon;
  export const Download: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const CreditCard: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const Clock: LucideIcon;
  export const Receipt: LucideIcon;
  export const Wallet: LucideIcon;
  export const Scale: LucideIcon;
  export const Package: LucideIcon;
  export const Users: LucideIcon;
  export const ArrowUpRight: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const FileText: LucideIcon;
  export const Layers: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronUp: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const Printer: LucideIcon;
  export const Building2: LucideIcon;
  export const UserCheck: LucideIcon;
  export const LogOut: LucideIcon;
  export const Menu: LucideIcon;
  export const X: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Smartphone: LucideIcon;
  export const Check: LucideIcon;
  export const ExternalLink: LucideIcon;
  export const Eye: LucideIcon;
  export const Edit: LucideIcon;
  export const Trash2: LucideIcon;
  export const MoreVertical: LucideIcon;
  export const Truck: LucideIcon;
  export const Phone: LucideIcon;
  export const Mail: LucideIcon;
  export const MapPin: LucideIcon;
  export const DollarSign: LucideIcon;
  export const IndianRupee: LucideIcon;
  export const HelpCircle: LucideIcon;
  export const Info: LucideIcon;
  export const ArrowUpDown: LucideIcon;
  export const Share2: LucideIcon;
  export const ShieldCheck: LucideIcon;
  export const Shield: LucideIcon;
  export const User: LucideIcon;
  export const Lock: LucideIcon;
  export const Key: LucideIcon;
  export const Globe: LucideIcon;
  export const Settings: LucideIcon;
  export const BarChart3: LucideIcon;
  export const PieChart: LucideIcon;
  export const SlidersHorizontal: LucideIcon;
  export const ArrowDownRight: LucideIcon;
  export const Loader2: LucideIcon;
  export const Activity: LucideIcon;
  export const FileSpreadsheet: LucideIcon;
  export const TrendingDown: LucideIcon;
  export const Lucide: LucideIcon;

  const icons: { [key: string]: LucideIcon };
  export default icons;
}

declare module "next-intl" {
  export function useTranslations(namespace?: string): {
    (key: string, values?: Record<string, any>): string;
    raw(key: string): any;
    rich(key: string, values?: Record<string, any>): React.ReactNode;
  };
  export function useLocale(): string;
  export function useMessages(): Record<string, any>;
  export function useTimeZone(): string;
  export function useNow(): Date;
  export const NextIntlClientProvider: React.FC<{
    messages: any;
    locale: string;
    children: React.ReactNode;
    timeZone?: string;
    now?: Date;
  }>;
}

declare module "next-intl/server" {
  export function getTranslations(
    opts?: string | { locale?: string; namespace?: string }
  ): Promise<{
    (key: string, values?: Record<string, any>): string;
    raw(key: string): any;
  }>;
  export function getLocale(): Promise<string>;
  export function getMessages(opts?: { locale?: string }): Promise<Record<string, any>>;
  export function getTimeZone(): Promise<string>;
  export function getNow(): Promise<Date>;
  export function unstable_setRequestLocale(locale: string): void;
}

declare module "next-intl/plugin" {
  export default function createNextIntlPlugin(
    i18nPath?: string
  ): (nextConfig?: any) => any;
}

export {};
