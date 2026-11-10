import { Banknote, Camera, Recycle } from 'lucide-react';
import { IMAGES } from '@/lib/images';
import { containerClass, sectionClass } from '@/lib/styles';

const STEPS = [
  {
    number: '01',
    title: 'Gather Your Waste',
    description: 'Collect plastic, cans, glass, paper and e-waste from your home, shop, or street. Keep each type in its own bag.',
    image: IMAGES.stepGather,
    icon: Recycle,
  },
  {
    number: '02',
    title: 'Snap & Scan With AI',
    description: 'Take a photo of your waste. Our AI identifies each type and weighs it at today\'s price.',
    image: IMAGES.stepScan,
    icon: Camera,
  },
  {
    number: '03',
    title: 'Get Cash or Take To Center',
    description: 'Cash out straight to Opay or your bank, or drop the bag at a nearby center for the same price.',
    image: IMAGES.stepCash,
    icon: Banknote,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className={`${sectionClass} bg-white`}>
      <div className={containerClass}>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-brand-600">How It Works</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Three steps from gutter to GreenKobo
          </h2>
          <p className="mt-4 text-base text-gray-600">
            No app setup headaches and no minimum weight. If you can carry a bag, you can earn.
          </p>
        </div>

        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <li
                key={step.number}
                className="group flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-900/10"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={step.image}
                    alt={step.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-gold-400 px-3 py-1 text-sm font-extrabold text-brand-900 shadow">
                    Step {step.number}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-xl font-extrabold text-gray-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{step.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
