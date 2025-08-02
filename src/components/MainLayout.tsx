import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Badge, Avatar, Dropdown, Typography, Space, Divider, Input, message } from 'antd';
import {
  DashboardOutlined,
  BankOutlined,
  UserOutlined,
  DollarOutlined,
  SwapOutlined,
  SendOutlined,
  HistoryOutlined,
  BellOutlined,
  MenuOutlined,
  QuestionCircleOutlined,
  LogoutOutlined,
  SettingOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  AuditOutlined,
  FileTextOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  CrownOutlined,
  ControlOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store';
import { logout, updateUser } from '../store/slices/authSlice';
import { apiService } from '../services/api';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;
const { TextArea } = Input;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [helpMessageVisible, setHelpMessageVisible] = useState(false);
  const [helpMessage, setHelpMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // 🔧 Redux'dan real user bilgisi al
  const { user, isAuthenticated, token } = useAppSelector((state) => state.auth);

  // 🔧 User profile fetch
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // localStorage'dan user bilgisi al
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('accessToken');
        
        if (storedToken && !user && !storedUser) {
          // API'den user bilgisini çek
          const response = await apiService.get('/auth/profile');
          if (response.success && response.data) {
            dispatch(updateUser(response.data));
          }
        } else if (storedUser && !user) {
          // localStorage'dan user bilgisini Redux'a yükle
          try {
            const parsedUser = JSON.parse(storedUser);
            dispatch(updateUser(parsedUser));
          } catch (error) {
            console.warn('Failed to parse stored user data:', error);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };

    if (token || localStorage.getItem('accessToken')) {
      fetchUserProfile();
    }
  }, [token, user, dispatch]);

  // 🔧 Check if user is admin
  const isAdmin = () => {
    return user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';
  };

  // 🔧 Admin Menu Items
  const adminMenuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: 'Admin Dashboard',
    },
    {
      key: '/admin/users',
      icon: <TeamOutlined />,
      label: 'User Management',
    },
    {
      key: '/admin/accounts',
      icon: <BankOutlined />,
      label: 'Account Management',
    },
    {
      key: '/admin/transactions',
      icon: <DollarOutlined />,
      label: 'Transaction Management',
    },
    {
      key: '/admin/kyc',
      icon: <CheckCircleOutlined />,
      label: 'KYC Approvals',
    },
    {
      key: '/admin/reports',
      icon: <BarChartOutlined />,
      label: 'Reports & Analytics',
    },
    {
      key: '/admin/settings',
      icon: <ControlOutlined />,
      label: 'System Settings',
    },
  ];

  // 🔧 Regular User Menu Items
  const userMenuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'My CCT',
    },
    {
      key: '/accounts',
      icon: <BankOutlined />,
      label: 'Trading Accounts',
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: '/deposit',
      icon: <DollarOutlined />,
      label: 'Deposit',
    },
    {
      key: '/withdraw',
      icon: <SendOutlined />,
      label: 'Withdraw',
    },
    {
      key: '/transfer',
      icon: <SwapOutlined />,
      label: 'Transfer',
    },
    {
      key: '/history',
      icon: <HistoryOutlined />,
      label: 'History',
    },
  ];

  // 🔧 Get menu items based on user role
  const getMenuItems = () => {
    return isAdmin() ? adminMenuItems : userMenuItems;
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleHelpClick = () => {
    setHelpMessageVisible(!helpMessageVisible);
  };

  const handleSendMessage = async () => {
    if (!helpMessage.trim()) {
      message.warning('Please enter a message');
      return;
    }

    try {
      // TODO: API call to send help message
      console.log('Help message sent:', helpMessage);
      message.success('Message sent to administrator!');
      setHelpMessageVisible(false);
      setHelpMessage('');
    } catch (error) {
      message.error('Failed to send message');
    }
  };

  // 🔧 Logout handler
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    message.success('Logged out successfully');
  };

  // 🔧 User info helper functions
  const getUserDisplayName = () => {
    if (!user) return 'Guest User';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User';
  };

  const getUserInitials = () => {
    if (!user) return 'G';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (firstName) return firstName.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  const getUserAccountInfo = () => {
    if (!user) return 'Not logged in';
    
    // 🔧 Show role for admin users
    if (isAdmin()) {
      return `${user.role} • ${user.email}`;
    }
    
    return user.email || user.id?.substring(0, 8) || 'No account info';
  };

  // User dropdown menu
  const userMenuDropdownItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'My Profile',
      onClick: () => navigate(isAdmin() ? '/admin/profile' : '/profile'),
    },
    ...(isAdmin() ? [] : [
      {
        key: 'kyc',
        icon: <SafetyCertificateOutlined />,
        label: 'KYC Verification',
        onClick: () => navigate('/kyc'),
      }
    ]),
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: handleLogout,
    },
  ];

  // 🔧 Get current page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (isAdmin()) {
      switch (path) {
        case '/admin/dashboard': return 'Admin Dashboard';
        case '/admin/users': return 'User Management';
        case '/admin/accounts': return 'Account Management';
        case '/admin/transactions': return 'Transaction Management';
        case '/admin/kyc': return 'KYC Approvals';
        case '/admin/reports': return 'Reports & Analytics';
        case '/admin/settings': return 'System Settings';
        default: return 'Admin Panel';
      }
    } else {
      switch (path) {
        case '/dashboard': return 'My CCT';
        case '/accounts': return 'Trading Accounts';
        case '/profile': return 'Profile';
        case '/deposit': return 'Deposit';
        case '/withdraw': return 'Withdraw';
        case '/transfer': return 'Transfer';
        case '/history': return 'History';
        default: return 'CCT Portal';
      }
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Fixed Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={280}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          height: '100vh',
          zIndex: 998,
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
        }}
        theme={isAdmin() ? "light" : "dark"}
      >
        {/* 🔧 Admin Badge in Sidebar Header */}
        <div style={{
          padding: '16px',
          textAlign: 'center',
          background: isAdmin() ? '#f0f2f5' : 'rgba(255, 255, 255, 0.1)',
          borderBottom: isAdmin() ? '1px solid #e8e8e8' : '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {isAdmin() ? (
            <Space direction="vertical" size="small">
              <div style={{
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                <CrownOutlined />
                {user?.role}
              </div>
              {!collapsed && (
                <Text style={{ color: '#666', fontSize: '12px', fontWeight: '500' }}>
                  Admin Panel
                </Text>
              )}
            </Space>
          ) : (
            <Space direction="vertical" size="small">
              <div style={{
                background: '#27408b',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                CCT Portal
              </div>
              {!collapsed && (
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                  Trading Platform
                </Text>
              )}
            </Space>
          )}
        </div>

        {/* Custom Collapse Trigger */}
        <div 
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '36px',
            height: '36px',
            background: isAdmin() ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            border: isAdmin() ? '2px solid rgba(0, 0, 0, 0.2)' : '2px solid rgba(255, 255, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            zIndex: helpMessageVisible ? 500 : 1005,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          }}
          onClick={() => setCollapsed(!collapsed)}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isAdmin() ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isAdmin() ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {collapsed ? (
            <MenuOutlined style={{ color: isAdmin() ? '#000' : '#fff', fontSize: '16px' }} />
          ) : (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '3px',
              color: isAdmin() ? '#000' : '#fff'
            }}>
              <div style={{ width: '14px', height: '2px', background: 'currentColor', borderRadius: '1px' }} />
              <div style={{ width: '14px', height: '2px', background: 'currentColor', borderRadius: '1px' }} />
              <div style={{ width: '14px', height: '2px', background: 'currentColor', borderRadius: '1px' }} />
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <div style={{ flex: 1, paddingTop: '20px', paddingBottom: '16px' }}>
          <Menu
            theme={isAdmin() ? "light" : "dark"}
            selectedKeys={[location.pathname]}
            mode="inline"
            items={getMenuItems()}
            onClick={handleMenuClick}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '15px',
            }}
            className="custom-menu"
          />
        </div>

        {/* Divider */}
        <div style={{ 
          margin: '0 16px', 
          height: '1px', 
          background: isAdmin() ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)' 
        }} />

        {/* Help Section - Only for regular users */}
        {!isAdmin() && (
          <div style={{ padding: '12px 24px 16px 24px' }}>
            <div
              onClick={handleHelpClick}
              style={{
                color: '#FBBF24',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                textAlign: 'center',
                padding: '4px 0',
              }}
            >
              Help me
            </div>
            
            {/* Help Message Area */}
            {helpMessageVisible && (
              <div 
                className="help-message-area"
                style={{ 
                  marginTop: '16px',
                  background: '#1f2937',
                  borderRadius: '8px',
                  padding: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  position: 'relative',
                  zIndex: 1003,
                }}
              >
                <div style={{ marginBottom: '12px' }}>
                  <Text style={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}>
                    Send message to administrator:
                  </Text>
                </div>
                <TextArea
                  placeholder="Type your message here..."
                  value={helpMessage}
                  onChange={(e) => setHelpMessage(e.target.value)}
                  autoSize={{ minRows: 4, maxRows: 8 }}
                  style={{
                    background: '#374151',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    fontSize: '13px',
                    marginBottom: '12px',
                    minHeight: '80px'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <Button 
                    size="small" 
                    onClick={() => {
                      setHelpMessageVisible(false);
                      setHelpMessage('');
                    }}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: '#fff',
                      fontSize: '12px',
                      height: '32px'
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="small" 
                    type="primary"
                    onClick={handleSendMessage}
                    loading={false} // TODO: Add loading state
                    style={{
                      background: '#FBBF24',
                      border: '1px solid #F59E0B',
                      color: '#92400E',
                      fontSize: '12px',
                      height: '32px'
                    }}
                  >
                    Send Message
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Sider>

      {/* Main Layout */}
      <Layout style={{ marginLeft: collapsed ? 80 : 280, transition: 'margin-left 0.2s' }}>
        {/* Fixed Header - Full Width */}
        <Header
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            width: '100%',
            zIndex: 1001,
            background: isAdmin() ? '#ff6b6b' : '#fff',
            padding: '0 24px',
            borderBottom: isAdmin() ? '1px solid #ff5252' : '1px solid #f0f0f0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Left Side - Logo & Page Title */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Space align="center" size={0} split={<div style={{ 
              width: '1px', 
              height: '20px', 
              background: isAdmin() ? 'rgba(255,255,255,0.3)' : '#d1d5db', 
              margin: '0 12px' 
            }} />}>
              <Title 
                level={4} 
                style={{ 
                  color: isAdmin() ? '#fff' : '#27408b', 
                  margin: 0, 
                  fontSize: '24px', 
                  fontWeight: 'bold' 
                }}
              >
                CCT
              </Title>
              <div>
                <Text style={{ 
                  color: isAdmin() ? 'rgba(255,255,255,0.8)' : '#666', 
                  fontSize: '14px', 
                  fontWeight: '300' 
                }}>
                  {getPageTitle()}
                </Text>
              </div>
            </Space>
          </div>

          {/* Right Side - Notifications and User */}
          <Space size="large" align="center">
            {/* Notifications */}
            <Badge count={isAuthenticated ? 2 : 0} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                style={{
                  fontSize: '18px',
                  width: 40,
                  height: 40,
                  color: isAdmin() ? '#fff' : '#27408b',
                }}
              />
            </Badge>

            {/* User Info and Dropdown */}
            {isAuthenticated || user ? (
              <Dropdown menu={{ items: userMenuDropdownItems }} placement="bottomRight" arrow>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: isAdmin() ? '1px solid rgba(255,255,255,0.3)' : '1px solid #e5e7eb',
                    background: isAdmin() ? 'rgba(255,255,255,0.1)' : '#ffffff',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isAdmin() ? 'rgba(255,255,255,0.2)' : '#f9fafb';
                    e.currentTarget.style.borderColor = isAdmin() ? 'rgba(255,255,255,0.5)' : '#d1d5db';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isAdmin() ? 'rgba(255,255,255,0.1)' : '#ffffff';
                    e.currentTarget.style.borderColor = isAdmin() ? 'rgba(255,255,255,0.3)' : '#e5e7eb';
                  }}
                >
                  <Space align="center" size={8}>
                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontWeight: '600',
                          color: isAdmin() ? '#fff' : '#111827',
                          fontSize: '14px',
                          lineHeight: '18px',
                        }}
                      >
                        {getUserDisplayName()}
                      </div>
                      <div
                        style={{
                          color: isAdmin() ? 'rgba(255,255,255,0.8)' : '#6b7280',
                          fontSize: '12px',
                          lineHeight: '16px',
                        }}
                      >
                        {getUserAccountInfo()}
                      </div>
                    </div>
                    <Avatar
                      size={34}
                      style={{
                        background: isAdmin() 
                          ? 'linear-gradient(135deg, #fff 0%, #f0f0f0 100%)'
                          : 'linear-gradient(135deg, #27408b 0%, #3a5fcd 100%)',
                        color: isAdmin() ? '#ff6b6b' : '#fff',
                        fontWeight: '600',
                        fontSize: '14px',
                      }}
                    >
                      {getUserInitials()}
                    </Avatar>
                    <LogoutOutlined 
                      style={{ 
                        color: isAdmin() ? 'rgba(255,255,255,0.8)' : '#6b7280', 
                        fontSize: '16px',
                        marginLeft: '4px'
                      }} 
                    />
                  </Space>
                </div>
              </Dropdown>
            ) : (
              // 🔧 Guest user (not authenticated)
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Button 
                  type="default" 
                  onClick={() => navigate('/login')}
                  style={{
                    borderColor: '#27408b',
                    color: '#27408b',
                  }}
                >
                  Login
                </Button>
                <Button 
                  type="primary" 
                  onClick={() => navigate('/register')}
                  style={{
                    background: '#27408b',
                    borderColor: '#27408b',
                  }}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </Space>
        </Header>

        {/* Content Area */}
        <Content
          style={{
            margin: '80px 0 0 0',
            padding: '24px',
            background: isAdmin() ? '#f8f9fa' : '#f5f7fa',
            minHeight: 'calc(100vh - 80px)',
          }}
        >
          <div
            style={{
              background: '#fff',
              padding: '24px',
              borderRadius: '12px',
              minHeight: 'calc(100vh - 112px)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              border: isAdmin() ? '1px solid #ffebee' : 'none',
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;