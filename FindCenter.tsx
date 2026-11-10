import { useCallback, useEffect, useMemo, useState } from 'react';
import { Clock, Map as MapIcon, MapPin, MessageCircle, Navigation, Phone, Search, Star, Truck } from 'lucide-react';
import PickupModal from '@/components/PickupModal';
import { useCountry } from '@/context/CountryContext';
import { useLanguage } from '@/context/LanguageContext';
import { fetchRecyclingCenters, type RecyclingCenter } from '@/lib/api';
import { COUNTRIES, formatMoney, type CountryCode } from '@/lib/countries';
import { containerClass, inputClass, primaryButtonClass, sectionClass, secondaryButtonClass } from '@/lib/styles';
import { getWasteType } from '@/lib/wasteTypes';

type LoadStatus = 'loading' | 'ready' | 'error';

const linkDisabledClass = 'cursor-not-allowed opacity-40';

function mapEmbedUrl(center: RecyclingCenter): string | null {
  if (center.latitude === null || center.longitude === null) return null;
  const { latitude, longitude } = center;
  const delta = 0.02;
  const bbox = `${longitude - delta},${latitude - delta},${longitude + delta},${latitude + delta}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`;
}

function directionsUrl(center: RecyclingCenter): string | null {
  if (center.latitude === null || center.longitude === null) return null;
  return `https://www.google.com/maps/dir/?api=1&destination=${center.latitude},${center.longitude}`;
}

