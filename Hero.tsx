import { ArrowRight, Coins, Recycle, ScanLine, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { IMAGES } from '@/lib/images';

const TRUST_BADGES = [
  { value: '12,400+', label: 'Items Recycled' },
  { value: '1,250', label: 'Users in Bariga' },
  { value: '₦184,500', label: 'Paid Out' },
];

export default function Hero() {
  const { t } = useLanguage();
  const [titleStart, titleEnd] = t('heroTitle').split('GreenKobo');

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 px-5 pb-20 pt-28 text-white sm:px-8 lg:px-12 lg:pb-28 lg:pt-36"
    >
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gold-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-brand-400/30 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-gold-200 backdrop-blur">
            <Recycle className="h-3.5 w-3.5" />
            Small Waste, Small Kobo, Big Change.
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            {titleStart}
            <span className="bg-gradient-to-r from-gold-200 via-gold-300 to-gold-400 bg-clip-text text-transparent">
              GreenKobo
            </span>
            {titleEnd}
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-brand-100 sm:text-xl">
            {t('heroSubtitle')}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#scanner"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gold-400 px-7 py-3.5 text-base font-extrabold text-brand-900 shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-gold-300"
            >
              {t('heroPrimary')}
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </a>
            <a
              href="#check-price"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/40 px-7 py-3.5 text-base font-bold text-white transition hover:-translate-y-0.5 hover:border-white hover:bg-white/10"
            >
              {t('heroSecondary')}
            </a>
          </div>

          <dl className="mt-10 grid grid-cols-3 gap-3 sm:gap-6">
            {TRUST_BADGES.map((badge) => (
              <div key={badge.label} className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur sm:p-4">
                <dt className="text-xs font-semibold text-brand-100 sm:text-sm">{badge.label}</dt>
                <dd className="mt-1 text-lg font-extrabold text-white sm:text-2xl">{badge.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative animate-fade-up [animation-delay:150ms]">
          <div className="relative overflow-hidden rounded-[2rem] shadow-2xl shadow-black/30 ring-1 ring-white/20">
            <img
              src={IMAGES.hero}
              alt="A smiling young Nigerian woman sorting recyclable waste for recycling"
              className="h-[420px] w-full object-cover sm:h-[500px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-900/60 via-transparent to-transparent" />
          </div>

          <div className="absolute -left-2 bottom-8 w-56 rounded-2xl bg-white p-4 text-gray-900 shadow-2xl sm:-left-8 sm:w-64">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500">Wallet balance</p>
              <span className="flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700">
                <TrendingUp className="h-3 w-3" />
                +18%
              </span>
            </div>
            <p className="mt-1 text-3xl font-extrabold tracking-tight text-brand-800">₦2,450</p>
            <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3 text-xs text-gray-600">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-100">
                <Coins className="h-4 w-4 text-gold-700" />
              </span>
              Just cashed out to Opay
            </div>
          </div>

          <div className="absolute -right-2 top-6 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-gray-900 shadow-xl sm:-right-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <ScanLine className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-extrabold">12 items</p>
              <p className="text-xs text-gray-500">scanned just now</p>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
