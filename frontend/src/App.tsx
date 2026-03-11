import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ConversationPage } from './pages/ConversationPage';
import { VoiceCallPage } from './pages/VoiceCallPage';
import { VoiceCallsPage } from './pages/VoiceCallsPage';
import { LeadsPage } from './pages/LeadsPage';
import { CustomersPage } from './pages/CustomersPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';

import './App.css';

function App() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1
      }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <AuthProvider>
          <SocketProvider>
            <Router>
              <div className="App">
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      duration: 3000,
                      iconTheme: {
                        primary: '#4caf50',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      duration: 4000,
                      iconTheme: {
                        primary: '#f44336',
                        secondary: '#fff',
                      },
                    },
                  }}
                />

                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  <Route
                    path="*"
                    element={
                      <div className="app-wrapper">
                        <Header />
                        <div className="main-content">
                          {!isMobile && <Sidebar />}
                          <div className="content-area">
                            <Routes>
                              <Route path="/" element={<Navigate to="/dashboard" replace />} />
                              <Route path="/dashboard" element={<DashboardPage />} />
                              <Route path="/conversations/:id" element={<ConversationPage />} />
                              <Route path="/conversations" element={<Navigate to="/dashboard" replace />} />
                              <Route path="/voice-call/:id" element={<VoiceCallPage />} />
                              <Route path="/voice-calls" element={<VoiceCallsPage />} />
                              <Route path="/voice-call" element={<Navigate to="/voice-calls" replace />} />
                              <Route path="/leads" element={<LeadsPage />} />
                              <Route path="/customers" element={<CustomersPage />} />
                              <Route path="/settings" element={<SettingsPage />} />
                              <Route path="*" element={<NotFoundPage />} />
                            </Routes>
                          </div>
                        </div>
                      </div>
                    }
                  />
                </Routes>
              </div>
            </Router>
          </SocketProvider>
        </AuthProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;