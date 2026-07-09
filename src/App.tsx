
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '@/src/Pages/components/Navbar';
import { Footer } from '@/src/Pages/components/Footer';
import { AboutUs } from '@/src/Pages/components/AboutUs';
import ProtectedRoute from '@/src/Pages/components/ProtectedRoute';
import { LanguageProvider } from '@/src/Pages/contexts/LanguageContext';
import { AuthProvider } from '@/src/Pages/contexts/AuthContext';
import { ThemeProvider } from '@/src/Pages/components/ThemeContext';
import HomePage from '@/src/Pages/contexts/HomePage';
import PlansPage from '@/src/Pages/contexts/PlansPage';
import MaintenancePage from '@/src/Pages/contexts/MaintenancePage';
import PortfolioPage from '@/src/Pages/contexts/PortfolioPage';
import PaymentPage from '@/src/Pages/components/PaymentPage';
import ProfilePage from '@/src/Pages/components/ProfilePage';
import ProfilePanel from '@/src/Pages/components/Auth/ProfilePanel';
import LoginPage from '@/src/Pages/components/Auth/Login';
import RegisterPage from '@/src/Pages/components/Auth/Register';
import ForgotPasswordPage from '@/src/Pages/contexts/ForgotPasswordPage';
import AdminPage from '@/src/Pages/components/Admin/AdminPage';
import NotFoundPage from '@/src/Pages/components/NotFoundPage';
import SuccessPage from '@/src/Pages/components/SuccessPage';
import ChatWidget from '@/src/Pages/components/ChatWidget';
import TermsOfUse from '@/src/Pages/components/Legal/TermsOfUse';
import CookieBanner from '@/src/Pages/components/CookieBanner';



// Component to scroll to top on route change

const ScrollToTop = () => {

  const { pathname } = useLocation();

  useEffect(() => {

    window.scrollTo(0, 0);

  }, [pathname]);

  return null;

};


const AppContent: React.FC = () => {
  const location = useLocation();
  const isPaymentPage = location.pathname === '/pagamento';
  const isAdminPage = location.pathname === '/admin';
  const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);
  const navigate = useNavigate();

  const handleGoToPricing = () => {
    setIsAboutUsOpen(false);
    navigate('/planos');
  };

  return (
    <div className="bg-nexa-dark min-h-screen text-white selection:bg-nexa-primary selection:text-black font-sans flex flex-col">
      <ScrollToTop />
      {!isPaymentPage && !isAdminPage && <Navbar onAboutUsClick={() => setIsAboutUsOpen(true)} />}
      <main className={`flex-grow ${isAdminPage ? '' : 'pb-16'}`}>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute clientOnly allowGuest>
              <HomePage />
            </ProtectedRoute>
          } />
          <Route path="/planos" element={
            <ProtectedRoute clientOnly allowGuest>
              <PlansPage />
            </ProtectedRoute>
          } />
          <Route path="/manutencao" element={
            <ProtectedRoute clientOnly allowGuest>
              <MaintenancePage />
            </ProtectedRoute>
          } />
          <Route path="/portfolio" element={
            <ProtectedRoute clientOnly allowGuest>
              <PortfolioPage />
            </ProtectedRoute>
          } />
          <Route path="/pagamento" element={
            <ProtectedRoute clientOnly>
              <PaymentPage />
            </ProtectedRoute>
          } />
          <Route path="/login" element={
            <ProtectedRoute clientOnly allowGuest>
              <LoginPage />
            </ProtectedRoute>
          } />
          <Route path="/cadastro" element={
            <ProtectedRoute clientOnly allowGuest>
              <RegisterPage />
            </ProtectedRoute>
          } />
          <Route path="/esqueci-senha" element={
            <ProtectedRoute clientOnly allowGuest>
              <ForgotPasswordPage />
            </ProtectedRoute>
          } />
          <Route path="/perfil" element={
            <ProtectedRoute clientOnly>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/perfil/editar" element={
            <ProtectedRoute clientOnly>
              <ProfilePanel />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <AdminPage />
            </ProtectedRoute>
          } />
          <Route path="/success" element={
            <ProtectedRoute clientOnly allowGuest>
              <SuccessPage />
            </ProtectedRoute>
          } />
          <Route path="/termos-de-uso" element={<TermsOfUse />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {!isPaymentPage && !isAdminPage && <Footer onAboutUsClick={() => setIsAboutUsOpen(true)} />}

      <AboutUs
        isOpen={isAboutUsOpen}
        onClose={() => setIsAboutUsOpen(false)}
        onGoToPricing={handleGoToPricing}
      />
      {!isAdminPage && <ChatWidget />}
      <CookieBanner />
    </div>
  );
};



const App: React.FC = () => {

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppContent />
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );

};



export default App;
