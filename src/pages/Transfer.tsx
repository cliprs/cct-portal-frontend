import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Input,
  Form,
  Typography,
  Space,
  Alert,
  message,
  Statistic,
  Divider,
  Select,
  Tabs,
  Tag,
} from 'antd';
import {
  DollarOutlined,
  BankOutlined,
  SwapOutlined,
  SendOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../store';
const { Title, Text } = Typography;
const { Option } = Select;

interface TradingAccount {
  id: string;
  accountNumber: string;
  platform: string;
  balance: number;
  currency: string;
  type: string;
}

const Transfer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { financialSummary } = useAppSelector((state) => state.user);
  
  const [activeTab, setActiveTab] = useState<string>('internal');
  const [internalForm] = Form.useForm();
  const [externalForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [recipientVerified, setRecipientVerified] = useState(false);

  // Mock trading accounts
  const [tradingAccounts] = useState<TradingAccount[]>([
    {
      id: '1',
      accountNumber: '1001234',
      platform: 'MT4',
      balance: 5000,
      currency: 'USD',
      type: 'Standard',
    },
    {
      id: '2',
      accountNumber: '1001235',
      platform: 'MT5',
      balance: 3500,
      currency: 'USD',
      type: 'ECN',
    },
    {
      id: '3',
      accountNumber: '1001236',
      platform: 'MT4',
      balance: 2000,
      currency: 'EUR',
      type: 'Standard',
    },
  ]);

  useEffect(() => {
  
  }, [dispatch]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    // Reset forms when switching tabs
    internalForm.resetFields();
    externalForm.resetFields();
    setRecipientVerified(false);
  };

  const handleInternalTransfer = (values: any) => {
    const { fromAccount, toAccount, amount, firstName, lastName } = values;
    
    if (fromAccount === toAccount) {
      message.error('Source and destination accounts cannot be the same');
      return;
    }
    
    const sourceAccount = tradingAccounts.find(acc => acc.id === fromAccount);
    if (!sourceAccount || amount > sourceAccount.balance) {
      message.error('Insufficient balance in source account');
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      message.success('Internal transfer completed successfully!');
      internalForm.resetFields();
      setLoading(false);
    }, 2000);
  };

  const handleExternalTransfer = (values: any) => {
    const { recipientId, amount, firstName, lastName } = values;
    
    if (!recipientVerified) {
      message.error('Please verify recipient first');
      return;
    }
    
    if (amount > (financialSummary?.balance || 0)) {
      message.error('Insufficient balance');
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      message.success('External transfer completed successfully!');
      externalForm.resetFields();
      setRecipientVerified(false);
      setLoading(false);
    }, 2000);
  };

  const handleVerifyRecipient = () => {
    const recipientId = externalForm.getFieldValue('recipientId');
    if (!recipientId || recipientId.length < 6) {
      message.error('Please enter a valid CCT Account ID');
      return;
    }
    
    // Mock verification
    setTimeout(() => {
      setRecipientVerified(true);
      message.success('Recipient verified successfully!');
    }, 1000);
  };

  const handleReset = (formType: 'internal' | 'external') => {
    if (formType === 'internal') {
      internalForm.resetFields();
    } else {
      externalForm.resetFields();
      setRecipientVerified(false);
    }
  };

  // Watch form values for summary
  const internalWatchedAmount = Form.useWatch('amount', internalForm);
  const internalWatchedFirstName = Form.useWatch('firstName', internalForm);
  const internalWatchedLastName = Form.useWatch('lastName', internalForm);
  const internalWatchedFromAccount = Form.useWatch('fromAccount', internalForm);
  const internalWatchedToAccount = Form.useWatch('toAccount', internalForm);

  const externalWatchedAmount = Form.useWatch('amount', externalForm);
  const externalWatchedFirstName = Form.useWatch('firstName', externalForm);
  const externalWatchedLastName = Form.useWatch('lastName', externalForm);
  const externalWatchedRecipientId = Form.useWatch('recipientId', externalForm);

  // Calculate external transfer fee (1%)
  const externalFee = externalWatchedAmount ? (externalWatchedAmount * 0.01) : 0;
  const externalNetAmount = externalWatchedAmount ? (externalWatchedAmount - externalFee) : 0;

  const getAccountInfo = (accountId: string) => {
    return tradingAccounts.find(acc => acc.id === accountId);
  };

  // Internal Transfer Tab Content
  const renderInternalTransferTab = () => (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={14}>
        <Card
          title="Internal Transfer (Between Your Accounts)"
          variant="outlined"
          style={{ background: '#f8f9fa', borderRadius: '12px' }}
        >
          <Form
            form={internalForm}
            layout="vertical"
            onFinish={handleInternalTransfer}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="fromAccount"
                  label="From Account"
                  rules={[{ required: true, message: 'Please select source account' }]}
                >
                  <Select size="large" placeholder="Select source account">
                    {tradingAccounts.map(account => (
                      <Option key={account.id} value={account.id}>
                        <Space>
                          <Tag color="blue">{account.platform}</Tag>
                          {account.accountNumber}
                          <Text type="secondary">
                            (${account.balance.toLocaleString()} {account.currency})
                          </Text>
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="toAccount"
                  label="To Account"
                  rules={[{ required: true, message: 'Please select destination account' }]}
                >
                  <Select size="large" placeholder="Select destination account">
                    {tradingAccounts.map(account => (
                      <Option key={account.id} value={account.id}>
                        <Space>
                          <Tag color="green">{account.platform}</Tag>
                          {account.accountNumber}
                          <Text type="secondary">({account.type})</Text>
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="amount"
              label="Transfer Amount"
              rules={[
                { required: true, message: 'Please enter transfer amount' },
                { 
                  validator: (_, value) => {
                    if (value && value < 50) {
                      return Promise.reject(new Error('Minimum transfer amount is $50'));
                    }
                    const fromAccountId = internalForm.getFieldValue('fromAccount');
                    const fromAccount = tradingAccounts.find(acc => acc.id === fromAccountId);
                    if (value && fromAccount && value > fromAccount.balance) {
                      return Promise.reject(new Error('Insufficient balance in source account'));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Input
                size="large"
                type="number"
                prefix={<DollarOutlined />}
                suffix="USD"
                placeholder="Enter amount (min $50)"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="firstName"
                  label="First Name"
                  rules={[{ required: true, message: 'Please enter first name' }]}
                >
                  <Input size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="lastName"
                  label="Last Name"
                  rules={[{ required: true, message: 'Please enter last name' }]}
                >
                  <Input size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Alert
              message="No Fees for Internal Transfers"
              description="Transfers between your own accounts are free of charge and processed instantly."
              type="success"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <div style={{ marginTop: 32 }}>
              <Space size="middle">
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  size="large"
                  loading={loading}
                >
                  Transfer Funds
                </Button>
                <Button size="large" onClick={() => handleReset('internal')}>
                  Reset
                </Button>
              </Space>
            </div>
          </Form>
        </Card>
      </Col>

      <Col xs={24} lg={10}>
        <Card
          title={
            <Space>
              <SwapOutlined />
              🔄 Internal Transfer Summary
            </Space>
          }
          variant="outlined"
          style={{ borderRadius: '12px' }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>From Account:</Text>
              <Text strong>
                {internalWatchedFromAccount ? 
                  getAccountInfo(internalWatchedFromAccount)?.accountNumber || 'Invalid' : 
                  'Not selected'
                }
              </Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>To Account:</Text>
              <Text strong>
                {internalWatchedToAccount ? 
                  getAccountInfo(internalWatchedToAccount)?.accountNumber || 'Invalid' : 
                  'Not selected'
                }
              </Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Name:</Text>
              <Text strong>
                {internalWatchedFirstName && internalWatchedLastName 
                  ? `${internalWatchedFirstName} ${internalWatchedLastName}` 
                  : 'Not entered'
                }
              </Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Transfer Amount:</Text>
              <Text strong>${internalWatchedAmount?.toLocaleString() || '0'} USD</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Transaction Fee:</Text>
              <Text strong style={{ color: '#52c41a' }}>FREE</Text>
            </div>
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text strong>Net Transfer:</Text>
              <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                ${internalWatchedAmount?.toLocaleString() || '0'} USD
              </Text>
            </div>
          </Space>
        </Card>
      </Col>
    </Row>
  );

  // External Transfer Tab Content
  const renderExternalTransferTab = () => (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={14}>
        <Card
          title="External Transfer (To Another CCT User)"
          variant="outlined"
          style={{ background: '#f8f9fa', borderRadius: '12px' }}
        >
          <Form
            form={externalForm}
            layout="vertical"
            onFinish={handleExternalTransfer}
          >
            <Form.Item
              name="recipientId"
              label="Recipient CCT Account ID"
              rules={[
                { required: true, message: 'Please enter recipient CCT Account ID' },
                { min: 6, message: 'CCT Account ID must be at least 6 characters' }
              ]}
            >
              <Input
                size="large"
                prefix={<UserOutlined />}
                placeholder="Enter CCT Account ID"
                suffix={
                  <Button 
                    type="link" 
                    size="small"
                    onClick={handleVerifyRecipient}
                    disabled={recipientVerified}
                  >
                    {recipientVerified ? (
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    ) : (
                      'Verify'
                    )}
                  </Button>
                }
              />
            </Form.Item>

            {recipientVerified && (
              <Alert
                message="Recipient Verified"
                description="John Smith - Premium Account (CCT123456)"
                type="success"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <Form.Item
              name="amount"
              label="Transfer Amount"
              rules={[
                { required: true, message: 'Please enter transfer amount' },
                { 
                  validator: (_, value) => {
                    if (value && value < 100) {
                      return Promise.reject(new Error('Minimum external transfer amount is $100'));
                    }
                    if (value && value > (financialSummary?.balance || 0)) {
                      return Promise.reject(new Error('Insufficient balance'));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Input
                size="large"
                type="number"
                prefix={<DollarOutlined />}
                suffix="USD"
                placeholder="Enter amount (min $100)"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="firstName"
                  label="Your First Name"
                  rules={[{ required: true, message: 'Please enter first name' }]}
                >
                  <Input size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="lastName"
                  label="Your Last Name"
                  rules={[{ required: true, message: 'Please enter last name' }]}
                >
                  <Input size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Alert
              message="External Transfer Fee"
              description="A 1% transaction fee applies to external transfers. This fee helps maintain our secure transfer infrastructure."
              type="warning"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <div style={{ marginTop: 32 }}>
              <Space size="middle">
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  size="large"
                  loading={loading}
                  disabled={!recipientVerified}
                >
                  Send Transfer
                </Button>
                <Button size="large" onClick={() => handleReset('external')}>
                  Reset
                </Button>
              </Space>
            </div>
          </Form>
        </Card>
      </Col>

      <Col xs={24} lg={10}>
        <Card
          title={
            <Space>
              <SendOutlined />
              📤 External Transfer Summary
            </Space>
          }
          variant="outlined"
          style={{ borderRadius: '12px' }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Recipient ID:</Text>
              <Text strong>
                {externalWatchedRecipientId || 'Not entered'}
                {recipientVerified && <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: 8 }} />}
              </Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Recipient Status:</Text>
              <Text strong>
                {recipientVerified ? (
                  <Tag color="success">Verified ✓</Tag>
                ) : (
                  <Tag color="warning">Not Verified</Tag>
                )}
              </Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Your Name:</Text>
              <Text strong>
                {externalWatchedFirstName && externalWatchedLastName 
                  ? `${externalWatchedFirstName} ${externalWatchedLastName}` 
                  : 'Not entered'
                }
              </Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Transfer Amount:</Text>
              <Text strong>${externalWatchedAmount?.toLocaleString() || '0'} USD</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Transaction Fee (1%):</Text>
              <Text strong style={{ color: '#ff4d4f' }}>-${externalFee.toFixed(2)} USD</Text>
            </div>
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text strong>Net Transfer:</Text>
              <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                ${externalNetAmount.toFixed(2)} USD
              </Text>
            </div>
          </Space>

          <Alert
            message="Processing Time"
            description="External transfers are processed within 2-4 hours during business days"
            type="info"
            showIcon
            style={{ marginTop: 16 }}
          />
        </Card>
      </Col>
    </Row>
  );

  // Tabs items configuration
  const tabsItems = [
    {
      key: 'internal',
      label: (
        <Space>
          <SwapOutlined />
          Internal Transfer
        </Space>
      ),
      children: renderInternalTransferTab(),
    },
    {
      key: 'external',
      label: (
        <Space>
          <SendOutlined />
          External Transfer
        </Space>
      ),
      children: renderExternalTransferTab(),
    },
  ];

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24, color: '#27408b' }}>
        Transfer Funds
      </Title>

      {/* Balance Display */}
      <Card variant="outlined" style={{ marginBottom: 24, borderRadius: '12px', background: 'linear-gradient(135deg, #27408b 0%, #3a5fcd 100%)' }}>
        <Row gutter={[24, 0]}>
          <Col xs={24} sm={12}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>Total Balance</span>}
              value={financialSummary?.balance || 0}
              precision={2}
              valueStyle={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}
              prefix={<BankOutlined />}
              suffix={financialSummary?.currency || 'USD'}
            />
          </Col>
          <Col xs={24} sm={12}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>Available for Transfer</span>}
              value={Math.max((financialSummary?.balance || 0) - 1000, 0)} // Reserve 1000, minimum 0
              precision={2}
              valueStyle={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}
              prefix={<SwapOutlined />}
              suffix={financialSummary?.currency || 'USD'}
            />
          </Col>
        </Row>
      </Card>

      {/* Transfer Tabs */}
      <Card variant="outlined" style={{ borderRadius: '12px' }}>
        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange} 
          size="large"
          items={tabsItems}
        />
      </Card>
    </div>
  );
};

export default Transfer;