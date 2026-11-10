import { useState, type FormEvent } from 'react';
import { CheckCircle2 } from 'lucide-react';
import Modal from '@/components/Modal';
import { useCountry } from '@/context/CountryContext';
import { insertPickupRequest } from '@/lib/api';
import { formatMoney } from '@/lib/countries';
import { inputClass, labelClass, primaryButtonClass } from '@/lib/styles';
import { WASTE_TYPES, type WasteTypeId } from '@/lib/wasteTypes';

type PickupModalProps = {
  open: boolean;
  onClose: () => void;
};

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function PickupModal({ open, onClose }: PickupModalProps) {
  const { country, wastePrices } = useCountry();
  const [fullName, setFullName] = useState('');
  const [area, setArea] = useState('');
  const [bags, setBags] = useState('');
  const [pickDate, setPickDate] = useState('');
  const [phone, setPhone] = useState('');
  const [wasteTypes, setWasteTypes] = useState<WasteTypeId[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const toggleWaste = (id: WasteTypeId) => {
    setWasteTypes((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const close = () => {
    setFullName('');
    setArea('');
    setBags('');
    setPickDate('');
    setPhone('');
    setWasteTypes([]);
    setError(null);
    setDone(false);
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const bagCount = Number(bags);
    if (!Number.isInteger(bagCount) || bagCount < 1) {
      setError('Enter how many bags you have (at least 1).');
      return;
    }
    if (wasteTypes.length === 0) {
      setError('Choose at least one type of waste.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await insertPickupRequest({
        full_name: fullName.trim(),
        phone: phone.trim(),
        area: area.trim(),
        bags: bagCount,
        pick_date: pickDate,
        country_code: country.code,
        waste_types: wasteTypes,
      });
      setDone(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not send your request.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title="Request Pickup" onClose={close}>
      {done ? (
        <div className="space-y-5 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
            <CheckCircle2 className="h-9 w-9 text-brand-600" />
          </span>
          <div>
            <p className="text-lg font-extrabold text-gray-900">A rider will contact you in 30 mins.</p>
            <p className="mt-2 text-sm text-gray-600">Pickup fee: FREE for 5 bags and above.</p>
          </div>
          <button type="button" onClick={close} className={`${primaryButtonClass} w-full`}>
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="pickup-name" className={labelClass}>Your Name</label>
            <input id="pickup-name" required minLength={2} maxLength={100} value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="pickup-area" className={labelClass}>Your Area</label>
            <input id="pickup-area" required minLength={2} maxLength={100} value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Bariga" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="pickup-bags" className={labelClass}>How Many Bags</label>
              <input id="pickup-bags" type="number" inputMode="numeric" min={1} max={10000} required value={bags} onChange={(e) => setBags(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="pickup-date" className={labelClass}>Pick Date</label>
              <input id="pickup-date" type="date" min={todayIso()} required value={pickDate} onChange={(e) => setPickDate(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label htmlFor="pickup-phone" className={labelClass}>Phone</label>
            <input id="pickup-phone" type="tel" required maxLength={20} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 800 000 0000" className={inputClass} />
          </div>

          <div>
            <span className={labelClass}>What You Are Selling</span>
            <div className="grid gap-2 sm:grid-cols-2">
              {WASTE_TYPES.map((type) => {
                const active = wasteTypes.includes(type.id);
                const price = wastePrices[type.id];
                return (
                  <button
                    key={type.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleWaste(type.id)}
                    className={`flex flex-col items-start rounded-xl border-2 px-3 py-2 text-left transition ${
                      active ? 'border-brand-600 bg-brand-50' : 'border-gray-200 bg-white hover:border-brand-300'
                    }`}
                  >
                    <span className="text-sm font-bold text-gray-900">{type.label}</span>
                    <span className="text-xs font-semibold text-gold-700">
                      {price !== undefined ? `${formatMoney(price, country.code)}/kg` : 'Price not set'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="rounded-xl bg-gold-50 px-4 py-3 text-sm font-semibold text-gray-700">
            Pickup fee: <span className="text-brand-800">FREE for 5 bags and above.</span>
          </p>

          {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

          <button type="submit" disabled={saving} className={`${primaryButtonClass} w-full`}>
            {saving ? 'Sending...' : 'Request Pickup'}
          </button>
        </form>
      )}
    </Modal>
  );
}
