import React, { useState } from 'react';
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
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
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

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleHelpClick = () => {
    setHelpMessageVisible(!helpMessageVisible);
  };

  const handleSendMessage = () => {
    console.log('Help message sent');
    message.success('Message sent to administrator!');
    setHelpMessageVisible(false);
  };

  // User dropdown menu (KYC eklendi)
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'My Profile',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'kyc',
      icon: <SafetyCertificateOutlined />,
      label: 'KYC Verification',
      onClick: () => navigate('/kyc'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
    },
  ];

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
        theme="dark"
      >
        {/* Custom Collapse Trigger */}
        <div 
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '36px',
            height: '36px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            border: '2px solid rgba(255, 255, 255, 0.4)',
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
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {collapsed ? (
            <MenuOutlined style={{ color: '#fff', fontSize: '16px' }} />
          ) : (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '3px',
              color: '#fff'
            }}>
              <div style={{ width: '14px', height: '2px', background: 'currentColor', borderRadius: '1px' }} />
              <div style={{ width: '14px', height: '2px', background: 'currentColor', borderRadius: '1px' }} />
              <div style={{ width: '14px', height: '2px', background: 'currentColor', borderRadius: '1px' }} />
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <div style={{ flex: 1, paddingTop: '80px', paddingBottom: '16px' }}>
          <Menu
            theme="dark"
            selectedKeys={[location.pathname]}
            mode="inline"
            items={menuItems}
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
        <div style={{ margin: '0 16px', height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Help Section */}
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
                  onClick={() => setHelpMessageVisible(false)}
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
            background: '#fff',
            padding: '0 24px',
            borderBottom: '1px solid #f0f0f0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Left Side - Logo */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Space align="center" size={0} split={<div style={{ width: '1px', height: '20px', background: '#d1d5db', margin: '0 12px' }} />}>
              <Title 
                level={4} 
                style={{ 
                  color: '#27408b', 
                  margin: 0, 
                  fontSize: '24px', 
                  fontWeight: 'bold' 
                }}
              >
                CCT
              </Title>
              <div>
                <Text style={{ color: '#666', fontSize: '14px', fontWeight: '300' }}>
                  Central Copy Trade
                </Text>
              </div>
            </Space>
          </div>

          {/* Right Side - Notifications and User */}
          <Space size="large" align="center">
            {/* Notifications */}
            <Badge count={2} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                style={{
                  fontSize: '18px',
                  width: 40,
                  height: 40,
                  color: '#27408b',
                }}
              />
            </Badge>

            {/* User Info and Dropdown */}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '1px solid #e5e7eb',
                  background: '#ffffff',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f9fafb';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                <Space align="center" size={8}>
                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontWeight: '600',
                        color: '#111827',
                        fontSize: '14px',
                        lineHeight: '18px',
                      }}
                    >
                      Super Administrator
                    </div>
                    <div
                      style={{
                        color: '#6b7280',
                        fontSize: '12px',
                        lineHeight: '16px',
                      }}
                    >
                      Account: CCT357004
                    </div>
                  </div>
                  <Avatar
                    size={34}
                    style={{
                      background: 'linear-gradient(135deg, #27408b 0%, #3a5fcd 100%)',
                      color: '#fff',
                      fontWeight: '600',
                      fontSize: '14px',
                    }}
                  >
                    SA
                  </Avatar>
                  <LogoutOutlined 
                    style={{ 
                      color: '#6b7280', 
                      fontSize: '16px',
                      marginLeft: '4px'
                    }} 
                  />
                </Space>
              </div>
            </Dropdown>
          </Space>
        </Header>

        {/* Content Area */}
        <Content
          style={{
            margin: '80px 0 0 0',
            padding: '24px',
            background: '#f5f7fa',
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