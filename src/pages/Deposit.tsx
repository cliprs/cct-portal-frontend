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
  Drawer,
  Alert,
  Checkbox,
  QRCode,
  Statistic,
  Divider,
  App,
} from 'antd';
import {
  DollarOutlined,
  WalletOutlined,
  CopyOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../store';

const { Title, Text } = Typography;

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  network?: string;
  color: string;
}

const Deposit: React.FC = () => {
  const { message } = App.useApp(); // ✅ Modern Ant Design message hook
  const dispatch = useAppDispatch();
  const { financialSummary } = useAppSelector((state) => state.user);
  
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [cryptoDrawerVisible, setCryptoDrawerVisible] = useState(false);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [confirmationStep, setConfirmationStep] = useState(false); // ✅ Confirmation step state
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
   
  }, [dispatch]);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'trc20',
      name: 'TRC20 (USDT)',
      icon: <GlobalOutlined />,
      network: 'Tron Network',
      color: '#52c41a',
    },
    {
      id: 'bep20',
      name: 'BEP20 (USDT)',
      icon: <GlobalOutlined />,
      network: 'Binance Smart Chain',
      color: '#f1c40f',
    },
    {
      id: 'erc20',
      name: 'ERC20 (USDT)',
      icon: <GlobalOutlined />,
      network: 'Ethereum Network',
      color: '#627eea',
    },
    {
      id: 'bitcoin',
      name: 'Bitcoin',
      icon: <GlobalOutlined />,
      network: 'Bitcoin Network',
      color: '#f7931a',
    },
    {
      id: 'litecoin',
      name: 'Litecoin',
      icon: <GlobalOutlined />,
      network: 'Litecoin Network',
      color: '#a6a9aa',
    },
    {
      id: 'ethereum',
      name: 'Ethereum',
      icon: <GlobalOutlined />,
      network: 'Ethereum Network',
      color: '#627eea',
    },
  ];

  // Mock wallet data - this should come from API
  const getWalletData = (methodId: string) => {
    const walletAddresses: Record<string, { address: string; qrCode: string }> = {
      trc20: {
        address: 'TQPGGnTvEHW2rG8VJsWqXxSBTw8hJ2vKHN',
        qrCode: 'TQPGGnTvEHW2rG8VJsWqXxSBTw8hJ2vKHN',
      },
      bep20: {
        address: 'bnb1qh8ljnwqvs8wfm6h9z6d2j9dj5w3k2l1m9n8p4',
        qrCode: 'bnb1qh8ljnwqvs8wfm6h9z6d2j9dj5w3k2l1m9n8p4',
      },
      erc20: {
        address: '0x742d35cc6935C02CCc06E051b0b2C2E8C20F0000',
        qrCode: '0x742d35cc6935C02CCc06E051b0b2C2E8C20F0000',
      },
      bitcoin: {
        address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        qrCode: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      },
      litecoin: {
        address: 'ltc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
        qrCode: 'ltc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
      },
      ethereum: {
        address: '0x742d35cc6935C02CCc06E051b0b2C2E8C20F1234',
        qrCode: '0x742d35cc6935C02CCc06E051b0b2C2E8C20F1234',
      },
    };
    
    return walletAddresses[methodId] || walletAddresses.trc20;
  };

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setCryptoDrawerVisible(true);
    setAgreementChecked(false);
    setConfirmationStep(false); // ✅ Reset confirmation step
  };

  const handleCopyAddress = async () => {
    try {
      const walletData = getWalletData(selectedMethod?.id || 'trc20');
      await navigator.clipboard.writeText(walletData.address);
      message.success('Wallet address copied to clipboard!');
    } catch (error) {
      message.error('Failed to copy address');
    }
  };

  const handleCopyQR = async () => {
    try {
      const walletData = getWalletData(selectedMethod?.id || 'trc20');
      await navigator.clipboard.writeText(walletData.qrCode);
      message.success('QR code data copied to clipboard!');
    } catch (error) {
      message.error('Failed to copy QR data');
    }
  };

  const handleAgreementChange = (e: any) => {
    setAgreementChecked(e.target.checked);
  };

  const handleDepositSubmit = async (values: any) => {
    if (values.amount < 1000) {
      message.error('Minimum deposit amount is $1000');
      return;
    }
    
    if (!selectedMethod) {
      message.error('Please select a payment method');
      return;
    }
    
    setLoading(true);
    
    try {
      // TODO: Replace with real API call
      // await depositApi.createDeposit({
      //   amount: values.amount,
      //   currency: 'USD',
      //   paymentMethod: selectedMethod.id,
      //   firstName: values.firstName,
      //   lastName: values.lastName,
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      message.success('Deposit request submitted successfully!');
      setConfirmationStep(true); // ✅ Move to confirmation step
      // Don't reset form yet, let user see the confirmation
    } catch (error) {
      console.error('Deposit submission failed:', error);
      message.error('Failed to submit deposit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    setSelectedMethod(null);
    setConfirmationStep(false);
    setCryptoDrawerVisible(false);
    setAgreementChecked(false);
  };

  // ✅ Handle drawer close properly
  const handleDrawerClose = () => {
    setCryptoDrawerVisible(false);
    setAgreementChecked(false);
    setConfirmationStep(false);
  };

  // ✅ Handle final confirmation
  const handleFinalConfirmation = () => {
    message.success('Payment information confirmed. Please complete the transaction using the provided details.');
    
    // Reset everything after successful confirmation
    setTimeout(() => {
      form.resetFields();
      setSelectedMethod(null);
      setConfirmationStep(false);
      setCryptoDrawerVisible(false);
      setAgreementChecked(false);
    }, 1000);
  };

  const watchedAmount = Form.useWatch('amount', form);
  const watchedFirstName = Form.useWatch('firstName', form);
  const watchedLastName = Form.useWatch('lastName', form);

  const currentWalletData = selectedMethod ? getWalletData(selectedMethod.id) : null;

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24, color: '#27408b' }}>
        Deposit Funds
      </Title>

      {/* Wallet Balance Display */}
      <Card 
        style={{ 
          marginBottom: 24, 
          borderRadius: '12px', 
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
          border: 'none'
        }}
      >
        <Statistic
          title={<span style={{ color: 'rgba(0,0,0,0.7)', fontSize: '16px' }}>Your Wallet Balance</span>}
          value={financialSummary?.wallet || 1200}
          precision={2}
          valueStyle={{ color: '#333', fontSize: '32px', fontWeight: 'bold' }}
          prefix={<WalletOutlined />}
          suffix={financialSummary?.currency || 'USD'}
        />
      </Card>

      {/* Payment Methods */}
      <Card
        title="Select Payment Method"
        style={{ 
          marginBottom: 24, 
          borderRadius: '12px',
          border: '1px solid #f0f0f0'
        }}
      >
        <Row gutter={[16, 16]}>
          {paymentMethods.map((method) => (
            <Col xs={12} sm={8} md={6} lg={4} key={method.id}>
              <Card
                hoverable
                style={{
                  textAlign: 'center',
                  borderRadius: '12px',
                  border: `2px solid ${selectedMethod?.id === method.id ? method.color : '#f0f0f0'}`,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                styles={{ body: { padding: '20px 12px' } }}
                onClick={() => handleMethodSelect(method)}
              >
                <div style={{ fontSize: '32px', color: method.color, marginBottom: 12 }}>
                  {method.icon}
                </div>
                <Title level={5} style={{ margin: 0, fontSize: '14px' }}>
                  {method.name}
                </Title>
                {method.network && (
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {method.network}
                  </Text>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Deposit Form */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <Card
            title="Deposit Information"
            style={{ 
              borderRadius: '12px',
              border: '1px solid #f0f0f0'
            }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleDepositSubmit}
              initialValues={{
                currency: 'USD',
              }}
            >
              <Form.Item
                name="amount"
                label="Amount"
                rules={[
                  { required: true, message: 'Please enter deposit amount' },
                  { 
                    validator: (_, value) => {
                      if (value && value < 1000) {
                        return Promise.reject(new Error('Minimum deposit amount is $1000'));
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
                  placeholder="Enter amount (min $1000)"
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

              <div style={{ marginTop: 32 }}>
                <Space size="middle">
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    size="large"
                    loading={loading}
                    disabled={!selectedMethod}
                  >
                    Continue to Payment
                  </Button>
                  <Button size="large" onClick={handleReset}>
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
                <DollarOutlined />
                💳 Deposit Summary
              </Space>
            }
            style={{ 
              borderRadius: '12px',
              border: '1px solid #f0f0f0'
            }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Payment Method:</Text>
                <Text strong>{selectedMethod ? selectedMethod.name : 'Not selected'}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Name:</Text>
                <Text strong>
                  {watchedFirstName && watchedLastName 
                    ? `${watchedFirstName} ${watchedLastName}` 
                    : 'Not entered'
                  }
                </Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Amount:</Text>
                <Text strong>${watchedAmount?.toLocaleString() || '0'} USD</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Transaction Fee:</Text>
                <Text strong>$0.00</Text>
              </div>
              <Divider style={{ margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong>Net Deposit:</Text>
                <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                  ${watchedAmount?.toLocaleString() || '0'} USD
                </Text>
              </div>
            </Space>

            <Alert
              message="Minimum Deposit"
              description="The minimum deposit amount is $1000 USD"
              type="info"
              showIcon
              style={{ marginTop: 16 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Crypto Deposit Drawer */}
      <Drawer
        title={`${selectedMethod?.name} Deposit`}
        placement="right"
        width={500}
        open={cryptoDrawerVisible}
        onClose={handleDrawerClose}
        className="slide-in-right"
      >
        {selectedMethod && currentWalletData && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            
            {/* ✅ Step 1: Warning and Agreement */}
            {!confirmationStep && (
              <>
                {/* Warning Alert */}
                <Alert
                  message="⚠️ Warning! Pay attention to wallet addresses when making crypto transactions."
                  description="Be sure to obtain a new address for each transaction. Funds sent to the wrong wallet may be very difficult to recover. Remember that this transaction is your responsibility."
                  type="warning"
                  showIcon
                  style={{
                    background: agreementChecked ? '#f6ffed' : '#fffbe6',
                    border: agreementChecked ? '1px solid #b7eb8f' : '1px solid #ffe58f',
                  }}
                />

                {/* Agreement Checkbox */}
                <Checkbox 
                  checked={agreementChecked}
                  onChange={handleAgreementChange}
                  style={{ fontSize: '16px' }}
                >
                  I understand and agree to the terms and risks
                </Checkbox>

                {/* Wallet Information (shown only after agreement) */}
                {agreementChecked && (
                  <div className="fade-in">
                    <Alert
                      message="Next Step"
                      description="After reviewing the payment details below, click 'Proceed to Payment' to finalize your deposit request."
                      type="info"
                      showIcon
                      style={{ marginBottom: 16 }}
                    />
                    
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                      {/* QR Code */}
                      <div style={{ textAlign: 'center' }}>
                        <Text strong style={{ display: 'block', marginBottom: 16 }}>
                          QR Code:
                        </Text>
                        <div style={{ 
                          display: 'inline-block', 
                          padding: '16px', 
                          background: '#fff', 
                          borderRadius: '12px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                          <QRCode value={currentWalletData.qrCode} size={200} />
                        </div>
                        <br />
                        <Button 
                          icon={<CopyOutlined />} 
                          onClick={handleCopyQR}
                          style={{ marginTop: 12 }}
                        >
                          Copy QR Data
                        </Button>
                      </div>

                      {/* Wallet Address */}
                      <div>
                        <Text strong style={{ display: 'block', marginBottom: 8 }}>
                          Wallet Address:
                        </Text>
                        <Input
                          value={currentWalletData.address}
                          readOnly
                          size="large"
                          addonAfter={
                            <Button 
                              icon={<CopyOutlined />} 
                              onClick={handleCopyAddress}
                              type="text"
                            >
                              Copy
                            </Button>
                          }
                        />
                      </div>

                      {/* Network Information */}
                      <div>
                        <Text strong style={{ display: 'block', marginBottom: 8 }}>
                          Network:
                        </Text>
                        <Input
                          value={selectedMethod.network}
                          readOnly
                          size="large"
                        />
                      </div>

                      {/* Proceed Button */}
                      <Button
                        type="primary"
                        size="large"
                        block
                        onClick={() => setConfirmationStep(true)}
                      >
                        Proceed to Payment
                      </Button>
                    </Space>
                  </div>
                )}
              </>
            )}

            {/* ✅ Step 2: Final Confirmation */}
            {confirmationStep && (
              <div className="fade-in">
                <Alert
                  message="✅ Deposit Request Created"
                  description="Your deposit request has been created. Please complete the payment using the details below within 24 hours."
                  type="success"
                  showIcon
                  style={{ marginBottom: 24 }}
                />

                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px' }}>
                    <Text strong>Transaction Summary:</Text>
                    <div style={{ marginTop: 8 }}>
                      <Text>Amount: <strong>${watchedAmount?.toLocaleString() || '0'} USD</strong></Text><br />
                      <Text>Method: <strong>{selectedMethod.name}</strong></Text><br />
                      <Text>Network: <strong>{selectedMethod.network}</strong></Text>
                    </div>
                  </div>

                  <div>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>
                      Send funds to this address:
                    </Text>
                    <Input
                      value={currentWalletData.address}
                      readOnly
                      size="large"
                      addonAfter={
                        <Button 
                          icon={<CopyOutlined />} 
                          onClick={handleCopyAddress}
                          type="text"
                        >
                          Copy
                        </Button>
                      }
                    />
                  </div>

                  <Alert
                    message="Important!"
                    description="After sending the funds, it may take 15-30 minutes for the transaction to be confirmed on the blockchain. Your account will be credited automatically once confirmed."
                    type="info"
                    showIcon
                  />

                  {/* Final Confirmation Button */}
                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={handleFinalConfirmation}
                  >
                    I Have Sent the Payment
                  </Button>

                  <Button
                    size="large"
                    block
                    onClick={() => setConfirmationStep(false)}
                  >
                    Back to Payment Details
                  </Button>
                </Space>
              </div>
            )}
          </Space>
        )}
      </Drawer>
    </div>
  );
};

export default Deposit;