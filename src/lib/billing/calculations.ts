import type { BillingType } from "@/lib/types/billing";

/**
 * Precision-safe money rounding to 2 decimal places
 */
export function roundCurrency(amount: number): number {
  return Math.round((Number(amount) || 0) * 100) / 100;
}

export interface BillCalculationInput {
  billingType: BillingType;
  billableWeightKg?: number | null;
  ratePerKg?: number | null;
  fixedAmount?: number | null;
  additionalAmount?: number | null;
  discountAmount?: number | null;
  paidAmount?: number | null;
}

export interface BillCalculationResult {
  grossAmount: number;
  discountAmount: number;
  netAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

/**
 * Calculates gross, discount, net, and pending amounts based on billing type
 */
export function calculateBill(input: BillCalculationInput): BillCalculationResult {
  const billingType = input.billingType;
  const weight = Math.max(0, Number(input.billableWeightKg) || 0);
  const rate = Math.max(0, Number(input.ratePerKg) || 0);
  const fixed = Math.max(0, Number(input.fixedAmount) || 0);
  const additional = Math.max(0, Number(input.additionalAmount) || 0);
  const discount = Math.max(0, Number(input.discountAmount) || 0);
  const paid = Math.max(0, Number(input.paidAmount) || 0);

  let gross = 0;

  if (billingType === "kg") {
    gross = roundCurrency(weight * rate);
  } else if (billingType === "fixed") {
    gross = roundCurrency(fixed);
  } else if (billingType === "mixed") {
    const weightAmount = weight * rate;
    gross = roundCurrency(weightAmount + additional);
  }

  // Net amount cannot be negative
  const validDiscount = Math.min(gross, roundCurrency(discount));
  const net = Math.max(0, roundCurrency(gross - validDiscount));
  const pending = Math.max(0, roundCurrency(net - paid));

  return {
    grossAmount: gross,
    discountAmount: validDiscount,
    netAmount: net,
    paidAmount: paid,
    pendingAmount: pending,
  };
}
