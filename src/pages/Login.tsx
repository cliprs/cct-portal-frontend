// src/pages/Login.tsx
import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Space, Divider } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import { apiService } from '../services/api';

const { Title, Text } = Typography;

interface LoginForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onFinish = async (values: LoginForm) => {
    try {
      setLoading(true);
      setError(null);
      dispatch(loginStart());

      console.log('🔐 Attempting login:', values.email);

      const response = await apiService.post('/auth/login', {
        email: values.email,
        password: values.password,
      });

      if (response.success && response.data) {
        // Debug: Log response structure
        console.log('🔍 Login response:', response.data);
        
        // Type assertion for backend response
        const authData = response.data as any;
        
        // Ensure tokens exist before proceeding
        if (!authData.tokens?.accessToken || !authData.user) {
          throw new Error('Invalid login response - missing required data');
        }

        // Save tokens to localStorage
        localStorage.setItem('accessToken', authData.tokens.accessToken);
        if (authData.tokens.refreshToken) {
          localStorage.setItem('refreshToken', authData.tokens.refreshToken);
        }

        // Update Redux store - no fallback data, must be real
        dispatch(loginSuccess({
          user: authData.user,
          token: authData.tokens.accessToken
        }));

        console.log('✅ Login successful, redirecting...');
        
        // Redirect to dashboard
        navigate('/dashboard');
        
        // Reload to ensure fresh state
        window.location.reload();
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.status,
        response: error.response
      });
      
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (error.status === 400) {
        errorMessage = 'Invalid email or password.';
      } else if (error.status === 401) {
        errorMessage = 'Invalid credentials. Please check your email and password.';
      } else if (error.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      dispatch(loginFailure(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '400px',
          maxWidth: '90vw',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          borderRadius: '12px',
          border: 'none'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: '#27408b',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            CCT
          </div>
          <Title level={2} style={{ margin: 0, color: '#27408b' }}>
            Welcome Back
          </Title>
          <Text type="secondary">
            Sign in to your CCT Portal account
          </Text>
        </div>

        {error && (
          <Alert
            message="Login Failed"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: '24px' }}
            closable
            onClose={() => setError(null)}
          />
        )}

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />}
              placeholder="Enter your email"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: '16px' }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
              style={{ 
                height: '48px',
                borderRadius: '8px',
                background: '#27408b',
                borderColor: '#27408b'
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ margin: '24px 0' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            OR
          </Text>
        </Divider>

        <div style={{ textAlign: 'center' }}>
          <Space direction="vertical" size="small">
            <Text type="secondary">
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#27408b', fontWeight: '500' }}>
                Create Account
              </Link>
            </Text>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default Login;