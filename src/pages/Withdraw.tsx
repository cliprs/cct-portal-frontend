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
  Modal,
  Alert,
  message,
  Statistic,
  Divider,
  Select,
  Popconfirm,
  Tag,
  Table,
} from 'antd';
import {
  DollarOutlined,
  WalletOutlined,
  DeleteOutlined,
  PlusOutlined,
  BankOutlined,
  GlobalOutlined,
  CopyOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../store';
const { Title, Text } = Typography;
const { Option } = Select;

interface WithdrawAddress {
  id: string;
  type: 'TRC20' | 'BEP20' | 'ERC20' | 'Bitcoin' | 'Litecoin' | 'Ethereum';
  address: string;
  label: string;
  network: string;
  isDefault: boolean;
}

const Withdraw: React.FC = () => {
  const dispatch = useAppDispatch();
  const { financialSummary } = useAppSelector((state) => state.user);
  
  const [selectedAddress, setSelectedAddress] = useState<WithdrawAddress | null>(null);
  const [addAddressModalVisible, setAddAddressModalVisible] = useState(false);
  const [withdrawAddresses, setWithdrawAddresses] = useState<WithdrawAddress[]>([]);
  const [form] = Form.useForm();
  const [addressForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Mock withdrawal addresses (max 3)
  useEffect(() => {
    
    setWithdrawAddresses([
      {
        id: '1',
        type: 'TRC20',
        address: 'TQPGGnTvEHW2rG8VJsWqXxSBTw8hJ2vKHN',
        label: 'Main USDT Wallet',
        network: 'Tron Network',
        isDefault: true,
      },
      {
        id: '2',
        type: 'Bitcoin',
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        label: 'Bitcoin Cold Storage',
        network: 'Bitcoin Network',
        isDefault: false,
      },
    ]);
  }, [dispatch]);

  const cryptoTypes = [
    { value: 'TRC20', label: 'TRC20 (USDT)', network: 'Tron Network', color: '#52c41a' },
    { value: 'BEP20', label: 'BEP20 (USDT)', network: 'Binance Smart Chain', color: '#f1c40f' },
    { value: 'ERC20', label: 'ERC20 (USDT)', network: 'Ethereum Network', color: '#627eea' },
    { value: 'Bitcoin', label: 'Bitcoin', network: 'Bitcoin Network', color: '#f7931a' },
    { value: 'Litecoin', label: 'Litecoin', network: 'Litecoin Network', color: '#a6a9aa' },
    { value: 'Ethereum', label: 'Ethereum', network: 'Ethereum Network', color: '#627eea' },
  ];

  const handleAddAddress = (values: any) => {
    if (withdrawAddresses.length >= 3) {
      message.error('Maximum 3 withdrawal addresses allowed');
      return;
    }

    const cryptoType = cryptoTypes.find(type => type.value === values.type);
    const newAddress: WithdrawAddress = {
      id: Date.now().toString(),
      type: values.type,
      address: values.address,
      label: values.label,
      network: cryptoType?.network || '',
      isDefault: withdrawAddresses.length === 0,
    };

    setWithdrawAddresses([...withdrawAddresses, newAddress]);
    setAddAddressModalVisible(false);
    addressForm.resetFields();
    message.success('Withdrawal address added successfully!');
  };

  const handleDeleteAddress = (addressId: string) => {
    const updatedAddresses = withdrawAddresses.filter(addr => addr.id !== addressId);
    setWithdrawAddresses(updatedAddresses);
    
    // If deleted address was selected, clear selection
    if (selectedAddress?.id === addressId) {
      setSelectedAddress(null);
      form.setFieldsValue({ addressId: undefined });
    }
    
    message.success('Withdrawal address deleted successfully!');
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    message.success('Address copied to clipboard!');
  };

  const handleWithdrawSubmit = (values: any) => {
    const { amount, firstName, lastName, addressId } = values;
    
    if (amount < 100) {
      message.error('Minimum withdrawal amount is $100');
      return;
    }
    
    if (amount > (financialSummary?.balance || 0)) {
      message.error('Insufficient balance');
      return;
    }
    
    if (!selectedAddress) {
      message.error('Please select a withdrawal address');
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      message.success('Withdrawal request submitted successfully!');
      form.resetFields();
      setSelectedAddress(null);
      setLoading(false);
    }, 2000);
  };

  const handleReset = () => {
    form.resetFields();
    setSelectedAddress(null);
  };

  const watchedAmount = Form.useWatch('amount', form);
  const watchedFirstName = Form.useWatch('firstName', form);
  const watchedLastName = Form.useWatch('lastName', form);
  
  // Calculate fee (1% of amount)
  const fee = watchedAmount ? (watchedAmount * 0.01) : 0;
  const netAmount = watchedAmount ? (watchedAmount - fee) : 0;

  // Address table columns
  const addressColumns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const cryptoType = cryptoTypes.find(ct => ct.value === type);
        return (
          <Tag color={cryptoType?.color}>
            {type}
          </Tag>
        );
      },
    },
    {
      title: 'Label',
      dataIndex: 'label',
      key: 'label',
      render: (label: string, record: WithdrawAddress) => (
        <Space>
          {record.isDefault && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
          {label}
        </Space>
      ),
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      render: (address: string) => (
        <Space>
          <Text code style={{ fontSize: '12px' }}>
            {address.substring(0, 8)}...{address.substring(address.length - 8)}
          </Text>
          <Button 
            icon={<CopyOutlined />} 
            size="small" 
            type="text"
            onClick={() => handleCopyAddress(address)}
          />
        </Space>
      ),
    },
    {
      title: 'Network',
      dataIndex: 'network',
      key: 'network',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: WithdrawAddress) => (
        <Popconfirm
          title="Delete Address"
          description="Are you sure you want to delete this withdrawal address?"
          onConfirm={() => handleDeleteAddress(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button 
            icon={<DeleteOutlined />} 
            danger 
            size="small"
            type="text"
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24, color: '#27408b' }}>
        Withdraw Funds
      </Title>

      {/* Balance Display */}
      <Card variant="outlined" style={{ marginBottom: 24, borderRadius: '12px', background: 'linear-gradient(135deg, #36648b 0%, #4a708b 100%)' }}>
        <Statistic
          title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>Available Balance</span>}
          value={financialSummary?.balance || 17500}
          precision={2}
          valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 'bold' }}
          prefix={<BankOutlined />}
          suffix={financialSummary?.currency || 'USD'}
        />
        <Text style={{ color: 'rgba(255,255,255,0.7)' }}>
          You can withdraw up to ${(financialSummary?.balance || 17500).toLocaleString()} USD
        </Text>
      </Card>

      {/* Withdrawal Addresses Management */}
      <Card
        title={
          <Space>
            <WalletOutlined />
            Withdrawal Addresses ({withdrawAddresses.length}/3)
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAddAddressModalVisible(true)}
            disabled={withdrawAddresses.length >= 3}
          >
            Add Address
          </Button>
        }
        variant="outlined"
        style={{ marginBottom: 24, borderRadius: '12px' }}
      >
        {withdrawAddresses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <WalletOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: 16 }} />
            <Text type="secondary">No withdrawal addresses added yet</Text>
            <br />
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setAddAddressModalVisible(true)}
              style={{ marginTop: 16 }}
            >
              Add Your First Address
            </Button>
          </div>
        ) : (
          <Table
            columns={addressColumns}
            dataSource={withdrawAddresses}
            rowKey="id"
            pagination={false}
            size="middle"
          />
        )}
      </Card>

      {/* Withdrawal Form */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <Card
            title="Withdrawal Information"
            variant="outlined"
            style={{ borderRadius: '12px' }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleWithdrawSubmit}
            >
              <Form.Item
                name="addressId"
                label="Withdrawal Address"
                rules={[{ required: true, message: 'Please select withdrawal address' }]}
              >
                <Select
                  size="large"
                  placeholder="Select withdrawal address"
                  onChange={(value) => {
                    const address = withdrawAddresses.find(addr => addr.id === value);
                    setSelectedAddress(address || null);
                  }}
                >
                  {withdrawAddresses.map(address => (
                    <Option key={address.id} value={address.id}>
                      <Space>
                        <Tag color={cryptoTypes.find(ct => ct.value === address.type)?.color}>
                          {address.type}
                        </Tag>
                        {address.label}
                        {address.isDefault && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="amount"
                label="Amount"
                rules={[
                  { required: true, message: 'Please enter withdrawal amount' },
                  { 
                    validator: (_, value) => {
                      if (value && value < 100) {
                        return Promise.reject(new Error('Minimum withdrawal amount is $100'));
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
                message="Withdrawal Information"
                description="Withdrawal requests are processed within 24 hours. A 1% transaction fee applies to all withdrawals."
                type="info"
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
                    disabled={withdrawAddresses.length === 0}
                  >
                    Submit Withdrawal Request
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
                💸 Withdrawal Summary
              </Space>
            }
            variant="outlined"
            style={{ borderRadius: '12px' }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Withdrawal Address:</Text>
                <Text strong>
                  {selectedAddress ? selectedAddress.label : 'Not selected'}
                </Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Address Type:</Text>
                <Text strong>
                  {selectedAddress ? (
                    <Tag color={cryptoTypes.find(ct => ct.value === selectedAddress.type)?.color}>
                      {selectedAddress.type}
                    </Tag>
                  ) : 'Not selected'}
                </Text>
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
                <Text>Withdrawal Amount:</Text>
                <Text strong>${watchedAmount?.toLocaleString() || '0'} USD</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Transaction Fee (1%):</Text>
                <Text strong style={{ color: '#ff4d4f' }}>-${fee.toFixed(2)} USD</Text>
              </div>
              <Divider style={{ margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong>Net Amount:</Text>
                <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                  ${netAmount.toFixed(2)} USD
                </Text>
              </div>
            </Space>

            <Alert
              message="Processing Time"
              description="Withdrawals are processed within 24 hours during business days"
              type="warning"
              showIcon
              style={{ marginTop: 16 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Add Address Modal */}
      <Modal
        title="Add Withdrawal Address"
        open={addAddressModalVisible}
        onCancel={() => {
          setAddAddressModalVisible(false);
          addressForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={addressForm}
          layout="vertical"
          onFinish={handleAddAddress}
        >
          <Form.Item
            name="type"
            label="Cryptocurrency Type"
            rules={[{ required: true, message: 'Please select cryptocurrency type' }]}
          >
            <Select size="large" placeholder="Select cryptocurrency">
              {cryptoTypes.map(type => (
                <Option key={type.value} value={type.value}>
                  <Space>
                    <GlobalOutlined style={{ color: type.color }} />
                    {type.label}
                    <Text type="secondary">({type.network})</Text>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="label"
            label="Address Label"
            rules={[{ required: true, message: 'Please enter address label' }]}
          >
            <Input 
              size="large" 
              placeholder="e.g., Main Wallet, Cold Storage" 
              maxLength={50}
            />
          </Form.Item>

          <Form.Item
            name="address"
            label="Wallet Address"
            rules={[
              { required: true, message: 'Please enter wallet address' },
              { min: 26, message: 'Invalid wallet address format' }
            ]}
          >
            <Input.TextArea 
              size="large" 
              placeholder="Enter the complete wallet address"
              autoSize={{ minRows: 2, maxRows: 4 }}
            />
          </Form.Item>

          <Alert
            message="Important Security Notice"
            description="Double-check the wallet address before adding. Incorrect addresses may result in permanent loss of funds."
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button 
                onClick={() => {
                  setAddAddressModalVisible(false);
                  addressForm.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Add Address
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Withdraw;