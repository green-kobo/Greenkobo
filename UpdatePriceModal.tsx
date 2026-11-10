import { useState, type FormEvent } from 'react';
import Modal from '@/components/Modal';
import { useCountry } from '@/context/CountryContext';
import { insertWastePrice } from '@/lib/api';
import { formatMoney } from '@/lib/countries';
import { inputClass, labelClass, primaryButtonClass } from '@/lib/styles';
import { WASTE_TYPES, type WasteTypeId } from '@/lib/wasteTypes';

type UpdatePriceModalProps = {
  open: boolean;
  onClose: () => void;
};

const MAX_PRICE = 100000;

export default function UpdatePriceModal({ open, onClose }: UpdatePriceModalProps) {
  const { country, wastePrices, refreshPrices } = useCountry();
  const [wasteType, setWasteType] = useState<WasteTypeId>(WASTE_TYPES[0].id);
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const close = () => {
    setValue('');
    setError(null);
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const price = Number(value);
    if (!Number.isFinite(price) || price <= 0 || price > MAX_PRICE) {
      setError(`Enter a price between 0 and ${MAX_PRICE.toLocaleString('en-US')}.`);
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await insertWastePrice(country.code, wasteType, price);
      await refreshPrices();
      close();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save the price.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title={`Update prices - ${country.name}`} onClose={close}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="waste-type" className={labelClass}>Waste type</label>
          <select
            id="waste-type"
            value={wasteType}
            onChange={(event) => setWasteType(event.target.value as WasteTypeId)}
            className={inputClass}
          >
            {WASTE_TYPES.map((type) => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="text-xs font-semibold text-gray-500">Current price per kg</p>
          <p className="mt-1 text-2xl font-extrabold text-brand-800">
            {wastePrices[wasteType] !== undefined ? formatMoney(wastePrices[wasteType], country.code) : '--'}
          </p>
        </div>

        <div>
          <label htmlFor="new-price" className={labelClass}>
            New price per kg ({country.currency})
          </label>
          <input
            id="new-price"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="e.g. 160"
            className={inputClass}
            required
          />
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        <button type="submit" disabled={saving} className={`${primaryButtonClass} w-full`}>
          {saving ? 'Saving...' : 'Save New Price'}
        </button>
      </form>
    </Modal>
  );
}
