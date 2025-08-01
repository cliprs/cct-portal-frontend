import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider, App as AntApp } from 'antd';
import { store } from './store';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Profile from './pages/Profile';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import Transfer from './pages/Transfer';
import History from './pages/History';
import KYCUpload from './pages/KYC/KYCUpload';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

// Ant Design theme configuration
const theme = {
  token: {
    colorPrimary: '#27408b',
    colorInfo: '#27408b',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    borderRadius: 8,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Layout: {
      siderBg: '#27408b',
      headerBg: '#ffffff',
    },
    Menu: {
      darkItemBg: 'transparent',
      darkItemSelectedBg: 'rgba(255, 255, 255, 0.1)',
      darkItemHoverBg: 'rgba(255, 255, 255, 0.05)',
    },
    Card: {
      borderRadiusLG: 12,
    },
  },
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ConfigProvider theme={theme}>
        <AntApp>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* Auth Routes - MainLayout dışında */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Routes - MainLayout içinde */}
                <Route
                  path="/*"
                  element={
                    <MainLayout>
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/accounts" element={<Accounts />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/deposit" element={<Deposit />} />
                        <Route path="/withdraw" element={<Withdraw />} />
                        <Route path="/transfer" element={<Transfer />} />
                        <Route path="/history" element={<History />} />
                        {/* ✅ KYC Routes Eklendi */}
                        <Route path="/kyc" element={<KYCUpload />} />
                        <Route path="/kyc/upload" element={<KYCUpload />} />
                      </Routes>
                    </MainLayout>
                  }
                />
              </Routes>
            </div>
          </Router>
        </AntApp>
      </ConfigProvider>
    </Provider>
  );
};

export default App;