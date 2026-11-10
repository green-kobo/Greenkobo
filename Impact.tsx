import { Globe2, Droplets, Wallet } from 'lucide-react';
import { IMAGES } from '@/lib/images';
import { containerClass, sectionClass } from '@/lib/styles';

const STATS = [
  { value: '48,200', label: 'Items Recycled', icon: Droplets },
  { value: '7', label: 'Countries', icon: Globe2 },
  { value: '₦ / GH₵ / CFA', label: 'Paid Out: ₦845,000 equivalent', icon: Wallet },
];

const MARKETS = [
  { src: IMAGES.lagosMarket, city: 'Lagos', country: 'Nigeria' },
  { src: IMAGES.accraMarket, city: 'Accra', country: 'Ghana' },
  { src: IMAGES.dakarCoast, city: 'Dakar', country: 'Senegal' },
  { src: IMAGES.abidjanAerial, city: 'Abidjan', country: "Côte d'Ivoire" },
];

export default function Impact() {
  return (
    <section id="impact" className={`${sectionClass} bg-brand-50/50`}>
      <div className={containerClass}>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-brand-600">West Africa Impact</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            One movement across seven countries
          </h2>
        </div>

        <dl className="mt-14 grid gap-5 md:grid-cols-3">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-3xl border border-gray-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-400 text-brand-900">
                  <Icon className="h-6 w-6" />
                </span>
                <dt className="mt-6 text-sm font-semibold text-gray-600">{stat.label}</dt>
                <dd className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">{stat.value}</dd>
              </div>
            );
          })}
        </dl>

        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {MARKETS.map((market) => (
            <figure key={market.city} className="group relative overflow-hidden rounded-3xl">
              <img
                src={market.src}
                alt={`Market scene in ${market.city}, ${market.country}`}
                loading="lazy"
                className="h-48 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-56"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-900/90 to-transparent px-4 pb-4 pt-10">
                <p className="text-base font-bold text-white">{market.city}</p>
                <p className="text-xs font-medium text-brand-100">{market.country}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
