import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Input,
  Typography,
  Space,
  Table,
  Tag,
  DatePicker,
  Select,
  Statistic,
  Tooltip,
  message,
  Empty,
  Alert,
} from 'antd';
import {
  HistoryOutlined,
  SearchOutlined,
  DownloadOutlined,
  FilterOutlined,
  DollarOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../store';
import dayjs from 'dayjs';
import api from '../services/api';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface Transaction {
  id: string;
  transactionId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'TRADE' | 'BONUS' | 'FEE' | 
        'deposit' | 'withdraw' | 'internal_transfer' | 'external_transfer'; // Support both formats
  amount: number;
  fee: number;
  netAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' |
          'completed' | 'pending' | 'processing' | 'rejected' | 'cancelled'; // Support both formats
  description: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  account?: {
    id: string;
    accountNumber: string;
    platform: string;
  };
  // Optional legacy fields for compatibility
  date?: string;
  fromAccount?: string;
  toAccount?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

const History: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  // Fetch transaction history on component mount
  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.log('🚨 No access token found');
        setError('Please log in to view your transaction history');
        return;
      }
      
      // Check if token is expired
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = Date.now() > payload.exp * 1000;
        if (isExpired) {
          console.log('🚨 Token is expired');
          setError('Your session has expired. Please log in again.');
          return;
        }
      } catch (err) {
        console.log('🚨 Invalid token format');
        setError('Invalid session. Please log in again.');
        return;
      }
      
      fetchTransactionHistory();
    }
  }, [isAuthenticated, user]);

  const fetchTransactionHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get<ApiResponse<Transaction[]>>('/transactions/history');
      const responseData = response.data as ApiResponse<Transaction[]>;
      
      if (responseData.success) {
        setTransactions(responseData.data || []);
      } else {
        setError(responseData.message || 'Failed to load transactions');
      }
    } catch (err: any) {
      console.error('Transaction history error:', err);
      setError(err.response?.data?.message || 'Failed to load transaction history');
      setTransactions([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Filter transactions based on search criteria
  useEffect(() => {
    let filtered = transactions || [];

    // Text search
    if (searchText) {
      filtered = filtered.filter(tx => 
        tx.transactionId?.toLowerCase().includes(searchText.toLowerCase()) ||
        tx.description?.toLowerCase().includes(searchText.toLowerCase()) ||
        tx.fromAccount?.toLowerCase().includes(searchText.toLowerCase()) ||
        tx.toAccount?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(tx => {
        // Support both backend and frontend type formats
        const typeMapping: { [key: string]: string[] } = {
          'DEPOSIT': ['DEPOSIT', 'deposit'],
          'WITHDRAWAL': ['WITHDRAWAL', 'withdraw'],
          'TRANSFER': ['TRANSFER', 'internal_transfer'],
          'external_transfer': ['external_transfer'],
          'TRADE': ['TRADE'],
          'BONUS': ['BONUS'],
          'FEE': ['FEE'],
          // Also support direct matches
          'deposit': ['DEPOSIT', 'deposit'],
          'withdraw': ['WITHDRAWAL', 'withdraw'],
          'internal_transfer': ['TRANSFER', 'internal_transfer'],
        };
        
        const allowedTypes = typeMapping[selectedType] || [selectedType];
        return allowedTypes.includes(tx.type);
      });
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(tx => {
        // Support both backend and frontend status formats
        const statusMapping: { [key: string]: string[] } = {
          'COMPLETED': ['COMPLETED', 'completed'],
          'PENDING': ['PENDING', 'pending'],
          'PROCESSING': ['PROCESSING', 'processing'],
          'FAILED': ['FAILED', 'rejected'],
          'CANCELLED': ['CANCELLED', 'cancelled'],
          // Also support direct matches
          'completed': ['COMPLETED', 'completed'],
          'pending': ['PENDING', 'pending'],
          'processing': ['PROCESSING', 'processing'],
          'rejected': ['FAILED', 'rejected'],
          'cancelled': ['CANCELLED', 'cancelled'],
        };
        
        const allowedStatuses = statusMapping[selectedStatus] || [selectedStatus];
        return allowedStatuses.includes(tx.status);
      });
    }

    // Date range filter
    if (dateRange && dateRange[0] && dateRange[1]) {
      filtered = filtered.filter(tx => {
        const txDate = dayjs(tx.date);
        return txDate.isAfter(dateRange[0]!.startOf('day')) && 
               txDate.isBefore(dateRange[1]!.endOf('day'));
      });
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchText, selectedType, selectedStatus, dateRange]);

  const handleCopyTransactionId = (txId: string) => {
    navigator.clipboard.writeText(txId);
    message.success('Transaction ID copied to clipboard!');
  };

  const handleExport = async () => {
    try {
      // Call export API endpoint
      const response = await api.get('/transactions/export', {
        params: {
          type: selectedType !== 'all' ? selectedType : undefined,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
          startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
          endDate: dateRange?.[1]?.format('YYYY-MM-DD'),
        },
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transaction-history-${dayjs().format('YYYY-MM-DD')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success('Transaction history exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      message.error('Failed to export transaction history');
    }
  };

  const handleReset = () => {
    setSearchText('');
    setSelectedType('all');
    setSelectedStatus('all');
    setDateRange(null);
  };

  const handleRefresh = () => {
    if (isAuthenticated && user) {
      fetchTransactionHistory();
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Date & Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      sorter: (a: Transaction, b: Transaction) => {
        const dateA = new Date(a.createdAt || a.date || '');
        const dateB = new Date(b.createdAt || b.date || '');
        return dateA.getTime() - dateB.getTime();
      },
      render: (createdAt: string | Date, record: Transaction) => {
        const date = createdAt || record.date;
        return (
          <div>
            <div>{dayjs(date).format('MMM DD, YYYY')}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {dayjs(date).format('HH:mm:ss')}
            </Text>
          </div>
        );
      },
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 140,
      filters: [
        { text: 'Deposit', value: 'DEPOSIT' },
        { text: 'Withdraw', value: 'WITHDRAWAL' },
        { text: 'Transfer', value: 'TRANSFER' },
        { text: 'Trade', value: 'TRADE' },
        { text: 'Bonus', value: 'BONUS' },
        { text: 'Fee', value: 'FEE' },
      ],
      render: (type: string) => {
        const typeConfig = {
          DEPOSIT: { color: 'green', text: 'Deposit' },
          WITHDRAWAL: { color: 'orange', text: 'Withdraw' },
          TRANSFER: { color: 'blue', text: 'Transfer' },
          TRADE: { color: 'purple', text: 'Trade' },
          BONUS: { color: 'cyan', text: 'Bonus' },
          FEE: { color: 'red', text: 'Fee' },
          // Legacy support
          deposit: { color: 'green', text: 'Deposit' },
          withdraw: { color: 'orange', text: 'Withdraw' },
          internal_transfer: { color: 'blue', text: 'Internal' },
          external_transfer: { color: 'purple', text: 'External' },
        };
        const config = typeConfig[type as keyof typeof typeConfig] || { color: 'default', text: type };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'From / To',
      key: 'fromTo',
      width: 150,
      render: (record: Transaction) => {
        const transferTypes = ['TRANSFER', 'internal_transfer'];
        const externalTypes = ['external_transfer'];
        const depositTypes = ['DEPOSIT', 'deposit'];
        const withdrawTypes = ['WITHDRAWAL', 'withdraw'];
        
        if (transferTypes.includes(record.type)) {
          return (
            <div>
              <div style={{ fontSize: '12px' }}>From: {record.fromAccount || record.account?.accountNumber || 'N/A'}</div>
              <div style={{ fontSize: '12px' }}>To: {record.toAccount || 'Internal'}</div>
            </div>
          );
        }
        if (externalTypes.includes(record.type)) {
          return <Text style={{ fontSize: '12px' }}>To: External User</Text>;
        }
        if (depositTypes.includes(record.type)) {
          return <Text style={{ fontSize: '12px' }}>From: Crypto Wallet</Text>;
        }
        if (withdrawTypes.includes(record.type)) {
          return <Text style={{ fontSize: '12px' }}>To: Crypto Wallet</Text>;
        }
        return '-';
      },
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      sorter: (a: Transaction, b: Transaction) => a.amount - b.amount,
      render: (amount: number, record: Transaction) => {
        const depositTypes = ['DEPOSIT', 'deposit'];
        const transferInTypes = ['TRANSFER'];
        const positiveTransfer = record.type === 'TRANSFER' && record.amount > 0;
        const legacyTransferIn = record.type === 'internal_transfer' && record.toAccount;
        
        const isPositive = depositTypes.includes(record.type) || positiveTransfer || legacyTransferIn;
        const displayAmount = Math.abs(amount);
        
        return (
          <Text strong style={{ color: isPositive ? '#52c41a' : '#ff4d4f' }}>
            {isPositive ? '+' : '-'}${displayAmount?.toLocaleString() || '0'}
          </Text>
        );
      },
    },
    {
      title: 'Fee',
      dataIndex: 'fee',
      key: 'fee',
      width: 80,
      render: (fee: number) => (
        <Text style={{ color: fee > 0 ? '#ff4d4f' : '#52c41a' }}>
          {fee > 0 ? `-$${fee}` : 'FREE'}
        </Text>
      ),
    },
    {
      title: 'Net Amount',
      dataIndex: 'netAmount',
      key: 'netAmount',
      width: 120,
      sorter: (a: Transaction, b: Transaction) => a.netAmount - b.netAmount,
      render: (netAmount: number, record: Transaction) => {
        const depositTypes = ['DEPOSIT', 'deposit'];
        const positiveTransfer = record.type === 'TRANSFER' && record.netAmount > 0;
        const legacyTransferIn = record.type === 'internal_transfer' && record.toAccount;
        
        const isPositive = depositTypes.includes(record.type) || positiveTransfer || legacyTransferIn;
        const displayAmount = Math.abs(netAmount);
        
        return (
          <Text strong style={{ color: isPositive ? '#52c41a' : '#ff4d4f' }}>
            {isPositive ? '+' : '-'}${displayAmount?.toLocaleString() || '0'}
          </Text>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: 'Completed', value: 'COMPLETED' },
        { text: 'Pending', value: 'PENDING' },
        { text: 'Processing', value: 'PROCESSING' },
        { text: 'Failed', value: 'FAILED' },
        { text: 'Cancelled', value: 'CANCELLED' },
      ],
      render: (status: string) => {
        const statusConfig = {
          COMPLETED: { color: 'success', icon: <CheckCircleOutlined />, text: 'Completed' },
          PENDING: { color: 'warning', icon: <ClockCircleOutlined />, text: 'Pending' },
          PROCESSING: { color: 'processing', icon: <SyncOutlined spin />, text: 'Processing' },
          FAILED: { color: 'error', icon: <CloseCircleOutlined />, text: 'Failed' },
          CANCELLED: { color: 'default', icon: <ExclamationCircleOutlined />, text: 'Cancelled' },
          // Legacy support
          completed: { color: 'success', icon: <CheckCircleOutlined />, text: 'Completed' },
          pending: { color: 'warning', icon: <ClockCircleOutlined />, text: 'Pending' },
          processing: { color: 'processing', icon: <SyncOutlined spin />, text: 'Processing' },
          rejected: { color: 'error', icon: <CloseCircleOutlined />, text: 'Rejected' },
          cancelled: { color: 'default', icon: <ExclamationCircleOutlined />, text: 'Cancelled' },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Transaction ID',
      dataIndex: 'transactionId',
      key: 'transactionId',
      width: 180,
      render: (txId: string) => (
        <Space>
          <Text code style={{ fontSize: '11px' }}>
            {txId ? `${txId.substring(0, 12)}...` : 'N/A'}
          </Text>
          {txId && (
            <Tooltip title="Copy Transaction ID">
              <Button 
                icon={<CopyOutlined />} 
                size="small" 
                type="text"
                onClick={() => handleCopyTransactionId(txId)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // Calculate summary statistics
  const completedStatuses = ['COMPLETED', 'completed'];
  const pendingStatuses = ['PENDING', 'PROCESSING', 'pending', 'processing'];
  
  const completedTransactions = filteredTransactions.filter(tx => completedStatuses.includes(tx.status));
  const pendingTransactions = filteredTransactions.filter(tx => pendingStatuses.includes(tx.status));
  
  const totalVolume = completedTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount || 0), 0);
  const totalFees = completedTransactions.reduce((sum, tx) => sum + (tx.fee || 0), 0);

  // Show authentication required message
  if (!isAuthenticated) {
    return (
      <div style={{ padding: '50px 0', textAlign: 'center' }}>
        <Alert
          message="Authentication Required"
          description="Please log in to view your transaction history."
          type="warning"
          showIcon
          style={{ maxWidth: '500px', margin: '0 auto' }}
        />
      </div>
    );
  }

  // Show error message
  if (error) {
    return (
      <div>
        <Title level={2} style={{ marginBottom: 24, color: '#27408b' }}>
          Transaction History
        </Title>
        <Alert
          message="Error Loading Transactions"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
          style={{ marginBottom: 24 }}
        />
      </div>
    );
  }

  // Show empty state for new users
  if (!loading && (!transactions || transactions.length === 0)) {
    return (
      <div>
        <Title level={2} style={{ marginBottom: 24, color: '#27408b' }}>
          Transaction History
        </Title>
        
        <Card variant="outlined" style={{ borderRadius: '12px', textAlign: 'center', padding: '50px 20px' }}>
          <Empty
            image={<InboxOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />}
            imageStyle={{ height: 80 }}
            description={
              <div>
                <Title level={4} style={{ color: '#8c8c8c', marginBottom: 8 }}>
                  No Transactions Yet
                </Title>
                <Text style={{ color: '#8c8c8c' }}>
                  Your transaction history will appear here once you make your first transaction.
                </Text>
              </div>
            }
          >
            <Space>
              <Button type="primary" onClick={() => window.location.href = '/transactions/deposit'}>
                Make Your First Deposit
              </Button>
              <Button onClick={handleRefresh}>
                Refresh
              </Button>
            </Space>
          </Empty>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ marginBottom: 0, color: '#27408b' }}>
            Transaction History
          </Title>
        </Col>
        <Col>
          <Button 
            icon={<SyncOutlined />} 
            onClick={handleRefresh}
            loading={loading}
          >
            Refresh
          </Button>
        </Col>
      </Row>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="outlined" style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Completed</span>}
              value={completedTransactions.length}
              valueStyle={{ color: '#fff', fontSize: '24px' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="outlined" style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Pending</span>}
              value={pendingTransactions.length}
              valueStyle={{ color: '#fff', fontSize: '24px' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="outlined" style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #27408b 0%, #3a5fcd 100%)' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Total Volume</span>}
              value={totalVolume}
              precision={2}
              valueStyle={{ color: '#fff', fontSize: '24px' }}
              prefix={<DollarOutlined />}
              suffix="USD"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="outlined" style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Total Fees</span>}
              value={totalFees}
              precision={2}
              valueStyle={{ color: '#fff', fontSize: '24px' }}
              prefix={<DollarOutlined />}
              suffix="USD"
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card variant="outlined" style={{ marginBottom: 24, borderRadius: '12px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Search by Transaction ID or Description"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Transaction Type"
              value={selectedType}
              onChange={setSelectedType}
              style={{ width: '100%' }}
            >
              <Option value="all">All Types</Option>
              <Option value="DEPOSIT">Deposit</Option>
              <Option value="WITHDRAWAL">Withdraw</Option>
              <Option value="TRANSFER">Transfer</Option>
              <Option value="external_transfer">External Transfer</Option>
              <Option value="TRADE">Trade</Option>
              <Option value="BONUS">Bonus</Option>
              <Option value="FEE">Fee</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Status"
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: '100%' }}
            >
              <Option value="all">All Status</Option>
              <Option value="COMPLETED">Completed</Option>
              <Option value="PENDING">Pending</Option>
              <Option value="PROCESSING">Processing</Option>
              <Option value="FAILED">Failed/Rejected</Option>
              <Option value="CANCELLED">Cancelled</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} md={4}>
            <Space>
              <Button icon={<FilterOutlined />} onClick={handleReset}>
                Reset
              </Button>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={handleExport}
              >
                Export
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Transaction Table */}
      <Card variant="outlined" style={{ borderRadius: '12px' }}>
        <Table
          columns={columns}
          dataSource={filteredTransactions}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredTransactions.length,
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} transactions`,
          }}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default History;