import { useCallback, useEffect, useState } from 'react';
import { Medal, Trophy } from 'lucide-react';
import { fetchLeaderboard, type Recycler } from '@/lib/api';
import { formatMoney } from '@/lib/countries';
import { containerClass, sectionClass } from '@/lib/styles';

type LoadStatus = 'loading' | 'ready' | 'error';

export default function Leaderboard() {
  const [recyclers, setRecyclers] = useState<Recycler[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      setRecyclers(await fetchLeaderboard());
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const podiumStyles = [
    'bg-gold-400 text-brand-900',
    'bg-gray-200 text-gray-800',
    'bg-orange-200 text-orange-900',
  ];

  return (
    <section id="leaderboard" className={`${sectionClass} bg-white`}>
      <div className={containerClass}>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-brand-600">Leaderboard</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Top recyclers in Lagos
          </h2>
          <p className="mt-4 text-base text-gray-600">Real people, real waste, real kobo. Join them this week.</p>
        </div>

        {status === 'loading' && <p className="mt-12 text-center text-sm text-gray-500">Loading leaderboard...</p>}
        {status === 'error' && (
          <div role="alert" className="mx-auto mt-12 max-w-md rounded-2xl bg-red-50 p-5 text-center text-sm font-medium text-red-700">
            We could not load the leaderboard.{' '}
            <button type="button" onClick={() => void load()} className="font-bold underline">
              Try again
            </button>
          </div>
        )}

        {status === 'ready' && recyclers.length > 0 && (
          <div className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-brand-900/5">
            <ol className="divide-y divide-gray-100">
              {recyclers.map((recycler, index) => (
                <li
                  key={recycler.id}
                  className={`flex items-center gap-4 px-5 py-4 transition hover:bg-brand-50/60 sm:px-7 ${
                    index === 0 ? 'bg-gold-50/60' : ''
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${
                      index < 3 ? podiumStyles[index] : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {index < 3 ? <Trophy className="h-4 w-4" /> : index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-extrabold text-gray-900">
                      {recycler.display_name}
                      <span className="ml-2 text-sm font-semibold text-gray-500">{recycler.area}</span>
                    </p>
                    <p className="text-sm text-gray-600">{recycler.bottles.toLocaleString('en-US')} items</p>
                  </div>
                  <p className="flex items-center gap-1.5 text-base font-extrabold text-brand-800">
                    {index === 0 && <Medal className="h-4 w-4 text-gold-600" />}
                    {formatMoney(recycler.naira_earned, 'NG')}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}
