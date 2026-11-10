import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { AlertCircle, Camera, CheckCircle2, ImagePlus, RotateCcw, ScanLine, Sparkles, Wallet } from 'lucide-react';
import CashOutModal from '@/components/CashOutModal';
import Logo from '@/components/Logo';
import { useCountry } from '@/context/CountryContext';
import { scanWastePhoto } from '@/lib/api';
import { formatMoney } from '@/lib/countries';
import { IMAGES } from '@/lib/images';
import { readPhotoAsJpeg } from '@/lib/scanImage';
import { containerClass, primaryButtonClass, sectionClass, secondaryButtonClass } from '@/lib/styles';
import { getWasteType, type WasteTypeId } from '@/lib/wasteTypes';

const BAG_TARGET = 50;

const FEATURES = [
  'AI identifies plastic, cans, glass, paper and e-waste in one photo',
  'Estimates the weight of each type and prices it at today\'s rate',
  'Cash out to Opay or your bank in minutes',
];

type ScanStage = 'idle' | 'scanning' | 'done' | 'error';
type ScanRow = { type: WasteTypeId; count: number; kg: string };

const SCAN_FAILED = 'The scan failed. Please try again.';

export default function ScannerDemo() {
  const { country, wastePrices } = useCountry();
  const uploadRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [stage, setStage] = useState<ScanStage>('idle');
  const [rows, setRows] = useState<ScanRow[]>([]);
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState(SCAN_FAILED);
  const [cashOutOpen, setCashOutOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, [photoUrl]);

  const runScan = async (file: File) => {
    setPhotoUrl(URL.createObjectURL(file));
    setStage('scanning');
    setRows([]);
    setNotes('');
    try {
      const image = await readPhotoAsJpeg(file);
      const result = await scanWastePhoto(image);
      setRows(result.items.map((item) => ({ type: item.type, count: item.count, kg: String(item.estimated_kg) })));
      setNotes(result.notes);
      setStage('done');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : SCAN_FAILED);
      setStage('error');
    }
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) void runScan(file);
  };

  const resetScan = () => {
    setPhotoUrl(null);
    setRows([]);
    setNotes('');
    setStage('idle');
  };

  const updateKg = (type: WasteTypeId, kg: string) => {
    setRows((prev) => prev.map((row) => (row.type === type ? { ...row, kg } : row)));
  };

  const priced = rows.map((row) => {
    const kg = Number(row.kg);
    const valid = row.kg.trim() !== '' && Number.isFinite(kg) && kg >= 0;
    const price = wastePrices[row.type];
    return { ...row, kg, valid, price, amount: valid && price !== undefined ? kg * price : null };
  });
  const totalCount = rows.reduce((sum, row) => sum + row.count, 0);
  const totalKg = priced.reduce((sum, row) => sum + (row.valid ? row.kg : 0), 0);
  const hasPrice = priced.length > 0 && priced.every((row) => row.amount !== null);
  const cash = priced.reduce((sum, row) => sum + (row.amount ?? 0), 0);
  const bagPercent = Math.min(100, Math.round((totalCount / BAG_TARGET) * 100));

  return (
    <section id="scanner" className={`${sectionClass} overflow-hidden bg-gradient-to-b from-white to-brand-50/60`}>
      <div className={`${containerClass} grid items-center gap-14 lg:grid-cols-2`}>
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-brand-600">Sell Your Waste</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Snap your waste. Our AI does the sorting.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            Point your phone at your waste and GreenKobo tells you what each type is worth in seconds. No sorting, no
            guessing, no haggling.
          </p>
          <ul className="mt-8 space-y-4">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-base font-semibold text-gray-800">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-[320px]">
          <div className="rounded-[2.75rem] bg-gray-900 p-3 shadow-2xl shadow-brand-900/30 ring-1 ring-gray-700">
            <div className="flex h-[600px] flex-col overflow-hidden rounded-[2.25rem] bg-white">
              <div className="flex items-center justify-between px-6 pb-2 pt-4 text-[11px] font-bold text-gray-800">
                <span>9:41</span>
                <span className="h-5 w-24 rounded-full bg-gray-900" />
                <span className="text-gray-500">100%</span>
              </div>

              <div className="flex items-center justify-between px-5 pb-3 pt-2">
                <Logo className="scale-90 origin-left" />
              </div>

              <div className="flex-1 overflow-y-auto px-5 pb-6">
                <div className="relative h-52 overflow-hidden rounded-2xl bg-gray-100">
                  <img
                    src={photoUrl ?? IMAGES.demoWaste}
                    alt="Mixed recyclable waste ready to be scanned"
                    className="h-full w-full object-cover"
                  />
                  {stage === 'scanning' && (
                    <>
                      <div className="absolute inset-0 bg-brand-900/20" />
                      <div className="absolute inset-x-0 h-1 animate-scan-line bg-gradient-to-r from-transparent via-brand-300 to-transparent shadow-[0_0_16px_4px_rgba(108,199,151,0.6)]" />
                    </>
                  )}
                  <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-brand-800 backdrop-blur">
                    <ScanLine className="h-3.5 w-3.5" />
                    {stage === 'done' ? 'Scan complete' : stage === 'scanning' ? 'Scanning' : 'Ready to scan'}
                  </span>
                </div>

                {(stage === 'idle' || stage === 'error') && (
                  <div className="animate-fade-up mt-5 space-y-3">
                    {stage === 'error' && (
                      <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        {errorMessage}
                      </p>
                    )}
                    <button type="button" onClick={() => uploadRef.current?.click()} className={`${primaryButtonClass} w-full`}>
                      <ImagePlus className="h-4 w-4" />
                      Upload Waste Photo
                    </button>
                    <button type="button" onClick={() => cameraRef.current?.click()} className={`${secondaryButtonClass} w-full`}>
                      <Camera className="h-4 w-4" />
                      Use Camera
                    </button>
                  </div>
                )}

                {stage === 'scanning' && (
                  <div className="animate-fade-up mt-6 flex items-center gap-3 text-sm font-bold text-gray-800">
                    <Sparkles className="h-4 w-4 animate-pulse text-brand-600" />
                    AI is sorting and weighing your waste...
                  </div>
                )}

                {stage === 'done' && (
                  <div className="animate-fade-up mt-5 space-y-4">
                    <div className="rounded-2xl border border-brand-100 bg-white p-4 shadow-sm">
                      {rows.length === 0 ? (
                        <p className="text-sm font-semibold text-gray-700">
                          No recyclable waste found in this photo. {notes}
                        </p>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 text-sm font-bold text-brand-700">
                            <Sparkles className="h-4 w-4" />
                            AI Detected {totalCount} Items
                          </div>
                          <ul className="mt-3 divide-y divide-gray-100">
                            {priced.map((row) => {
                              const label = getWasteType(row.type).shortLabel;
                              return (
                                <li key={row.type} className="py-2">
                                  <div className="flex items-center justify-between gap-2 text-xs">
                                    <span className="font-semibold text-gray-700">
                                      {label} ({row.count})
                                    </span>
                                    <span className="font-extrabold text-gray-900">
                                      {row.amount === null ? '--' : formatMoney(row.amount, country.code)}
                                    </span>
                                  </div>
                                  <label className="mt-1 flex items-center gap-2 text-[11px] font-semibold text-gray-500">
                                    Weight (kg)
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={row.kg}
                                      onChange={(e) => updateKg(row.type, e.target.value)}
                                      aria-label={`${label} weight in kg`}
                                      className="w-20 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-900 focus:border-brand-500 focus:outline-none"
                                    />
                                    {row.price === undefined && <span className="text-amber-700">Price not set</span>}
                                  </label>
                                </li>
                              );
                            })}
                          </ul>
                          <div className="mt-3 flex items-center justify-between rounded-xl bg-gold-50 p-3">
                            <div>
                              <p className="text-[11px] font-semibold text-gray-500">Total weight: {totalKg.toFixed(2)}kg</p>
                              <p className="text-[11px] font-semibold text-gray-500">Your Cash</p>
                            </div>
                            <p className="text-lg font-extrabold text-brand-800">
                              {hasPrice ? formatMoney(cash, country.code) : '--'}
                            </p>
                          </div>
                          <p className="mt-2 text-[10px] leading-snug text-gray-500">
                            AI estimates the weight. Adjust any line if it looks off before you cash out.
                          </p>
                        </>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
                        <span>
                          {totalCount} of {BAG_TARGET} items to a full bag
                        </span>
                        <span className="text-brand-700">{bagPercent}%</span>
                      </div>
                      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-brand-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400"
                          style={{ width: `${bagPercent}%` }}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCashOutOpen(true)}
                      disabled={!hasPrice || cash <= 0}
                      className={`${primaryButtonClass} w-full`}
                    >
                      <Wallet className="h-4 w-4" />
                      Cash Out to Opay / Bank
                    </button>
                    <button
                      type="button"
                      onClick={resetScan}
                      className="flex w-full items-center justify-center gap-2 py-2 text-sm font-semibold text-gray-500 transition hover:text-brand-700"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Scan another photo
                    </button>
                  </div>
                )}

                <input ref={uploadRef} type="file" accept="image/*" className="sr-only" onChange={handleFile} />
                <input
                  ref={cameraRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  onChange={handleFile}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <CashOutModal
        open={cashOutOpen}
        onClose={() => setCashOutOpen(false)}
        amount={cash}
        countryCode={country.code}
      />
    </section>
  );
}
