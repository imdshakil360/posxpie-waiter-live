export type Lang = "en" | "bn";
export type OrderType = "EAT_IN" | "TAKEAWAY";
export type OrderStatus =
  | "DRAFT" | "PLACED" | "COMPLETED" | "VOIDED" | "CANCELLED" | "PARTIAL_REFUND" | "REFUNDED";
export type Method = "CASH" | "CARD";

export interface Location {
  id: string; name: string; address_1: string; city: string; postcode: string;
  vat_number: string; vat_registered: boolean; fhrs_id: string;
}

export interface Staff {
  id: string; name: string; role: "OWNER" | "MANAGER" | "CASHIER" | "KITCHEN";
  pin_hash: string; language: Lang; active: boolean;
}

export interface Category { id: string; name_en: string; name_bn: string; sort_order: number; }

export interface Modifier { id: string; name_en: string; name_bn: string; price_delta_pence: number; }
export interface ModifierGroup {
  id: string; name_en: string; name_bn: string;
  min_select: number; max_select: number; required: boolean;
  modifiers: Modifier[];
}

export interface MenuItem {
  id: string; category_id: string; item_number: number;
  name_en: string; name_bn: string; price_pence: number;
  tax_profile_id: "FOOD" | "COLD_DRINK";
  allergen_mask?: number; diet_flags?: string[]; available: boolean;
  modifier_groups: ModifierGroup[];
}

export interface TaxRule { tax_profile_id: string; order_type: OrderType; rate_bps: number; }

export interface DiscountPreset {
  id: string; name: string; type: "PERCENT" | "AMOUNT"; value: number;
  reason_required: boolean; requires_manager: boolean;
}

export interface Printer { id: string; name: string; role: "RECEIPT" | "KITCHEN"; connection: string; }

export interface CartLine {
  uid: string; menu_item_id: string; item_number_snap: number; name_snap: string;
  qty: number; unit_price_pence: number;
  modifiers_snap: { group: string; name: string; delta_pence: number }[];
  tax_profile_id: string; note?: string;
}

export interface OrderItemRow {
  id: string; order_id: string; menu_item_id: string | null; item_number_snap: number;
  name_snap: string; qty: number; unit_price_pence: number;
  modifiers_snap: { group: string; name: string; delta_pence: number }[];
  tax_profile_id: string; vat_rate_bps: number; vat_pence: number;
  line_total_pence: number; note?: string; voided: boolean;
}

export interface DiscountRow {
  id: string; order_id: string; preset_id: string | null;
  type: "PERCENT" | "AMOUNT"; value: number; amount_pence: number;
  reason_code: string; applied_by_staff_id: string; approved_by_staff_id: string | null;
}

export interface PaymentRow {
  id: string; order_id: string; method: Method; provider: "NONE" | "STRIPE";
  provider_ref?: string; amount_pence: number; tip_pence: number;
  tendered_pence?: number; change_pence?: number;
  card_brand?: string; card_last4?: string;
  status: "PENDING" | "CAPTURED" | "FAILED" | "REVERSED"; created_at: string;
}

export interface RefundRow {
  id: string; order_id: string; payment_id: string; amount_pence: number;
  method: Method; reason_code: string;
  requested_by_staff_id: string; approved_by_staff_id: string;
  provider_ref?: string; created_at: string;
}

export interface OrderEvent {
  id: string; order_id: string; type: string; payload?: any;
  actor_staff_id: string; device_id: string; created_at: string;
}

export interface Order {
  id: string; location_id: string; device_id: string; staff_id: string;
  order_number: number; receipt_number: string;
  source: "POS"; order_type: OrderType; status: OrderStatus;
  subtotal_pence: number; discount_pence: number; service_charge_pence: number;
  tip_pence: number; vat_pence: number; total_pence: number;
  note?: string; client_created_at: string; server_received_at?: string;
  version: number; idempotency_key: string;
  items: OrderItemRow[]; payments: PaymentRow[]; discounts: DiscountRow[];
  refunds: RefundRow[]; events: OrderEvent[];
}
