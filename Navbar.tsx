import { useEffect, useState } from 'react';
import { ChevronDown, LogOut, Menu, X } from 'lucide-react';
import Logo from '@/components/Logo';
import Modal from '@/components/Modal';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/context/AuthContext';
import { useCountry } from '@/context/CountryContext';
import { useLanguage } from '@/context/LanguageContext';
import { COUNTRIES, type CountryCode } from '@/lib/countries';
import { LANGUAGES, type Language, type TranslationKey } from '@/lib/i18n';
import { primaryButtonClass } from '@/lib/styles';

const NAV_LINKS: { key: TranslationKey; href: string }[] = [
  { key: 'navHome', href: '/' },
  { key: 'navHowItWorks', href: '/#how-it-works' },
  { key: 'navCheckPrice', href: '/#check-price' },
  { key: 'navFindCenter', href: '/find-center' },
  { key: 'navDashboard', href: '/dashboard' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { country, setCountryCode } = useCountry();
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);
  const changeCountry = (code: string) => setCountryCode(code as CountryCode);
  const changeLanguage = (code: string) => setLanguage(code as Language);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-white/85 shadow-[0_1px_0_rgba(15,23,42,0.06)] backdrop-blur-md' : 'bg-white/95 backdrop-blur'
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3 sm:px-8 lg:px-12">
        <a href="/" aria-label="GreenKobo home">
          <Logo />
        </a>

        <ul className="hidden items-center gap-1 xl:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-full px-3 py-2 text-sm font-medium text-gray-500 transition hover:text-brand-700"
              >
                {t(link.key)}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <span className="sr-only">Country</span>
            <select
              value={country.code}
              onChange={(event) => changeCountry(event.target.value)}
              className="appearance-none rounded-full bg-transparent py-2 pl-3 pr-7 text-sm font-medium text-gray-600 outline-none transition hover:text-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              {COUNTRIES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.name} ({item.symbol})
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          </div>

          <div
            role="group"
            aria-label={t('languageLabel')}
            className="hidden items-center gap-0.5 rounded-full p-1 text-xs font-semibold sm:flex"
          >
            {LANGUAGES.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => changeLanguage(item.code)}
                aria-pressed={language === item.code}
                className={`rounded-full px-3 py-1.5 transition ${
                  language === item.code ? 'bg-gray-100 text-brand-700' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {item.code.toUpperCase()}
              </button>
            ))}
          </div>

          {user ? (
            <button
              type="button"
              onClick={() => void signOut()}
              title={user.email ?? t('logout')}
              className="hidden items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-sm font-bold text-brand-700 transition hover:bg-brand-100 lg:inline-flex"
            >
              {t('logout')}
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              className="hidden rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 transition hover:border-brand-300 hover:text-brand-700 lg:inline-flex"
            >
              {t('login')}
            </button>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="rounded-full p-2 text-gray-700 transition hover:bg-gray-100 xl:hidden"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      <Modal open={menuOpen} title="Menu" onClose={closeMenu}>
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-gray-700">{t('searchCountry')}</span>
            <select
              value={country.code}
              onChange={(event) => changeCountry(event.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:border-brand-500"
            >
              {COUNTRIES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.name} ({item.symbol})
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-gray-700">{t('languageLabel')}</span>
            <select
              value={language}
              onChange={(event) => changeLanguage(event.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:border-brand-500"
            >
              {LANGUAGES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <ul className="space-y-1">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={closeMenu}
                className="block rounded-xl px-4 py-3 text-base font-semibold text-gray-800 transition hover:bg-brand-50 hover:text-brand-700"
              >
                {t(link.key)}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          {user ? (
            <button
              type="button"
              onClick={() => {
                closeMenu();
                void signOut();
              }}
              className={`${primaryButtonClass} w-full`}
            >
              {t('logout')}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                closeMenu();
                setAuthOpen(true);
              }}
              className={`${primaryButtonClass} w-full`}
            >
              {t('login')}
            </button>
          )}
        </div>
      </Modal>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </header>
  );
}
