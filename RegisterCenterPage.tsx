import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, LocateFixed, MapPin, Upload } from 'lucide-react';
import PageShell from '@/components/PageShell';
import { useCountry } from '@/context/CountryContext';
import { insertRecyclingCenter, uploadCenterPhoto } from '@/lib/api';
import { COUNTRIES, getCountry, type CountryCode } from '@/lib/countries';
import { containerClass, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from '@/lib/styles';
import { WASTE_TYPES, type WasteTypeId, type WastePrices } from '@/lib/wasteTypes';
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

type FormState = {
  name: string;
  owner: string;
  country: CountryCode;
  area: string;
  phone: string;
  prices: Partial<Record<WasteTypeId, string>>;
  hours: string;
  accepts: WasteTypeId[];
  latitude: string;
  longitude: string;
};

export default function RegisterCenterPage() {
  const { country } = useCountry();
  const [form, setForm] = useState<FormState>({
    name: '',
    owner: '',
    country: country.code,
    area: '',
    phone: '',
    prices: {},
    hours: '',
    accepts: ['plastic'],
    latitude: '',
    longitude: '',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [liveCenter, setLiveCenter] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const selectedCountry = getCountry(form.country);
  const latitude = Number(form.latitude);
  const longitude = Number(form.longitude);
  const hasPin = form.latitude !== '' && form.longitude !== '' && Number.isFinite(latitude) && Number.isFinite(longitude);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleWaste = (id: WasteTypeId) => {
    setForm((prev) => ({
      ...prev,
      accepts: prev.accepts.includes(id) ? prev.accepts.filter((item) => item !== id) : [...prev.accepts, id],
    }));
  };

  const updatePrice = (id: WasteTypeId, value: string) => {
    setForm((prev) => ({ ...prev, prices: { ...prev.prices, [id]: value } }));
  };

  const handlePhoto = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError('That photo is over 5 MB. Please choose a smaller image.');
      return;
    }
    setError(null);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Your browser cannot share location. Enter the coordinates manually.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
        setLocating(false);
      },
      () => {
        setError('We could not get your location. Allow location access or enter the coordinates manually.');
        setLocating(false);
      },
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.accepts.length === 0) {
      setError('Choose at least one waste type you buy.');
      return;
    }
    const wastePrices: WastePrices = {};
    for (const id of form.accepts) {
      const price = Number(form.prices[id]);
      if (!Number.isFinite(price) || price <= 0) {
        setError('Enter a price per kg greater than zero for every waste type you buy.');
        return;
      }
      wastePrices[id] = price;
    }
    if (!photoFile) {
      setError('Upload a photo of your center.');
      return;
    }
    if (!hasPin) {
      setError('Add your location pin so people can find you on the map.');
      return;
    }

    setError(null);
    setSaving(true);
    try {
      const photoUrl = await uploadCenterPhoto(photoFile);
      await insertRecyclingCenter({
        name: form.name.trim(),
        owner_name: form.owner.trim(),
        area: form.area.trim(),
        city: form.area.trim(),
        country_code: form.country,
        phone: form.phone.trim(),
        price_per_kg: wastePrices[form.accepts[0]] ?? 0,
        opening_hours: form.hours.trim(),
        accepts: form.accepts,
        waste_prices: wastePrices,
        photo_url: photoUrl,
        latitude,
        longitude,
      });
      setLiveCenter(form.name.trim());
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not register your center.');
    } finally {
      setSaving(false);
    }
  };

  if (liveCenter) {
    return (
      <PageShell>
        <section className="px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-lg rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-xl shadow-brand-900/5">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-50">
              <CheckCircle2 className="h-11 w-11 text-brand-600" />
            </span>
            <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-gray-900">Your Center Is Now Live On Map!</h1>
            <p className="mt-3 text-sm text-gray-600">
              {liveCenter} is listed in {selectedCountry.name}. Sellers can now find you, call, and request pickups.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <a href="/find-center" className={primaryButtonClass}>
                <MapPin className="h-4 w-4" />
                View On Map
              </a>
              <button
                type="button"
                onClick={() => {
                  setLiveCenter(null);
                  setPhotoFile(null);
                  setPhotoPreview(null);
                  setForm((prev) => ({ ...prev, name: '', owner: '', area: '', phone: '', prices: {}, hours: '', latitude: '', longitude: '' }));
                }}
                className={secondaryButtonClass}
              >
                Register Another Unit
              </button>
            </div>
          </div>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="px-5 py-12 sm:px-8 lg:py-16">
        <div className={`${containerClass} grid gap-10 lg:grid-cols-5`}>
          <div className="lg:col-span-2">
            <p className="text-sm font-bold uppercase tracking-wider text-brand-600">Recycling Centers</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Register your recycling unit
            </h1>
            <p className="mt-4 text-base leading-relaxed text-gray-600">
              Join GreenKobo across West Africa. Your center appears on the map, sellers call or message you on WhatsApp,
              and pickup requests come straight to you.
            </p>
            <ul className="mt-8 space-y-3 text-sm font-semibold text-gray-700">
              <li className="flex gap-3"><CheckCircle2 className="h-5 w-5 shrink-0 text-brand-600" />Free listing on the GreenKobo map</li>
              <li className="flex gap-3"><CheckCircle2 className="h-5 w-5 shrink-0 text-brand-600" />Set your own price for each waste type</li>
              <li className="flex gap-3"><CheckCircle2 className="h-5 w-5 shrink-0 text-brand-600" />Receive pickup requests from nearby sellers</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-xl shadow-brand-900/5 sm:p-8 lg:col-span-3">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="center-name" className={labelClass}>Business name</label>
                <input id="center-name" required minLength={2} maxLength={120} value={form.name} onChange={(e) => update('name', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="center-owner" className={labelClass}>Owner name</label>
                <input id="center-owner" required minLength={2} maxLength={100} value={form.owner} onChange={(e) => update('owner', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="center-country" className={labelClass}>Country</label>
                <select id="center-country" value={form.country} onChange={(e) => update('country', e.target.value as CountryCode)} className={inputClass}>
                  {COUNTRIES.map((item) => (
                    <option key={item.code} value={item.code}>{item.name} ({item.currency})</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="center-area" className={labelClass}>City / Area</label>
                <input id="center-area" required minLength={2} maxLength={100} value={form.area} onChange={(e) => update('area', e.target.value)} placeholder="e.g. Bariga, Lagos" className={inputClass} />
              </div>
              <div>
                <label htmlFor="center-phone" className={labelClass}>Phone / WhatsApp</label>
                <input id="center-phone" type="tel" required maxLength={20} value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+234 800 000 0000" className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="center-hours" className={labelClass}>Opening hours</label>
                <input id="center-hours" required maxLength={120} value={form.hours} onChange={(e) => update('hours', e.target.value)} placeholder="e.g. Mon - Sat, 8am - 6pm" className={inputClass} />
              </div>
            </div>

            <fieldset>
              <legend className={labelClass}>What you buy</legend>
              <div className="flex flex-wrap gap-2">
                {WASTE_TYPES.map((type) => {
                  const active = form.accepts.includes(type.id);
                  return (
                    <button
                      key={type.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleWaste(type.id)}
                      className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition ${
                        active ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-gray-200 bg-white text-gray-600 hover:border-brand-300'
                      }`}
                    >
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {form.accepts.length > 0 && (
              <div className="grid gap-5 sm:grid-cols-2">
                {WASTE_TYPES.filter((type) => form.accepts.includes(type.id)).map((type) => (
                  <div key={type.id}>
                    <label htmlFor={`price-${type.id}`} className={labelClass}>
                      {type.shortLabel} price per kg ({selectedCountry.currency})
                    </label>
                    <input
                      id={`price-${type.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={form.prices[type.id] ?? ''}
                      onChange={(e) => updatePrice(type.id, e.target.value)}
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
            )}

            <div>
              <span className={labelClass}>Photo of your center</span>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/50 p-6 text-center transition hover:border-brand-500">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview of your center" className="h-40 w-full rounded-xl object-cover" />
                ) : (
                  <>
                    <Upload className="h-7 w-7 text-brand-600" />
                    <span className="text-sm font-bold text-brand-800">Upload photo</span>
                    <span className="text-xs text-gray-500">JPG, PNG or WebP, up to 5 MB</span>
                  </>
                )}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => handlePhoto(e.target.files?.[0])} />
              </label>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className={labelClass}>Location pin</span>
                <button type="button" onClick={useCurrentLocation} disabled={locating} className="inline-flex items-center gap-2 text-sm font-bold text-brand-700 hover:underline disabled:opacity-60">
                  <LocateFixed className="h-4 w-4" />
                  {locating ? 'Finding you...' : 'Use my current location'}
                </button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <input aria-label="Latitude" type="number" step="any" value={form.latitude} onChange={(e) => update('latitude', e.target.value)} placeholder="Latitude" className={inputClass} />
                <input aria-label="Longitude" type="number" step="any" value={form.longitude} onChange={(e) => update('longitude', e.target.value)} placeholder="Longitude" className={inputClass} />
              </div>
              {hasPin && (
                <iframe
                  title="Location preview"
                  className="mt-3 h-48 w-full rounded-2xl border border-gray-200"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}&layer=mapnik&marker=${latitude},${longitude}`}
                />
              )}
            </div>

            {error && (
              <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>
            )}

            <button type="submit" disabled={saving} className={`${primaryButtonClass} w-full py-4`}>
              {saving ? 'Publishing your center...' : 'Register & Go Live'}
            </button>
          </form>
        </div>
      </section>
    </PageShell>
  );
}
