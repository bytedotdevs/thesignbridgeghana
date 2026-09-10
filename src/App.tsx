import React, { useState, useEffect } from 'react';
import { DictionaryProvider } from './context/DictionaryContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { AppHeader } from './components/common/AppHeader';
import { AppFooter } from './components/common/AppFooter';
import { ToastContainer } from './components/common/Toast';
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

export const AppContent: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  // Listen to browser popstate (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (path !== currentPath) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectSignItem = (item: GSLSearchIndexItem) => {
    navigate(`/dictionary/${item.slug}`);
  };

  const handleSelectSignBySlug = (slug: string) => {
    navigate(`/dictionary/${slug}`);
  };

  // Extract query parameters if any
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  const letterParam = urlParams.get('letter');

  // Simple clean router
  let pageContent: React.ReactNode = null;

  if (currentPath === '/' || currentPath === '') {
    pageContent = (
      <HomePage
        onNavigate={navigate}
        onSelectSign={handleSelectSignItem}
      />
    );
  } else if (currentPath === '/dictionary') {
    pageContent = (
      <DictionaryPage
        onSelectSign={handleSelectSignItem}
        initialCategory={categoryParam}
        initialLetter={letterParam}
      />
    );
  } else if (currentPath.startsWith('/dictionary/')) {
    const slug = currentPath.replace('/dictionary/', '');
    pageContent = (
      <VocabularyDetailPage
        slug={slug}
        onNavigate={navigate}
        onSelectSign={handleSelectSignBySlug}
      />
    );
  } else if (currentPath === '/categories') {
    pageContent = <CategoriesPage onNavigate={navigate} />;
  } else if (currentPath === '/alphabet') {
    pageContent = <AlphabetPage onNavigate={navigate} />;
  } else if (currentPath === '/numerals') {
    pageContent = <NumeralsPage onNavigate={navigate} />;
  } else if (currentPath === '/schools') {
    pageContent = <SchoolsPage onNavigate={navigate} />;
  } else if (currentPath === '/translate') {
    pageContent = <TranslatorPage onSelectSign={handleSelectSignBySlug} />;
  } else if (currentPath === '/favorites') {
    pageContent = (
      <FavoritesPage
        onNavigate={navigate}
        onSelectSign={handleSelectSignBySlug}
      />
    );
  } else if (currentPath === '/about') {
    pageContent = <AboutPage onNavigate={navigate} />;
  } else {
    // 404 fallback
    pageContent = (
      <div style={{ paddingTop: '60px', paddingBottom: '80px', textAlign: 'center' }}>
        <div className="app-container" style={{ maxWidth: '600px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px' }}>
            404 — Page Not Found
          </h2>
          <p style={{ color: 'var(--ink-secondary)', marginBottom: '24px' }}>
            The requested page does not exist on SignBridgeGhana.
          </p>
          <button
            onClick={() => navigate('/')}
            className="chrome-btn-primary"
            style={{ padding: '10px 24px' }}
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader
        currentPath={currentPath}
        onNavigate={navigate}
        onOpenSearch={() => navigate('/dictionary')}
      />
      <main style={{ flex: 1 }}>{pageContent}</main>
      <AppFooter onNavigate={navigate} />
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <DictionaryProvider>
      <FavoritesProvider>
        <AppContent />
      </FavoritesProvider>
    </DictionaryProvider>
  );
};

export default App;
