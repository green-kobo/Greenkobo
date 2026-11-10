import { Coins, Recycle } from 'lucide-react';

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-700 shadow-md shadow-brand-700/30">
        <Recycle className="h-5 w-5 text-brand-100" strokeWidth={2.5} />
        <span className="absolute -bottom-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold-400 ring-2 ring-white">
          <Coins className="h-3 w-3 text-gold-700" strokeWidth={2.5} />
        </span>
      </div>
      <span className="text-xl font-extrabold tracking-tight text-brand-800">
        Green<span className="text-gold-600">Kobo</span>
      </span>
    </div>
  );
}
