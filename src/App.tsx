import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { DictionaryProvider } from './context/DictionaryContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { AppHeader } from './components/common/AppHeader';
import { AppFooter } from './components/common/AppFooter';
import { ToastContainer } from './components/common/Toast';
import { PWAInstallPrompt } from './components/common/PWAInstallPrompt';
import { HomePage } from './pages/HomePage';
import { DictionaryPage } from './pages/DictionaryPage';
import { VocabularyDetailPage } from './pages/VocabularyDetailPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { AlphabetPage } from './pages/AlphabetPage';
import { NumeralsPage } from './pages/NumeralsPage';
import { SchoolsPage } from './pages/SchoolsPage';
import { TranslatorPage } from './pages/TranslatorPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { AboutPage } from './pages/AboutPage';
import { GSLSearchIndexItem } from './types/dictionary';

const NotFoundPage: React.FC<{ onNavigate: (p: string) => void }> = ({ onNavigate }) => (
  <div style={{ paddingTop: '80px', paddingBottom: '80px', textAlign: 'center' }}>
    <div className="app-container" style={{ maxWidth: '600px' }}>
      <h2 style={{ fontSize: '48px', fontWeight: 800, marginBottom: '8px', color: 'var(--ink-primary)' }}>404</h2>
      <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink-secondary)', marginBottom: '8px' }}>Page Not Found</p>
      <p style={{ color: 'var(--ink-muted)', marginBottom: '24px' }}>
        The requested page does not exist on SignBridgeGhana.
      </p>
      <button
        onClick={() => onNavigate('/')}
        className="chrome-btn-primary"
        style={{ padding: '10px 24px' }}
      >
        Return Home
      </button>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const handleNavigate = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSignItem = (item: GSLSearchIndexItem) => {
    navigate(`/dictionary/${item.slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSignBySlug = (slug: string) => {
    navigate(`/dictionary/${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader
        currentPath={currentPath}
        onNavigate={handleNavigate}
        onOpenSearch={() => handleNavigate('/dictionary')}
      />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                onNavigate={handleNavigate}
                onSelectSign={handleSelectSignItem}
              />
            }
          />
          <Route
            path="/dictionary"
            element={
              <DictionaryPage
                onSelectSign={handleSelectSignItem}
                initialCategory={new URLSearchParams(location.search).get('category')}
                initialLetter={new URLSearchParams(location.search).get('letter')}
              />
            }
          />
          <Route
            path="/dictionary/:slug"
            element={
              <VocabularyDetailPageWrapper
                onNavigate={handleNavigate}
                onSelectSign={handleSelectSignBySlug}
              />
            }
          />
          <Route path="/categories" element={<CategoriesPage onNavigate={handleNavigate} />} />
          <Route path="/alphabet" element={<AlphabetPage onNavigate={handleNavigate} />} />
          <Route path="/numerals" element={<NumeralsPage onNavigate={handleNavigate} />} />
          <Route path="/schools" element={<SchoolsPage onNavigate={handleNavigate} />} />
          <Route
            path="/translate"
            element={<TranslatorPage onSelectSign={handleSelectSignBySlug} />}
          />
          <Route
            path="/favorites"
            element={
              <FavoritesPage
                onNavigate={handleNavigate}
                onSelectSign={handleSelectSignBySlug}
              />
            }
          />
          <Route path="/about" element={<AboutPage onNavigate={handleNavigate} />} />
          <Route path="*" element={<NotFoundPage onNavigate={handleNavigate} />} />
        </Routes>
      </main>
      <AppFooter onNavigate={handleNavigate} />
      <ToastContainer />
      <PWAInstallPrompt />
    </div>
  );
};

/**
 * Wrapper to extract :slug param for VocabularyDetailPage
 */
const VocabularyDetailPageWrapper: React.FC<{
  onNavigate: (path: string) => void;
  onSelectSign: (slug: string) => void;
}> = ({ onNavigate, onSelectSign }) => {
  const location = useLocation();
  const slug = location.pathname.replace('/dictionary/', '');
  return (
    <VocabularyDetailPage
      slug={slug}
      onNavigate={onNavigate}
      onSelectSign={onSelectSign}
    />
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <DictionaryProvider>
        <FavoritesProvider>
          <AppContent />
        </FavoritesProvider>
      </DictionaryProvider>
    </BrowserRouter>
  );
};

export default App;
