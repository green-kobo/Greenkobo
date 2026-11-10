import { useState, type FormEvent } from 'react';
import { Building2, CheckCircle2, Smartphone } from 'lucide-react';
import Modal from '@/components/Modal';
import { insertCashoutRequest } from '@/lib/api';
import { formatMoney, type CountryCode } from '@/lib/countries';
import { inputClass, labelClass, primaryButtonClass } from '@/lib/styles';

type CashOutModalProps = {
  open: boolean;
  onClose: () => void;
  amount: number;
  countryCode: CountryCode;
};

type Method = 'opay' | 'bank';

const METHODS: { value: Method; label: string; hint: string; icon: typeof Smartphone }[] = [
  { value: 'opay', label: 'Opay', hint: 'Opay phone number', icon: Smartphone },
  { value: 'bank', label: 'Bank', hint: 'Bank name and account number', icon: Building2 },
];

export default function CashOutModal({ open, onClose, amount, countryCode }: CashOutModalProps) {
  const [method, setMethod] = useState<Method>('opay');
  const [phone, setPhone] = useState('');
  const [accountDetails, setAccountDetails] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const selected = METHODS.find((item) => item.value === method) ?? METHODS[0];
  const formattedAmount = formatMoney(amount, countryCode);

  const close = () => {
    setPhone('');
    setAccountDetails('');
    setError(null);
    setDone(false);
    setMethod('opay');
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await insertCashoutRequest({
        phone: phone.trim(),
        method,
        account_details: accountDetails.trim(),
        amount,
        country_code: countryCode,
      });
      setDone(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save your request.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title="Cash Out" onClose={close}>
      {done ? (
        <div className="space-y-5 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
            <CheckCircle2 className="h-9 w-9 text-brand-600" />
          </span>
          <div>
            <p className="text-lg font-extrabold text-gray-900">Cash-out request received</p>
            <p className="mt-2 text-sm text-gray-600">
              {formattedAmount} will be sent to your {selected.label} after a quick check.
            </p>
          </div>
          <button type="button" onClick={close} className={`${primaryButtonClass} w-full`}>
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-2xl bg-gold-50 p-4 text-center">
            <p className="text-xs font-semibold text-gray-600">You are cashing out</p>
            <p className="mt-1 text-3xl font-extrabold text-brand-800">{formattedAmount}</p>
          </div>

          <div>
            <span className={labelClass}>Send it to</span>
            <div className="grid grid-cols-2 gap-3">
              {METHODS.map((item) => {
                const Icon = item.icon;
                const active = method === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setMethod(item.value)}
                    aria-pressed={active}
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-bold transition ${
                      active
                        ? 'border-brand-600 bg-brand-50 text-brand-800'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-brand-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="cashout-phone" className={labelClass}>
              Your phone number
            </label>
            <input
              id="cashout-phone"
              type="tel"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="080 0000 0000"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="cashout-account" className={labelClass}>
              {selected.hint}
            </label>
            <input
              id="cashout-account"
              type="text"
              required
              value={accountDetails}
              onChange={(event) => setAccountDetails(event.target.value)}
              className={inputClass}
            />
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <button type="submit" disabled={saving} className={`${primaryButtonClass} w-full`}>
            {saving ? 'Sending request...' : `Cash Out to ${selected.label}`}
          </button>
        </form>
      )}
    </Modal>
  );
}
