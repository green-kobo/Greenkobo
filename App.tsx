import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import JoinChoice from '@/components/JoinChoice';
import PriceCard from '@/components/PriceCard';
import ScannerDemo from '@/components/ScannerDemo';
import HowItWorks from '@/components/HowItWorks';
import FindCenter from '@/components/FindCenter';
import Leaderboard from '@/components/Leaderboard';
import Impact from '@/components/Impact';
import Footer from '@/components/Footer';
import PageShell from '@/components/PageShell';
import RegisterCenterPage from '@/components/RegisterCenterPage';
import DashboardPage from '@/components/DashboardPage';
import { AuthProvider } from '@/context/AuthContext';
import { CountryProvider } from '@/context/CountryContext';
import { LanguageProvider } from '@/context/LanguageContext';

function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <JoinChoice />
        <PriceCard />
        <ScannerDemo />
        <HowItWorks />
        <FindCenter />
        <Leaderboard />
        <Impact />
      </main>
      <Footer />
    </div>
  );
}

function FindCenterPage() {
  return (
    <PageShell>
      <FindCenter />
    </PageShell>
  );
}

function renderRoute(pathname: string) {
  switch (pathname) {
    case '/find-center':
      return <FindCenterPage />;
    case '/register-center':
      return <RegisterCenterPage />;
    case '/dashboard':
      return <DashboardPage />;
    default:
      return <HomePage />;
  }
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CountryProvider>{renderRoute(window.location.pathname)}</CountryProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
