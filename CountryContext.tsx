import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { fetchLatestWastePrices, type CountryWastePrices } from '@/lib/api';
import { DEFAULT_COUNTRY_CODE, getCountry, type Country, type CountryCode } from '@/lib/countries';
import type { WastePrices } from '@/lib/wasteTypes';

type PriceStatus = 'loading' | 'ready' | 'error';

type CountryContextValue = {
  country: Country;
  setCountryCode: (code: CountryCode) => void;
  wastePrices: WastePrices;
  priceStatus: PriceStatus;
  refreshPrices: () => Promise<void>;
};

const CountryContext = createContext<CountryContextValue | null>(null);

export function CountryProvider({ children }: { children: ReactNode }) {
  const [countryCode, setCountryCode] = useState<CountryCode>(DEFAULT_COUNTRY_CODE);
  const [prices, setPrices] = useState<CountryWastePrices>({});
  const [priceStatus, setPriceStatus] = useState<PriceStatus>('loading');

  const refreshPrices = useCallback(async () => {
    setPriceStatus('loading');
    try {
      setPrices(await fetchLatestWastePrices());
      setPriceStatus('ready');
    } catch {
      setPriceStatus('error');
    }
  }, []);

  useEffect(() => {
    void refreshPrices();
  }, [refreshPrices]);

  const value = useMemo<CountryContextValue>(
    () => ({
      country: getCountry(countryCode),
      setCountryCode,
      wastePrices: prices[countryCode] ?? {},
      priceStatus,
      refreshPrices,
    }),
    [countryCode, prices, priceStatus, refreshPrices],
  );

  return <CountryContext.Provider value={value}>{children}</CountryContext.Provider>;
}

export function useCountry(): CountryContextValue {
  const context = useContext(CountryContext);
  if (!context) throw new Error('useCountry must be used inside CountryProvider');
  return context;
}
