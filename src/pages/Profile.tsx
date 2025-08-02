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
  Upload,
  Progress,
  Tag,
  Statistic,
  Divider,
  message,
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  BankOutlined,
  WalletOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../store';
const { Title, Text } = Typography;
const { Dragger } = Upload;

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile, kycStatus, accountSummary } = useAppSelector((state) => state.user);
  
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      form.setFieldsValue(profile);
    }
  }, [profile, form]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      form.setFieldsValue(profile);
    }
  };

  const handleSave = (values: any) => {
    setLoading(true);
    setTimeout(() => {
      message.success('Profile updated successfully!');
      setIsEditing(false);
      setLoading(false);
    }, 2000);
  };

  const handleUpload = (info: any, documentType: string) => {
    const { status } = info.file;
    if (status === 'done') {
      message.success(`${documentType} uploaded successfully!`);
    } else if (status === 'error') {
      message.error(`${documentType} upload failed.`);
    }
  };

  const getKYCStatusInfo = () => {
    const statusConfig = {
      not_uploaded: {
        color: 'default',
        icon: <ExclamationCircleOutlined />,
        text: 'Not Uploaded',
        progress: 0,
      },
      pending: {
        color: 'processing',
        icon: <ClockCircleOutlined />,
        text: 'Under Review',
        progress: 50,
      },
      approved: {
        color: 'success',
        icon: <CheckCircleOutlined />,
        text: 'Approved',
        progress: 100,
      },
      rejected: {
        color: 'error',
        icon: <CloseCircleOutlined />,
        text: 'Rejected',
        progress: 25,
      },
    };
    return statusConfig[kycStatus?.status || 'not_uploaded'];
  };

  const statusInfo = getKYCStatusInfo();

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24, color: '#27408b' }}>
        Profile & KYC Verification
      </Title>

      <Row gutter={[24, 24]}>
        {/* User Information Section */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <UserOutlined />
                Personal Information
              </Space>
            }
            extra={
              !isEditing ? (
                <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
                  Edit Profile
                </Button>
              ) : (
                <Space>
                  <Button icon={<CloseOutlined />} onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={loading}
                    onClick={() => form.submit()}
                  >
                    Save Changes
                  </Button>
                </Space>
              )
            }
            variant="outlined"
            style={{ borderRadius: '12px' }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              disabled={!isEditing}
            >
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

              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter valid email' }
                ]}
              >
                <Input size="large" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="phone"
                    label="Phone Number"
                    rules={[{ required: true, message: 'Please enter phone number' }]}
                  >
                    <Input size="large" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="nationality"
                    label="Nationality"
                    rules={[{ required: true, message: 'Please enter nationality' }]}
                  >
                    <Input size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="country"
                    label="Country"
                    rules={[{ required: true, message: 'Please enter country' }]}
                  >
                    <Input size="large" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="city"
                    label="City"
                    rules={[{ required: true, message: 'Please enter city' }]}
                  >
                    <Input size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="address"
                label="Address"
                rules={[{ required: true, message: 'Please enter address' }]}
              >
                <Input.TextArea size="large" rows={2} />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="postalCode"
                    label="Postal Code"
                    rules={[{ required: true, message: 'Please enter postal code' }]}
                  >
                    <Input size="large" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="birthDate"
                    label="Date of Birth"
                    rules={[{ required: true, message: 'Please enter birth date' }]}
                  >
                    <Input size="large" type="date" />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>

        {/* KYC Verification Section - More Compact */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <Space>
                <CheckCircleOutlined />
                KYC Verification
              </Space>
            }
            variant="outlined"
            style={{ borderRadius: '12px', marginBottom: 16 }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {/* Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>Status:</Text>
                <Tag color={statusInfo.color} icon={statusInfo.icon}>
                  {statusInfo.text}
                </Tag>
              </div>

              {/* Progress */}
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  Verification Progress:
                </Text>
                <Progress
                  percent={statusInfo.progress}
                  status={statusInfo.progress === 100 ? 'success' : 'active'}
                  strokeColor={statusInfo.progress === 100 ? '#52c41a' : '#27408b'}
                />
              </div>

              <Divider style={{ margin: '12px 0' }} />

              {/* Required Documents - More Compact */}
              <div>
                <Text strong style={{ display: 'block', marginBottom: 12 }}>
                  Required Documents:
                </Text>
                
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  {/* ID Front */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: '13px' }}>ID Front:</Text>
                    {kycStatus?.documents.idFront ? (
                      <Tag color="success" style={{ fontSize: '11px', padding: '0 6px' }}>Uploaded</Tag>
                    ) : (
                      <Dragger
                        name="idFront"
                        multiple={false}
                        showUploadList={false}
                        onChange={(info) => handleUpload(info, 'ID Front')}
                        style={{ 
                          width: 80, 
                          height: 40, 
                          border: '1px dashed #d9d9d9',
                          borderRadius: '4px',
                          background: '#fafafa'
                        }}
                      >
                        <div style={{ fontSize: '10px', color: '#666', textAlign: 'center', lineHeight: '38px' }}>
                          Upload
                        </div>
                      </Dragger>
                    )}
                  </div>

                  {/* ID Back */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: '13px' }}>ID Back:</Text>
                    {kycStatus?.documents.idBack ? (
                      <Tag color="success" style={{ fontSize: '11px', padding: '0 6px' }}>Uploaded</Tag>
                    ) : (
                      <Dragger
                        name="idBack"
                        multiple={false}
                        showUploadList={false}
                        onChange={(info) => handleUpload(info, 'ID Back')}
                        style={{ 
                          width: 80, 
                          height: 40, 
                          border: '1px dashed #d9d9d9',
                          borderRadius: '4px',
                          background: '#fafafa'
                        }}
                      >
                        <div style={{ fontSize: '10px', color: '#666', textAlign: 'center', lineHeight: '38px' }}>
                          Upload
                        </div>
                      </Dragger>
                    )}
                  </div>

                  {/* Proof of Residence */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: '13px' }}>Proof of Residence:</Text>
                    {kycStatus?.documents.proofOfResidence ? (
                      <Tag color="success" style={{ fontSize: '11px', padding: '0 6px' }}>Uploaded</Tag>
                    ) : (
                      <Dragger
                        name="proofOfResidence"
                        multiple={false}
                        showUploadList={false}
                        onChange={(info) => handleUpload(info, 'Proof of Residence')}
                        style={{ 
                          width: 80, 
                          height: 40, 
                          border: '1px dashed #d9d9d9',
                          borderRadius: '4px',
                          background: '#fafafa'
                        }}
                      >
                        <div style={{ fontSize: '10px', color: '#666', textAlign: 'center', lineHeight: '38px' }}>
                          Upload
                        </div>
                      </Dragger>
                    )}
                  </div>
                </Space>

                <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: 8 }}>
                  Accepted formats: JPEG, PNG, PDF (max 5MB)
                </Text>
              </div>
            </Space>
          </Card>

          {/* Account Summary Card */}
          <Card
            title={
              <Space>
                <BankOutlined />
                Account Summary
              </Space>
            }
            variant="outlined"
            style={{ borderRadius: '12px' }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="Active Accounts"
                    value={accountSummary?.activeAccounts || 0}
                    prefix={<BankOutlined />}
                    valueStyle={{ color: '#27408b', fontSize: '20px' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Wallet Addresses"
                    value={accountSummary?.usedWalletAddresses || 0}
                    prefix={<WalletOutlined />}
                    valueStyle={{ color: '#27408b', fontSize: '20px' }}
                  />
                </Col>
              </Row>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>Account Status:</Text>
                <Tag 
                  color={accountSummary?.accountStatus === 'active' ? 'success' : 'warning'}
                  icon={<GlobalOutlined />}
                >
                  {accountSummary?.accountStatus?.toUpperCase() || 'ACTIVE'}
                </Tag>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;