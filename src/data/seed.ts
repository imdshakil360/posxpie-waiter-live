import type { Category, DiscountPreset, Location, MenuItem, ModifierGroup, Printer, Staff, TaxRule } from "../lib/types";

export const LOCATION: Location = {
  id: "loc_1", name: "Demo Tandoori", address_1: "148 Brick Lane", city: "London",
  postcode: "E1 6RU", vat_number: "GB 123 4567 89", vat_registered: true, fhrs_id: "fhrs_12345",
};

export const DEVICE = { id: "dev_1", name: "Counter 1 · SUNMI V2 Pro", app_version: "1.0.0 (MVP)" };

export const STAFF: Staff[] = [
  { id: "stf_1", name: "Rafiq Ahmed", role: "MANAGER", pin_hash: "1111", language: "en", active: true },
  { id: "stf_2", name: "Shumi Begum", role: "CASHIER", pin_hash: "2222", language: "bn", active: true },
  { id: "stf_3", name: "Ana Costa", role: "CASHIER", pin_hash: "3333", language: "en", active: true },
];

export const CATEGORIES: Category[] = [
  { id: "c1", name_en: "Starters", name_bn: "স্টার্টার", sort_order: 1 },
  { id: "c2", name_en: "Curries", name_bn: "কারি", sort_order: 2 },
  { id: "c3", name_en: "Biryani & Rice", name_bn: "বিরিয়ানি ও ভাত", sort_order: 3 },
  { id: "c4", name_en: "Grills", name_bn: "গ্রিল", sort_order: 4 },
  { id: "c5", name_en: "Breads & Sides", name_bn: "রুটি ও সাইড", sort_order: 5 },
  { id: "c6", name_en: "Drinks & Desserts", name_bn: "পানীয় ও মিষ্টি", sort_order: 6 },
];

const spice: ModifierGroup = {
  id: "g_spice", name_en: "Spice level", name_bn: "ঝাল", min_select: 1, max_select: 1, required: true,
  modifiers: [
    { id: "m_mild", name_en: "Mild", name_bn: "হালকা", price_delta_pence: 0 },
    { id: "m_med", name_en: "Medium", name_bn: "মাঝারি", price_delta_pence: 0 },
    { id: "m_hot", name_en: "Hot", name_bn: "ঝাল", price_delta_pence: 0 },
  ],
};
const extras: ModifierGroup = {
  id: "g_extra", name_en: "Extras", name_bn: "অতিরিক্ত", min_select: 0, max_select: 3, required: false,
  modifiers: [
    { id: "m_naan", name_en: "Extra naan", name_bn: "অতিরিক্ত নান", price_delta_pence: 120 },
    { id: "m_sauce", name_en: "Extra sauce", name_bn: "অতিরিক্ত সস", price_delta_pence: 80 },
    { id: "m_raita", name_en: "Raita", name_bn: "রায়তা", price_delta_pence: 150 },
    { id: "m_no_onion", name_en: "No onion", name_bn: "পেঁয়াজ ছাড়া", price_delta_pence: 0 },
  ],
};
const portion: ModifierGroup = {
  id: "g_portion", name_en: "Portion", name_bn: "পরিমাণ", min_select: 1, max_select: 1, required: true,
  modifiers: [
    { id: "p_reg", name_en: "Regular", name_bn: "সাধারণ", price_delta_pence: 0 },
    { id: "p_large", name_en: "Large", name_bn: "বড়", price_delta_pence: 200 },
  ],
};
const drinkSize: ModifierGroup = {
  id: "g_size", name_en: "Size", name_bn: "সাইজ", min_select: 1, max_select: 1, required: true,
  modifiers: [
    { id: "s_can", name_en: "Can 330ml", name_bn: "ক্যান", price_delta_pence: 0 },
    { id: "s_bottle", name_en: "Bottle 500ml", name_bn: "বোতল", price_delta_pence: 90 },
  ],
};

