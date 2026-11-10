import { useState } from 'react';
import { Recycle, RefreshCw } from 'lucide-react';
import UpdatePriceModal from '@/components/UpdatePriceModal';
import { useCountry } from '@/context/CountryContext';
import { formatMoney } from '@/lib/countries';
import { containerClass, sectionClass, secondaryButtonClass } from '@/lib/styles';
import { WASTE_TYPES } from '@/lib/wasteTypes';

export default function PriceCard() {
  const { country, wastePrices, priceStatus, refreshPrices } = useCountry();
  const [updateOpen, setUpdateOpen] = useState(false);

  return (
    <section id="check-price" className={`${sectionClass} bg-gray-50`}>
      <div className={`${containerClass} grid items-stretch gap-8 lg:grid-cols-5`}>
        <div className="flex flex-col justify-center lg:col-span-2">
          <p className="text-sm font-bold uppercase tracking-wider text-brand-600">Check Price</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Know exactly what your waste is worth
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-600">
            Prices are set by recycling centers in {country.name} and update as the market moves. Plastic, metal, glass,
            paper and e-waste each have their own price per kg.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 to-brand-600 p-6 text-white shadow-2xl shadow-brand-800/20 sm:p-8 lg:col-span-3">
          <Recycle className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 text-white/5" strokeWidth={1.5} />

          <div className="relative flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-300 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-300" />
              </span>
              Live prices - {country.name}
            </span>
            <button
              type="button"
              onClick={() => void refreshPrices()}
              aria-label="Refresh prices"
              className="rounded-full p-2 text-brand-100 transition hover:bg-white/10 hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 ${priceStatus === 'loading' ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {priceStatus === 'error' && (
            <p role="alert" className="relative mt-6 rounded-xl bg-red-500/20 px-4 py-3 text-sm font-medium text-red-50">
              We could not load today's prices. Tap the refresh icon to try again.
            </p>
          )}

          <ul className="relative mt-6 divide-y divide-white/15 rounded-2xl bg-white/10 backdrop-blur">
            {WASTE_TYPES.map((type) => {
              const price = wastePrices[type.id];
              const value =
                price !== undefined
                  ? formatMoney(price, country.code)
                  : priceStatus === 'error'
                    ? 'Unavailable'
                    : '...';
              return (
                <li key={type.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <span className="flex items-center gap-3 text-sm font-semibold text-brand-50">
                    <Recycle className="h-4 w-4 shrink-0 text-gold-300" />
                    {type.label}
                  </span>
                  <span className="whitespace-nowrap text-base font-extrabold text-white">
                    {value}
                    <span className="text-xs font-semibold text-brand-100"> /kg</span>
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="relative mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-brand-100">Spotted a new rate? Update it for everyone.</p>
            <button
              type="button"
              onClick={() => setUpdateOpen(true)}
              className={`${secondaryButtonClass} border-white/30 bg-white text-brand-800 hover:bg-gold-100 hover:text-brand-900`}
            >
              Update Price
            </button>
          </div>
        </div>
      </div>

      <UpdatePriceModal open={updateOpen} onClose={() => setUpdateOpen(false)} />
    </section>
  );
}
