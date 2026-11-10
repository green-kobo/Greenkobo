import { useCallback, useEffect, useState } from 'react';
import { Banknote, Recycle, Truck, Users } from 'lucide-react';
import PageShell from '@/components/PageShell';
import { useCountry } from '@/context/CountryContext';
import { fetchDashboardStats, type DashboardStats } from '@/lib/api';
import { formatMoney } from '@/lib/countries';
import { containerClass, inputClass, labelClass } from '@/lib/styles';

type LoadStatus = 'loading' | 'ready' | 'error';

export default function DashboardPage() {
  const { country } = useCountry();
  const [area, setArea] = useState('');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [status, setStatus] = useState<LoadStatus>('loading');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      setStats(await fetchDashboardStats(country.code, area.trim()));
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, [country.code, area]);

  useEffect(() => {
    void load();
  }, [load]);

  const cards = stats
    ? [
        { label: 'Total Items Collected', value: stats.total_bottles.toLocaleString('en-US'), icon: Recycle },
        { label: 'Total Paid Out', value: formatMoney(stats.total_paid_out, 'NG'), icon: Banknote },
        { label: 'Active Sellers Near You', value: stats.active_sellers.toLocaleString('en-US'), icon: Users },
        { label: 'New Pickup Requests', value: stats.new_pickup_requests.toLocaleString('en-US'), icon: Truck },
      ]
    : [];

  return (
    <PageShell>
      <section className="px-5 py-12 sm:px-8 lg:py-16">
        <div className={containerClass}>
          <p className="text-sm font-bold uppercase tracking-wider text-brand-600">Recycler Dashboard</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Your recycling activity in {country.name}
          </h1>

          <div className="mt-8 max-w-sm">
            <label htmlFor="dash-area" className={labelClass}>Your area</label>
            <input id="dash-area" value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Bariga (leave empty for all)" className={inputClass} />
          </div>

          {status === 'loading' && <p className="mt-10 text-sm text-gray-500">Loading your numbers...</p>}
          {status === 'error' && (
            <div role="alert" className="mt-10 rounded-2xl bg-red-50 p-5 text-sm font-medium text-red-700">
              We could not load the dashboard.{' '}
              <button type="button" onClick={() => void load()} className="font-bold underline">Try again</button>
            </div>
          )}

          {status === 'ready' && (
            <dl className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {cards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                      <Icon className="h-5 w-5" />
                    </span>
                    <dt className="mt-5 text-sm font-semibold text-gray-600">{card.label}</dt>
                    <dd className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900">{card.value}</dd>
                  </div>
                );
              })}
            </dl>
          )}
        </div>
      </section>
    </PageShell>
  );
}
