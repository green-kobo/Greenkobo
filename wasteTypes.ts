export const WASTE_TYPES = [
  { id: 'plastic', label: 'Plastic Bottles & Nylon', shortLabel: 'Plastic' },
  { id: 'aluminium', label: 'Aluminium Cans & Metal', shortLabel: 'Aluminium' },
  { id: 'glass', label: 'Glass Bottles', shortLabel: 'Glass' },
  { id: 'paper', label: 'Paper & Carton', shortLabel: 'Paper' },
  { id: 'ewaste', label: 'E-Waste (phones, batteries, chargers)', shortLabel: 'E-Waste' },
] as const;

export type WasteTypeId = (typeof WASTE_TYPES)[number]['id'];

export const WASTE_TYPE_IDS: WasteTypeId[] = WASTE_TYPES.map((type) => type.id);

export type WastePrices = Partial<Record<WasteTypeId, number>>;

export function getWasteType(id: WasteTypeId) {
  return WASTE_TYPES.find((type) => type.id === id) ?? WASTE_TYPES[0];
}