export default function FindCenter() {
  const { country, setCountryCode } = useCountry();
  const { t } = useLanguage();
  const [centers, setCenters] = useState<RecyclingCenter[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [city, setCity] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pickupOpen, setPickupOpen] = useState(false);

  const loadCenters = useCallback(async () => {
    setStatus('loading');
    try {
      setCenters(await fetchRecyclingCenters());
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void loadCenters();
  }, [loadCenters]);

  const visibleCenters = useMemo(() => {
    const term = city.trim().toLowerCase();
    return centers
      .filter((center) => center.country_code === country.code)
      .filter((center) => {
        if (!term) return true;
        return [center.name, center.area, center.city].some((field) => field.toLowerCase().includes(term));
      });
  }, [centers, country.code, city]);

  const selected = visibleCenters.find((center) => center.id === selectedId) ?? visibleCenters[0] ?? null;
  const embedUrl = selected ? mapEmbedUrl(selected) : null;

  return (
    <section id="find-center" className={`${sectionClass} bg-gray-50`}>
      <div className={containerClass}>
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-wider text-brand-600">{t('navFindCenter')}</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">{t('findCenterTitle')}</h2>
        </div>

        <div className="mt-8 grid gap-3 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:grid-cols-[200px_1fr] sm:p-5">
          <label className="block">
            <span className="sr-only">{t('searchCountry')}</span>
            <select
              value={country.code}
              onChange={(event) => {
                setCountryCode(event.target.value as CountryCode);
                setSelectedId(null);
              }}
              className={inputClass}
            >
              {COUNTRIES.map((item) => (
                <option key={item.code} value={item.code}>{item.name}</option>
              ))}
            </select>
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              id="area-search"
              type="search"
              aria-label={t('searchCity')}
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder={`${t('searchPlaceholder')} - ${country.name}`}
              className={`${inputClass} pl-12`}
            />
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <ul className="space-y-4 lg:col-span-3">
            {status === 'loading' && <li className="py-10 text-center text-sm text-gray-500">Loading centers...</li>}
            {status === 'error' && (
              <li role="alert" className="rounded-2xl bg-red-50 p-5 text-sm font-medium text-red-700">
                We could not load centers right now.{' '}
                <button type="button" onClick={() => void loadCenters()} className="font-bold underline">Try again</button>
              </li>
            )}
            {status === 'ready' && visibleCenters.length === 0 && (
              <li className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center">
                <p className="font-bold text-gray-900">No centers listed in {country.name}{city.trim() && ` for "${city.trim()}"`} yet.</p>
                <p className="mt-1 text-sm text-gray-600">Own a recycling unit here? List it for free.</p>
                <a href="/register-center" className={`${secondaryButtonClass} mt-4`}>Register My Unit</a>
              </li>
            )}
            {visibleCenters.map((center) => {
              const isSelected = selected?.id === center.id;
              const digits = center.phone?.replace(/\D/g, '') ?? '';
              const directions = directionsUrl(center);
              return (
                <li
                  key={center.id}
                  className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
                    isSelected ? 'border-brand-500 ring-4 ring-brand-100' : 'border-gray-100 hover:border-brand-200'
                  }`}
                >
                  <button type="button" onClick={() => setSelectedId(center.id)} className="flex w-full items-start gap-4 text-left">
                    {center.photo_url ? (
                      <img src={center.photo_url} alt="" loading="lazy" className="h-16 w-16 shrink-0 rounded-2xl object-cover" />
                    ) : (
                      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                        <MapPin className="h-6 w-6" />
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block font-extrabold text-gray-900">{center.name}</span>
                      <span className="mt-1 block text-sm text-gray-600">
                        {center.city}, {COUNTRIES.find((item) => item.code === center.country_code)?.name}
                        {center.distance_km > 0 && ` - ${center.distance_km}km away`}
                      </span>
                      <span className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${center.is_open ? 'bg-brand-100 text-brand-800' : 'bg-gray-200 text-gray-600'}`}>
                          <Clock className="h-3 w-3" />
                          {center.is_open ? 'Open Now' : 'Closed'}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-amber-800">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                          {center.rating !== null ? center.rating.toFixed(1) : 'New'}
                        </span>
                      </span>
                      <span className="mt-2 flex flex-wrap gap-1.5 text-xs font-semibold">
                        {center.accepts.map((id) => {
                          const price = center.waste_prices[id];
                          if (price === undefined) return null;
                          return (
                            <span key={id} className="rounded-full bg-gold-100 px-2.5 py-1 text-gold-700">
                              {getWasteType(id).shortLabel} {formatMoney(price, center.country_code)}/kg
                            </span>
                          );
                        })}
                      </span>
                    </span>
                  </button>

                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <a
                      href={digits ? `tel:+${digits}` : undefined}
                      aria-disabled={!digits}
                      className={`${secondaryButtonClass} px-3 py-2 text-xs ${digits ? '' : linkDisabledClass}`}
                    >
                      <Phone className="h-3.5 w-3.5" />
                      Call
                    </a>
                    <a
                      href={digits ? `https://wa.me/${digits}` : undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-disabled={!digits}
                      className={`${secondaryButtonClass} px-3 py-2 text-xs ${digits ? '' : linkDisabledClass}`}
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      WhatsApp
                    </a>
                    <a
                      href={directions ?? undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-disabled={!directions}
                      className={`${secondaryButtonClass} px-3 py-2 text-xs ${directions ? '' : linkDisabledClass}`}
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      Get Directions
                    </a>
                    <button type="button" onClick={() => setPickupOpen(true)} className={`${primaryButtonClass} px-3 py-2 text-xs`}>
                      <Truck className="h-3.5 w-3.5" />
                      Request Pickup
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="relative min-h-[360px] overflow-hidden rounded-3xl border border-gray-100 bg-gray-100 shadow-lg lg:col-span-2 lg:sticky lg:top-28 lg:self-start">
            {embedUrl ? (
              <iframe title={`Map of ${selected?.name}`} src={embedUrl} className="h-full min-h-[360px] w-full border-0" loading="lazy" />
            ) : (
              <div className="flex h-full min-h-[360px] flex-col items-center justify-center gap-3 p-6 text-center text-gray-500">
                <MapIcon className="h-10 w-10" />
                <p className="text-sm font-semibold">Select a center to see it on the map.</p>
              </div>
            )}
            {selected && (
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur">
                <p className="text-sm font-extrabold text-gray-900">{selected.name}</p>
                <p className="text-xs text-gray-600">{selected.opening_hours ?? 'Opening hours not listed yet'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <PickupModal open={pickupOpen} onClose={() => setPickupOpen(false)} />
    </section>
  );
}