type Row = [number, string, string, number, ("FOOD" | "COLD_DRINK"), "c1" | "c2" | "c3" | "c4" | "c5" | "c6", ModifierGroup[]];
const rows: Row[] = [
  [1, "Onion Bhaji (4 pcs)", "পেঁয়াজ ভাজি", 495, "FOOD", "c1", [portion]],
  [2, "Vegetable Samosa", "সবজি সমুচা", 445, "FOOD", "c1", [portion]],
  [3, "Chicken Pakora", "চিকেন পাকোড়া", 545, "FOOD", "c1", [portion]],
  [4, "Paneer Tikka", "পনির টিকা", 595, "FOOD", "c1", [spice]],
  [5, "Sheek Kebab", "শিক কাবাব", 625, "FOOD", "c1", [spice]],
  [6, "Mixed Starter", "মিক্সড স্টার্টার", 795, "FOOD", "c1", [spice]],
  [7, "Prawn Puri", "চিংড়ি পুরি", 645, "FOOD", "c1", [extras]],
  [8, "Aloo Chat", "আলু চাট", 475, "FOOD", "c1", [extras]],

  [9, "Chicken Tikka Masala", "চিকেন টিকা মসলা", 895, "FOOD", "c2", [spice, extras]],
  [10, "Chicken Korma", "চিকেন কোর্মা", 875, "FOOD", "c2", [spice]],
  [11, "Lamb Rogan Josh", "ল্যাম্ব রগন জোশ", 945, "FOOD", "c2", [spice, extras]],
  [12, "Lamb Madras", "ল্যাম্ব মাদ্রাজ", 945, "FOOD", "c2", [spice]],
  [13, "Chicken Balti", "চিকেন বালতি", 895, "FOOD", "c2", [spice, extras]],
  [14, "Prawn Balti", "চিংড়ি বালতি", 995, "FOOD", "c2", [spice]],
  [15, "Vegetable Curry", "সবজি কারি", 745, "FOOD", "c2", [spice]],
  [16, "Paneer Butter Masala", "পনির বাটার মসলা", 795, "FOOD", "c2", [spice]],
  [17, "Chicken Jalfrezi", "চিকেন জলফ্রেজি", 905, "FOOD", "c2", [spice, extras]],
  [18, "Beef Bhuna", "গরু ভুনা", 965, "FOOD", "c2", [spice]],
  [19, "Garlic Chicken", "রসুন চিকেন", 915, "FOOD", "c2", [spice]],
  [20, "Chana Masala", "ছোলা মসলা", 695, "FOOD", "c2", [spice]],
  [21, "King Prawn Curry", "কিং চিংড়ি কারি", 1195, "FOOD", "c2", [spice]],
  [22, "Chicken Dhansak", "চিকেন ধনসাক", 925, "FOOD", "c2", [spice]],
  [23, "Lamb Biryani Masala", "ল্যাম্ব বিরিয়ানি মসলা", 985, "FOOD", "c2", [spice]],
  [24, "Butter Chicken", "বাটার চিকেন", 925, "FOOD", "c2", [spice, extras]],

  [25, "Chicken Biryani", "চিকেন বিরিয়ানি", 995, "FOOD", "c3", [portion, extras]],
  [26, "Lamb Biryani", "ল্যাম্ব বিরিয়ানি", 1095, "FOOD", "c3", [portion, extras]],
  [27, "Vegetable Biryani", "সবজি বিরিয়ানি", 845, "FOOD", "c3", [portion]],
  [28, "Prawn Biryani", "চিংড়ি বিরিয়ানি", 1145, "FOOD", "c3", [portion]],
  [29, "Pilau Rice", "পিলাউ ভাত", 345, "FOOD", "c3", [portion]],
  [30, "Boiled Rice", "সাদা ভাত", 295, "FOOD", "c3", [portion]],
  [31, "Mushroom Rice", "মাশরুম রাইস", 395, "FOOD", "c3", [portion]],
  [32, "Egg Fried Rice", "এগ ফ্রাইড রাইস", 425, "FOOD", "c3", [portion]],
  [33, "Coconut Rice", "নারকেল রাইস", 395, "FOOD", "c3", [portion]],
  [34, "Keema Rice", "কিমা রাইস", 495, "FOOD", "c3", [portion]],

  [35, "Chicken Tikka", "চিকেন টিকা", 745, "FOOD", "c4", [spice]],
  [36, "Lamb Chops", "ল্যাম্ব চপ", 1095, "FOOD", "c4", [spice]],
  [37, "Mixed Grill", "মিক্সড গ্রিল", 1395, "FOOD", "c4", [spice]],
  [38, "Tandoori Chicken (Half)", "তন্দুরি চিকেন", 795, "FOOD", "c4", [spice]],
  [39, "Shish Kebab", "শিশ কাবাব", 845, "FOOD", "c4", [spice]],
  [40, "Grilled King Prawn", "গ্রিলড কিং চিংড়ি", 1245, "FOOD", "c4", [spice]],
  [41, "Chicken Wings (6)", "চিকেন উইংস", 595, "FOOD", "c4", [spice]],
  [42, "Seekh Roll", "সিক রোল", 645, "FOOD", "c4", [spice, extras]],

  [43, "Plain Naan", "প্লেইন নান", 245, "FOOD", "c5", []],
  [44, "Garlic Naan", "রসুন নান", 295, "FOOD", "c5", []],
  [45, "Peshwari Naan", "পেশোয়ারি নান", 325, "FOOD", "c5", []],
  [46, "Paratha", "পরোটা", 275, "FOOD", "c5", []],
  [47, "Chapati", "চাপাতি", 195, "FOOD", "c5", []],
  [48, "Chips", "চিপস", 295, "FOOD", "c5", [portion]],
  [49, "Onion Salad", "পেঁয়াজ সালাদ", 195, "FOOD", "c5", []],
  [50, "Raita", "রায়তা", 245, "FOOD", "c5", []],
  [51, "Mango Chutney", "আমের চাটনি", 145, "FOOD", "c5", []],
  [52, "Pickle Tray", "আচার ট্রে", 175, "FOOD", "c5", []],

  [53, "Coca-Cola", "কোকা-কোলা", 195, "COLD_DRINK", "c6", [drinkSize]],
  [54, "Diet Coke", "ডায়েট কোক", 195, "COLD_DRINK", "c6", [drinkSize]],
  [55, "Mango Lassi", "ম্যাঙ্গো লাসি", 345, "COLD_DRINK", "c6", [drinkSize]],
  [56, "Still Water", "মিনারেল ওয়াটার", 145, "COLD_DRINK", "c6", [drinkSize]],
  [57, "Sparkling Water", "স্পার্কলিং ওয়াটার", 175, "COLD_DRINK", "c6", [drinkSize]],
  [58, "Gulab Jamun (2)", "গুলাব জামুন", 345, "FOOD", "c6", []],
  [59, "Kheer", "ক্ষীর", 325, "FOOD", "c6", []],
  [60, "Kulfi", "কুলফি", 295, "COLD_DRINK", "c6", []],
];

