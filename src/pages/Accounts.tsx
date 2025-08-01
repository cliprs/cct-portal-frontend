import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Drawer,
  Form,
  Select,
  Switch,
  Typography,
  Space,
  Tag,
  Modal,
  Input,
  Tooltip,
  Row,
  Col,
  App,
  Alert,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  KeyOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { useAppSelector, useAppDispatch } from '../store';
import { 
  setAccounts, 
  setLoading, 
  addAccount, 
  updateAccount,
  setError,
  TradingAccount
} from '../store/slices/accountsSlice';
import { 
  accountsApi, 
  transformAccountForFrontend, 
  transformAccountForBackend,
  formatLeverage,
  formatAccountStatus,
  type CreateAccountRequest 
} from '../services/accountsApi';
import { ApiError, apiService } from '../services/api'; // 🔧 apiService import eklendi

const { Title, Text } = Typography;
const { Option } = Select;

interface CreateAccountForm {
  platform: 'MT4' | 'MT5';
  leverage: string;
  accountType: string;
  currency: 'USD' | 'GBP' | 'EUR' | 'TRY' | 'AED';
  isIslamic: boolean;
  server: string;
}

const Accounts: React.FC = () => {
  const { message } = App.useApp();
  const dispatch = useAppDispatch();
  const { accounts, loading, error } = useAppSelector((state: any) => state.accounts);
  const { token } = useAppSelector((state: any) => state.auth);
  
  const [createDrawerVisible, setCreateDrawerVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<TradingAccount | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
  
  const { control, handleSubmit, reset, formState: { errors } } = useForm<CreateAccountForm>();
  const [passwordForm] = Form.useForm();

  // Check backend connection on mount
  useEffect(() => {
    checkBackendConnection();
  }, []);

  // Load accounts data when authenticated
  useEffect(() => {
    if (token && backendConnected) {
      loadAccountsData();
    }
  }, [token, backendConnected]);

  // 🔧 Backend connection check - API service kullanıyor
  const checkBackendConnection = async () => {
    try {
      console.log('🔍 Testing backend connection via API service...');
      
      // Mevcut API service'i kullan - bu otomatik olarak doğru URL'yi kullanacak
      const isHealthy = await apiService.healthCheck();
      
      if (isHealthy) {
        setBackendConnected(true);
        console.log('✅ Backend connection established via API service');
        return;
      }
      
      throw new Error('Backend health check failed');
    } catch (error) {
      setBackendConnected(false);
      console.warn('⚠️ Backend not available, using fallback mode', error);
    }
  };

  const loadAccountsData = async () => {
    dispatch(setLoading(true));
    setApiError(null);
    
    try {
      if (!backendConnected) {
        // Fallback to mock data if backend unavailable
        loadMockAccounts();
        return;
      }

      const response = await accountsApi.getAccounts({
        page: 1,
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      if (response.success && response.data) {
        const transformedAccounts = response.data.accounts.map(transformAccountForFrontend);
        dispatch(setAccounts(transformedAccounts));
        console.log(`✅ Loaded ${transformedAccounts.length} accounts from backend`);
      } else {
        throw new Error(response.message || 'Failed to load accounts');
      }
    } catch (error) {
      console.error('❌ Failed to load accounts:', error);
      
      const apiError = error as ApiError;
      setApiError(apiError.message || 'Failed to load trading accounts');
      dispatch(setError(apiError.message || 'Failed to load accounts'));
      
      // Fallback to mock data on error
      loadMockAccounts();
    } finally {
      dispatch(setLoading(false));
    }
  };

  const loadMockAccounts = () => {
    console.log('📦 Loading mock accounts data');
    
    const mockAccounts: TradingAccount[] = [
      {
        id: '1',
        accountNumber: 'MT4-123456',
        accountType: 'Standard',
        currency: 'USD',
        balance: 8500.00,
        leverage: '1:500',
        status: 'active',
        platform: 'MT4',
        server: 'Ct.2',
        createdAt: '2024-01-10',
        isIslamic: false
      },
      {
        id: '2',
        accountNumber: 'MT5-789012',
        accountType: 'ECN',
        currency: 'USD',
        balance: 12000.00,
        leverage: '1:200',
        status: 'active',
        platform: 'MT5',
        server: 'Ct.3',
        createdAt: '2024-01-08',
        isIslamic: true
      }
    ];
    
    dispatch(setAccounts(mockAccounts));
  };

  // Table columns configuration
  const columns = [
    {
      title: 'Account Number',
      dataIndex: 'accountNumber',
      key: 'accountNumber',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Type',
      dataIndex: 'accountType',
      key: 'accountType',
      render: (type: string) => {
        const colorMap: Record<string, string> = {
          'Standard': 'blue',
          'ECN': 'green',
          'Cent': 'orange',
          'Demo': 'purple',
          'VIP': 'gold',
          'STP': 'cyan',
        };
        return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
      },
    },
    {
      title: 'Platform',
      dataIndex: 'platform',
      key: 'platform',
      render: (platform: string) => <Tag color="geekblue">{platform}</Tag>,
    },
    {
      title: 'Currency',
      dataIndex: 'currency',
      key: 'currency',
      render: (currency: string) => <Tag>{currency}</Tag>,
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      render: (balance: number, record: TradingAccount) => (
        <Text strong style={{ color: balance >= 0 ? '#52c41a' : '#ff4d4f' }}>
          ${balance.toLocaleString()} {record.currency}
        </Text>
      ),
      sorter: (a: TradingAccount, b: TradingAccount) => a.balance - b.balance,
    },
    {
      title: 'Leverage',
      dataIndex: 'leverage',
      key: 'leverage',
      render: (leverage: string) => <Tag color="cyan">{leverage}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const { text, color } = formatAccountStatus(status);
        return <Tag color={color}>{text.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: TradingAccount) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Change Password">
            <Button
              icon={<KeyOutlined />}
              size="small"
              onClick={() => handleChangePassword(record)}
              disabled={record.status !== 'active'}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleCreateAccount = () => {
    setCreateDrawerVisible(true);
  };

  const handleRefresh = () => {
    loadAccountsData();
  };

  const handleViewDetails = (account: TradingAccount) => {
    setSelectedAccount(account);
    setDetailsModalVisible(true);
  };

  const handleChangePassword = (account: TradingAccount) => {
    setSelectedAccount(account);
    setPasswordModalVisible(true);
  };

  const onCreateAccountSubmit = async (data: CreateAccountForm) => {
    try {
      dispatch(setLoading(true));
      setApiError(null);

      if (!backendConnected) {
        // Mock account creation for demo
        createMockAccount(data);
        return;
      }

      const backendData = transformAccountForBackend(data);
      const response = await accountsApi.createAccount(backendData);

      if (response.success && response.data) {
        const newAccount = transformAccountForFrontend(response.data.account);
        dispatch(addAccount(newAccount));
        message.success('Trading account created successfully!');
        setCreateDrawerVisible(false);
        reset();
        
        // Reload accounts to get updated list
        setTimeout(() => loadAccountsData(), 1000);
      } else {
        throw new Error(response.message || 'Failed to create account');
      }
    } catch (error) {
      console.error('❌ Failed to create account:', error);
      
      const apiError = error as ApiError;
      
      if (apiError.message.includes('KYC')) {
        message.error('KYC verification required to create trading account');
      } else if (apiError.message.includes('limit')) {
        message.error('Maximum number of trading accounts reached');
      } else {
        message.error(apiError.message || 'Failed to create trading account');
      }
      
      setApiError(apiError.message || 'Account creation failed');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const createMockAccount = (data: CreateAccountForm) => {
    setTimeout(() => {
      const newAccount: TradingAccount = {
        id: Date.now().toString(),
        accountNumber: `${data.platform}-${Math.floor(Math.random() * 1000000)}`,
        accountType: data.accountType as any,
        currency: data.currency,
        balance: 0,
        leverage: data.leverage as any,
        status: 'active',
        platform: data.platform,
        server: data.server,
        createdAt: new Date().toISOString().split('T')[0],
        isIslamic: data.isIslamic,
      };

      dispatch(addAccount(newAccount));
      message.success('Trading account created successfully! (Demo Mode)');
      setCreateDrawerVisible(false);
      reset();
      dispatch(setLoading(false));
    }, 2000);
  };

  const handlePasswordChange = async (values: any) => {
    try {
      dispatch(setLoading(true));

      if (!backendConnected || !selectedAccount) {
        // Mock password change
        setTimeout(() => {
          message.success('Password changed successfully! (Demo Mode)');
          setPasswordModalVisible(false);
          passwordForm.resetFields();
          dispatch(setLoading(false));
        }, 1500);
        return;
      }

      const response = await accountsApi.changeAccountPassword(selectedAccount.id, {
        newPassword: values.newPassword
      });

      if (response.success) {
        message.success('Password changed successfully!');
        setPasswordModalVisible(false);
        passwordForm.resetFields();
      } else {
        throw new Error(response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('❌ Failed to change password:', error);
      
      const apiError = error as ApiError;
      message.error(apiError.message || 'Failed to change password');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const renderConnectionStatus = () => {
    if (backendConnected === null) {
      return (
        <Alert
          message="Checking backend connection..."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      );
    }

    if (!backendConnected) {
      return (
        <Alert
          message="Backend Unavailable"
          description="Running in demo mode with mock data. Some features may be limited."
          type="warning"
          showIcon
          action={
            <Button size="small" icon={<ReloadOutlined />} onClick={checkBackendConnection}>
              Retry
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      );
    }

    return null;
  };

  const renderErrorAlert = () => {
    if (!apiError) return null;

    return (
      <Alert
        message="API Error"
        description={apiError}
        type="error"
        showIcon
        closable
        onClose={() => setApiError(null)}
        style={{ marginBottom: 16 }}
      />
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: '#27408b' }}>
          Trading Accounts
          {!backendConnected && (
            <Tag color="orange" style={{ marginLeft: 8 }}>Demo Mode</Tag>
          )}
        </Title>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={handleCreateAccount}
            style={{ borderRadius: '8px' }}
          >
            Create Account
          </Button>
        </Space>
      </div>

      {renderConnectionStatus()}
      {renderErrorAlert()}

      {/* Accounts Table */}
      <Card 
        style={{ 
          borderRadius: '12px',
          border: '1px solid #f0f0f0'
        }}
      >
        {accounts.length === 0 && !loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <InfoCircleOutlined style={{ fontSize: '64px', color: '#d9d9d9', marginBottom: 16 }} />
            <Title level={4} type="secondary">
              No Trading Accounts Found
            </Title>
            <Text type="secondary">
              You don't have any trading accounts yet. Create your first account to start trading.
            </Text>
            <br />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={handleCreateAccount}
              style={{ marginTop: 16, borderRadius: '8px' }}
            >
              Create Your First Account
            </Button>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={accounts}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} accounts`,
            }}
            scroll={{ x: 800 }}
          />
        )}
      </Card>

      {/* Create Account Drawer */}
      <Drawer
        title="Create New Trading Account"
        placement="right"
        width={500}
        open={createDrawerVisible}
        onClose={() => setCreateDrawerVisible(false)}
        className="slide-in-right"
      >
        {!backendConnected && (
          <Alert
            message="Demo Mode"
            description="Account creation is simulated. No real account will be created."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        
        <form onSubmit={handleSubmit(onCreateAccountSubmit)}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Platform</label>
            <Controller
              name="platform"
              control={control}
              defaultValue="MT4"
              rules={{ required: 'Platform is required' }}
              render={({ field }) => (
                <Select {...field} size="large" style={{ width: '100%' }}>
                  <Option value="MT4">MetaTrader 4</Option>
                  <Option value="MT5">MetaTrader 5</Option>
                </Select>
              )}
            />
            {errors.platform && <Text type="danger">{errors.platform.message}</Text>}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Leverage</label>
            <Controller
              name="leverage"
              control={control}
              defaultValue="1:500"
              rules={{ required: 'Leverage is required' }}
              render={({ field }) => (
                <Select {...field} size="large" style={{ width: '100%' }}>
                  <Option value="1:1">1:1</Option>
                  <Option value="1:10">1:10</Option>
                  <Option value="1:25">1:25</Option>
                  <Option value="1:50">1:50</Option>
                  <Option value="1:100">1:100</Option>
                  <Option value="1:200">1:200</Option>
                  <Option value="1:300">1:300</Option>
                  <Option value="1:400">1:400</Option>
                  <Option value="1:500">1:500</Option>
                </Select>
              )}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Account Type</label>
            <Controller
              name="accountType"
              control={control}
              defaultValue="Standard"
              rules={{ required: 'Account type is required' }}
              render={({ field }) => (
                <Select {...field} size="large" style={{ width: '100%' }}>
                  <Option value="Standard">Standard</Option>
                  <Option value="ECN">ECN</Option>
                  <Option value="Cent">Cent (Micro)</Option>
                  <Option value="Spread">STP</Option>
                </Select>
              )}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Currency</label>
            <Controller
              name="currency"
              control={control}
              defaultValue="USD"
              rules={{ required: 'Currency is required' }}
              render={({ field }) => (
                <Select {...field} size="large" style={{ width: '100%' }}>
                  <Option value="USD">USD</Option>
                  <Option value="EUR">EUR</Option>
                  <Option value="GBP">GBP</Option>
                  <Option value="TRY">TRY</Option>
                  <Option value="AED">AED</Option>
                </Select>
              )}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Server</label>
            <Controller
              name="server"
              control={control}
              defaultValue="Ct.2"
              rules={{ required: 'Server is required' }}
              render={({ field }) => (
                <Select {...field} size="large" style={{ width: '100%' }}>
                  <Option value="Ct.1">Ct.1</Option>
                  <Option value="Ct.2">Ct.2</Option>
                  <Option value="Ct.3">Ct.3</Option>
                  <Option value="Ct.4">Ct.4</Option>
                  <Option value="Ct.5">Ct.5</Option>
                </Select>
              )}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <Controller
              name="isIslamic"
              control={control}
              defaultValue={false}
              render={({ field: { value, onChange } }) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Switch checked={value} onChange={onChange} />
                  <span>Islamic Account</span>
                </div>
              )}
            />
          </div>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setCreateDrawerVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create Account
              </Button>
            </Space>
          </div>
        </form>
      </Drawer>

      {/* Account Details Modal */}
      <Modal
        title="Account Details"
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        {selectedAccount && (
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Text type="secondary">Account Number</Text>
                <Text strong>{selectedAccount.accountNumber}</Text>
              </Space>
            </Col>
            <Col span={12}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Text type="secondary">Account Type</Text>
                <Tag color="blue">{selectedAccount.accountType}</Tag>
              </Space>
            </Col>
            <Col span={12}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Text type="secondary">Platform</Text>
                <Tag color="geekblue">{selectedAccount.platform}</Tag>
              </Space>
            </Col>
            <Col span={12}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Text type="secondary">Server</Text>
                <Text strong>{selectedAccount.server}</Text>
              </Space>
            </Col>
            <Col span={12}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Text type="secondary">Currency</Text>
                <Tag>{selectedAccount.currency}</Tag>
              </Space>
            </Col>
            <Col span={12}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Text type="secondary">Leverage</Text>
                <Tag color="cyan">{selectedAccount.leverage}</Tag>
              </Space>
            </Col>
            <Col span={12}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Text type="secondary">Balance</Text>
                <Text strong style={{ color: selectedAccount.balance >= 0 ? '#52c41a' : '#ff4d4f' }}>
                  ${selectedAccount.balance.toLocaleString()} {selectedAccount.currency}
                </Text>
              </Space>
            </Col>
            <Col span={12}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Text type="secondary">Created Date</Text>
                <Text strong>{selectedAccount.createdAt}</Text>
              </Space>
            </Col>
            <Col span={12}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Text type="secondary">Islamic Account</Text>
                <Tag color={selectedAccount.isIslamic ? 'green' : 'default'}>
                  {selectedAccount.isIslamic ? 'Yes' : 'No'}
                </Tag>
              </Space>
            </Col>
            <Col span={12}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Text type="secondary">Status</Text>
                <Tag color={selectedAccount.status === 'active' ? 'success' : 'error'}>
                  {selectedAccount.status.toUpperCase()}
                </Tag>
              </Space>
            </Col>
          </Row>
        )}
      </Modal>

      {/* Change Password Modal */}
      <Modal
        title="Change Trading Account Password"
        open={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        footer={null}
        width={400}
      >
        {!backendConnected && (
          <Alert
            message="Demo Mode"
            description="Password change is simulated in demo mode."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}
          style={{ marginTop: 20 }}
        >
          <Form.Item
            name="currentPassword"
            label="Current Password"
            rules={[{ required: true, message: 'Please enter current password' }]}
          >
            <Input.Password size="large" placeholder="Enter current password" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: 'Please enter new password' },
              { min: 8, message: 'Password must be at least 8 characters' },
              { 
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'Password must contain uppercase, lowercase, and number'
              }
            ]}
          >
            <Input.Password size="large" placeholder="Enter new password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            rules={[
              { required: true, message: 'Please confirm new password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password size="large" placeholder="Confirm new password" />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setPasswordModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Change Password
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Accounts;