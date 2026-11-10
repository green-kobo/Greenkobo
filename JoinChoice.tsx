import { useState } from 'react';
import { ArrowRight, Store, Wallet } from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import { useLanguage } from '@/context/LanguageContext';
import { containerClass } from '@/lib/styles';

export default function JoinChoice() {
  const { t } = useLanguage();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-12">
      <div className={containerClass}>
        <h2 className="text-center text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
          {t('joinTitle')}
        </h2>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="group flex flex-col items-start rounded-3xl bg-brand-600 p-7 text-left text-white shadow-xl shadow-brand-600/25 transition hover:-translate-y-1 hover:bg-brand-700 sm:p-8"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
              <Wallet className="h-7 w-7" />
            </span>
            <span className="mt-6 text-2xl font-extrabold">{t('joinSellTitle')}</span>
            <span className="mt-2 text-sm leading-relaxed text-brand-100">{t('joinSellText')}</span>
            <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold-400 px-5 py-2.5 text-sm font-extrabold text-brand-900">
              {t('joinSellButton')}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </button>

          <a
            href="/register-center"
            className="group flex flex-col items-start rounded-3xl border-2 border-brand-200 bg-brand-50 p-7 text-left text-brand-900 transition hover:-translate-y-1 hover:border-brand-500 sm:p-8"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
              <Store className="h-7 w-7 text-brand-700" />
            </span>
            <span className="mt-6 text-2xl font-extrabold">{t('joinCenterTitle')}</span>
            <span className="mt-2 text-sm leading-relaxed text-brand-800">{t('joinCenterText')}</span>
            <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-700 px-5 py-2.5 text-sm font-extrabold text-white">
              {t('joinCenterButton')}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </a>
        </div>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </section>
  );
}