export const MENU_ITEMS: MenuItem[] = rows.map(([n, en, bn, price, tax, cat, groups]) => ({
  id: `itm_${n}`, category_id: cat, item_number: n, name_en: en, name_bn: bn,
  price_pence: price, tax_profile_id: tax, available: true,
  diet_flags: en.match(/Vegetable|Paneer|Chana|Aloo/gi) ? ["vegetarian"] : [],
  modifier_groups: groups,
}));

export const TAX_RULES: TaxRule[] = [
  { tax_profile_id: "FOOD", order_type: "EAT_IN", rate_bps: 2000 },
  { tax_profile_id: "FOOD", order_type: "TAKEAWAY", rate_bps: 2000 },
  { tax_profile_id: "COLD_DRINK", order_type: "EAT_IN", rate_bps: 2000 },
  { tax_profile_id: "COLD_DRINK", order_type: "TAKEAWAY", rate_bps: 0 },
];

export const DISCOUNT_PRESETS: DiscountPreset[] = [
  { id: "dp_1", name: "Staff food 50%", type: "PERCENT", value: 50, reason_required: true, requires_manager: false },
  { id: "dp_2", name: "£2 off over £15", type: "AMOUNT", value: 200, reason_required: true, requires_manager: false },
  { id: "dp_3", name: "Collection 10%", type: "PERCENT", value: 10, reason_required: false, requires_manager: false },
];

export const PRINTERS: Printer[] = [
  { id: "pr_1", name: "Front receipt", role: "RECEIPT", connection: "SUNMI built-in" },
  { id: "pr_2", name: "Kitchen copy", role: "KITCHEN", connection: "LAN 80mm" },
];

export const SERVICE_CHARGE_BPS = 0;
