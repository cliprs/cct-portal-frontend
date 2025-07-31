import React, { useEffect } from 'react';
import { Card, Row, Col, Typography, Space, Tag, Button, Badge, Alert } from 'antd';
import {
  DollarOutlined,
  RiseOutlined,
  BankOutlined,
  WalletOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
  SwapOutlined,
  EyeOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch, loadMockData } from '../store';
import { setSummary } from '../store/slices/kycSlice';
import kycApiService from '../services/kycApi';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { financialSummary } = useAppSelector((state) => state.user);
  const { summary: kycSummary } = useAppSelector((state) => state.kyc);
  const { token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(loadMockData());
    
    // Load real KYC data if authenticated
    if (token) {
      loadKycData();
    }
  }, [dispatch, token]);

  const loadKycData = async () => {
 //   try {
   //   const summary = await kycApiService.getKycSummary();
     // dispatch(setSummary(summary));
    }// catch (error) {
     // console.error('Failed to load KYC summary:', error);
      // Don't show error message, just continue with mock data
   // }
 // };

  // Mock data for recent transactions
  const recentTransactions = [
    {
      id: '1',
      type: 'deposit',
      amount: 5000,
      status: 'completed',
      date: '2024-01-15',
      description: 'TRC20 Deposit',
    },
    {
      id: '2',
      type: 'withdraw',
      amount: 2000,
      status: 'pending',
      date: '2024-01-14',
      description: 'Bitcoin Withdrawal',
    },
    {
      id: '3',
      type: 'transfer',
      amount: 1500,
      status: 'completed',
      date: '2024-01-13',
      description: 'Internal Transfer',
    },
  ];

  // Mock data for trading accounts
  const tradingAccounts = [
    {
      id: '1',
      accountNumber: '1001234',
      platform: 'MT4',
      balance: 5000,
      type: 'Standard',
      status: 'active',
    },
    {
      id: '2',
      accountNumber: '1001235',
      platform: 'MT5',
      balance: 3500,
      type: 'ECN',
      status: 'active',
    },
    {
      id: '3',
      accountNumber: '1001236',
      platform: 'MT4',
      balance: 2000,
      type: 'Standard',
      status: 'active',
    },
  ];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <PlusCircleOutlined style={{ color: '#52c41a' }} />;
      case 'withdraw':
        return <MinusCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'transfer':
        return <SwapOutlined style={{ color: '#1890ff' }} />;
      default:
        return <DollarOutlined />;
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig = {
      completed: { color: 'success', text: 'Completed' },
      pending: { color: 'processing', text: 'Pending' },
      rejected: { color: 'error', text: 'Rejected' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getPlatformTag = (platform: string) => {
    const color = platform === 'MT4' ? 'blue' : 'green';
    return <Tag color={color}>{platform}</Tag>;
  };

  const getAccountTypeTag = (type: string) => {
    const color = type === 'Standard' ? 'default' : 'purple';
    return <Tag color={color}>{type}</Tag>;
  };

  // KYC Status Functions
  const getKycStatusInfo = () => {
    const status = kycSummary?.kycStatus || 'NOT_UPLOADED';
    
    switch (status) {
      case 'APPROVED':
        return {
          color: '#52c41a',
          bgColor: 'rgba(82, 196, 26, 0.1)',
          borderColor: '#52c41a',
          icon: <CheckCircleOutlined />,
          text: 'Verified',
          description: 'Documents approved',
          alert: null
        };
      case 'UNDER_REVIEW':
        return {
          color: '#1890ff',
          bgColor: 'rgba(24, 144, 255, 0.1)',
          borderColor: '#1890ff',
          icon: <ClockCircleOutlined />,
          text: 'Under Review',
          description: 'Processing documents',
          alert: null
        };
      case 'PENDING':
        return {
          color: '#faad14',
          bgColor: 'rgba(250, 173, 20, 0.1)',
          borderColor: '#faad14',
          icon: <WarningOutlined />,
          text: 'Incomplete',
          description: `${kycSummary?.missingDocuments?.length || 0} documents missing`,
          alert: 'warning'
        };
      case 'REJECTED':
        return {
          color: '#ff4d4f',
          bgColor: 'rgba(255, 77, 79, 0.1)',
          borderColor: '#ff4d4f',
          icon: <ExclamationCircleOutlined />,
          text: 'Rejected',
          description: 'Documents need review',
          alert: 'error'
        };
      default: // NOT_UPLOADED
        return {
          color: '#ff4d4f',
          bgColor: 'rgba(255, 77, 79, 0.1)',
          borderColor: '#ff4d4f',
          icon: <ExclamationCircleOutlined />,
          text: 'Not Verified',
          description: token ? 'Upload documents now' : 'Login to verify',
          alert: token ? 'error' : null
        };
    }
  };

  const kycInfo = getKycStatusInfo();

  const handleKycClick = () => {
    if (!token) {
      navigate('/login');
    } else {
      navigate('/kyc');
    }
  };

  return (
    <div>
      {/* Header with KYC Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 0, color: '#27408b' }}>
          My CCT Dashboard
        </Title>
        
        {/* KYC Status Widget */}
        <Card
          size="small"
          style={{
            borderRadius: '12px',
            border: `2px solid ${kycInfo.borderColor}`,
            background: kycInfo.bgColor,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            minWidth: '200px'
          }}
styles={{ body: { padding: '12px 16px' } }}
          onClick={handleKycClick}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = `0 4px 12px ${kycInfo.color}30`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space>
              <div style={{ 
                padding: '6px', 
                borderRadius: '6px', 
                background: kycInfo.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <SafetyCertificateOutlined style={{ 
                  color: 'white', 
                  fontSize: '16px' 
                }} />
              </div>
              <div>
                <Text strong style={{ 
                  color: kycInfo.color, 
                  fontSize: '14px',
                  display: 'block',
                  lineHeight: '18px'
                }}>
                  {kycInfo.text}
                </Text>
                <Text style={{ 
                  color: kycInfo.color, 
                  fontSize: '12px',
                  opacity: 0.8,
                  lineHeight: '16px'
                }}>
                  {kycInfo.description}
                </Text>
              </div>
            </Space>
            {kycInfo.icon && (
              <div style={{ color: kycInfo.color, fontSize: '18px' }}>
                {kycInfo.icon}
              </div>
            )}
          </Space>
          
          {/* Show progress if available */}
          {kycSummary?.kycProgress !== undefined && kycSummary.kycProgress > 0 && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ 
                width: '100%', 
                height: '4px', 
                background: 'rgba(255,255,255,0.3)', 
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${kycSummary.kycProgress}%`,
                  height: '100%',
                  background: kycInfo.color,
                  borderRadius: '2px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <Text style={{ 
                color: kycInfo.color, 
                fontSize: '10px',
                opacity: 0.8,
                marginTop: '2px',
                display: 'block'
              }}>
                {kycSummary.kycProgress}% Complete
              </Text>
            </div>
          )}
        </Card>
      </div>

      {/* KYC Alert (if needed) */}
      {kycInfo.alert && token && (
        <Alert
          message={
            kycInfo.alert === 'warning' 
              ? "KYC Verification Incomplete" 
              : "KYC Verification Required"
          }
          description={
            kycInfo.alert === 'warning'
              ? `You have ${kycSummary?.missingDocuments?.length || 0} missing documents. Complete your verification to access all features.`
              : "Please upload your identification documents to verify your account and access all platform features."
          }
          type={kycInfo.alert as any}
          showIcon
          action={
            <Button 
              size="small" 
              type={kycInfo.alert === 'error' ? 'primary' : 'default'}
              danger={kycInfo.alert === 'error'}
              onClick={() => navigate('/kyc')}
            >
              {kycInfo.alert === 'warning' ? 'Complete Verification' : 'Start Verification'}
            </Button>
          }
          style={{ marginBottom: 24 }}
          closable
        />
      )}

      {/* Not authenticated alert */}
      {!token && (
        <Alert
          message="Welcome to CCT Portal"
          description="Please login to access your dashboard and start trading. Your account verification status and trading features will be available after authentication."
          type="info"
          showIcon
          action={
            <Button 
              size="small" 
              type="primary"
              onClick={() => navigate('/login')}
            >
              Login Now
            </Button>
          }
          style={{ marginBottom: 24 }}
          closable
        />
      )}

      {/* Financial Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            variant="outlined"
            style={{ 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #27408b 0%, #3a5fcd 100%)',
              color: 'white'
            }}
          >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>Equity</Text>
                <DollarOutlined style={{ color: 'rgba(255,255,255,0.8)', fontSize: '20px' }} />
              </div>
              <Title level={3} style={{ color: 'white', margin: 0 }}>
                ${financialSummary?.equity?.toLocaleString() || '15,000'}
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                Total invested capital
              </Text>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card 
            variant="outlined"
            style={{ 
              borderRadius: '12px', 
              background: financialSummary?.totalProfit >= 0 
                ? 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)'
                : 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
              color: 'white'
            }}
          >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>Total P/L</Text>
                <RiseOutlined style={{ color: 'rgba(255,255,255,0.8)', fontSize: '20px' }} />
              </div>
              <Title level={3} style={{ color: 'white', margin: 0 }}>
                {financialSummary?.totalProfit >= 0 ? '+' : ''}${financialSummary?.totalProfit?.toLocaleString() || '2,500'}
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                Profit & Loss summary
              </Text>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card 
            variant="outlined"
            style={{ 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #36648b 0%, #4a708b 100%)',
              color: 'white'
            }}
          >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>Balance</Text>
                <BankOutlined style={{ color: 'rgba(255,255,255,0.8)', fontSize: '20px' }} />
              </div>
              <Title level={3} style={{ color: 'white', margin: 0 }}>
                ${financialSummary?.balance?.toLocaleString() || '17,500'}
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                Total account balance
              </Text>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card 
            variant="outlined"
            style={{ 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              color: 'white'
            }}
          >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: 'rgba(0,0,0,0.7)', fontSize: '14px' }}>Wallet</Text>
                <WalletOutlined style={{ color: 'rgba(0,0,0,0.7)', fontSize: '20px' }} />
              </div>
              <Title level={3} style={{ color: '#333', margin: 0 }}>
                ${financialSummary?.wallet?.toLocaleString() || '1,200'}
              </Title>
              <Text style={{ color: 'rgba(0,0,0,0.6)', fontSize: '12px' }}>
                Available for withdrawal
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card
            title="Recent Transactions"
            extra={
              <Button type="link" onClick={() => navigate('/history')}>
                View All
              </Button>
            }
            variant="outlined"
            style={{ borderRadius: '12px' }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  <Space>
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <Text strong style={{ display: 'block', fontSize: '14px' }}>
                        {transaction.description}
                      </Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {transaction.date}
                      </Text>
                    </div>
                  </Space>
                  <Space direction="vertical" align="end" size="small">
                    <Text strong style={{ fontSize: '14px' }}>
                      ${transaction.amount.toLocaleString()}
                    </Text>
                    {getStatusTag(transaction.status)}
                  </Space>
                </div>
              ))}
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Trading Accounts"
            extra={
              <Button type="link" onClick={() => navigate('/accounts')}>
                View All
              </Button>
            }
            variant="outlined"
            style={{ borderRadius: '12px' }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {tradingAccounts.map((account) => (
                <div
                  key={account.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  <Space>
                    <BankOutlined style={{ color: '#27408b', fontSize: '16px' }} />
                    <div>
                      <Space size="small">
                        <Text strong style={{ fontSize: '14px' }}>
                          {account.accountNumber}
                        </Text>
                        {getPlatformTag(account.platform)}
                        {getAccountTypeTag(account.type)}
                      </Space>
                      <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
                        Status: Active
                      </Text>
                    </div>
                  </Space>
                  <Space direction="vertical" align="end" size="small">
                    <Text strong style={{ fontSize: '14px' }}>
                      ${account.balance.toLocaleString()}
                    </Text>
                    <Button
                      type="text"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => navigate('/accounts')}
                    >
                      View
                    </Button>
                  </Space>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;