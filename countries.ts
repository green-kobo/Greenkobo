export type CountryCode = 'NG' | 'GH' | 'SN' | 'CI' | 'TG' | 'BJ' | 'SL';

export type Country = {
  code: CountryCode;
  name: string;
  currency: string;
  symbol: string;
  decimals: number;
};

export const COUNTRIES: Country[] = [
  { code: 'NG', name: 'Nigeria', currency: 'Naira', symbol: '₦', decimals: 0 },
  { code: 'GH', name: 'Ghana', currency: 'Cedi', symbol: 'GH₵', decimals: 2 },
  { code: 'SN', name: 'Senegal', currency: 'CFA franc', symbol: 'CFA', decimals: 0 },
  { code: 'CI', name: "Côte d'Ivoire", currency: 'CFA franc', symbol: 'CFA', decimals: 0 },
  { code: 'TG', name: 'Togo', currency: 'CFA franc', symbol: 'CFA', decimals: 0 },
  { code: 'BJ', name: 'Benin', currency: 'CFA franc', symbol: 'CFA', decimals: 0 },
  { code: 'SL', name: 'Sierra Leone', currency: 'Leone', symbol: 'Le', decimals: 2 },
];

export const DEFAULT_COUNTRY_CODE: CountryCode = 'NG';

export function getCountry(code: CountryCode): Country {
  return COUNTRIES.find((country) => country.code === code) ?? COUNTRIES[0];
}

export function formatMoney(amount: number, code: CountryCode): string {
  const { symbol, decimals } = getCountry(code);
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  if (symbol === 'CFA') return `${formatted} CFA`;
  if (/^[A-Za-z]+$/.test(symbol)) return `${symbol} ${formatted}`;
  return `${symbol}${formatted}`;
}
