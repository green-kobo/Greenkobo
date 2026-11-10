import Logo from '@/components/Logo';
import { containerClass } from '@/lib/styles';

const LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Check Price', href: '#check-price' },
  { label: 'Find Center', href: '#find-center' },
  { label: 'Leaderboard', href: '#leaderboard' },
];

export default function Footer() {
  return (
    <footer className="bg-brand-900 px-5 py-14 text-brand-100 sm:px-8 lg:px-12">
      <div className={`${containerClass} flex flex-col gap-10 md:flex-row md:items-start md:justify-between`}>
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm font-semibold text-gold-300">Small Waste, Small Kobo, Big Change.</p>
          <p className="mt-4 text-sm leading-relaxed text-brand-200">
            Built in Bariga, Lagos for Green AI Competition. Clean Lagos, Rich Youth.
          </p>
        </div>

        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm font-semibold">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="transition hover:text-gold-300">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className={`${containerClass} mt-12 border-t border-white/10 pt-6 text-xs text-brand-300`}>
        © 2026 GreenKobo. All rights reserved.
      </div>
    </footer>
  );
}
