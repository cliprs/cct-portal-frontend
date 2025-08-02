// src/pages/Register.tsx
import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Space, Divider, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, HomeOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store';
import { loginSuccess } from '../store/slices/authSlice';
import { apiService } from '../services/api';

const { Title, Text } = Typography;

interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  postalCode: string;
}

const Register: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onFinish = async (values: RegisterForm) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      console.log('📝 Attempting registration:', values.email);

      // API'den gelen yanıtı doğrudan yakalıyoruz
      // Başarılı bir API yanıtı (2xx durum kodu) burada herhangi bir hata fırlatmaz
      const response = await apiService.post('/auth/register', {
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        postalCode: values.postalCode,
      });

      // API yanıtının başarılı olduğunu varsayıyoruz. 
      // apiService'in hata durumunda bir istisna (exception) fırlattığını varsayarak bu kontrolü kaldırıyoruz.
      // Eğer backend bir token döndürüyorsa, onu kullanarak giriş yapabiliriz.
      // Eğer token döndürmüyorsa sadece başarılı mesajı gösteririz.

      const authData = response.data as any; // Yanıt verisini al
      setSuccess('Account created successfully!');
      console.log('✅ Registration successful, redirecting to login...');
        
      // Başarılı kayıt sonrası doğrudan giriş sayfasına yönlendir
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error: any) {
      console.error('❌ Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      // Hata mesajını daha doğru bir şekilde işleyin
      if (error.response?.data?.message) {
          // Backend'den gelen spesifik hata mesajını kullan
          errorMessage = error.response.data.message;
      } else if (error.message?.includes('409')) { // Mevcut hata mesajını da kontrol edin
        errorMessage = 'An account with this email already exists. Please use a different email or try logging in.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Eğer hata mesajı "User registered successfully" ise, bu bir başarıdır.
      if (errorMessage === 'User registered successfully') {
         setSuccess('Account created successfully!');
         setTimeout(() => {
           navigate('/login');
         }, 2000);
      } else {
        setError(errorMessage);
      }

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
          width: '500px',
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
            Create Account
          </Title>
          <Text type="secondary">
            Join CCT Portal and start trading
          </Text>
        </div>

        {error && (
          <Alert
            message="Registration Failed"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: '24px' }}
            closable
            onClose={() => setError(null)}
          />
        )}

        {success && (
          <Alert
            message="Registration Successful"
            description={success}
            type="success"
            showIcon
            style={{ marginBottom: '24px' }}
          />
        )}

        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[
                  { required: true, message: 'Please enter your first name' },
                  { min: 2, message: 'First name must be at least 2 characters' }
                ]}
              >
                <Input 
                  prefix={<UserOutlined />}
                  placeholder="First name"
                  autoComplete="given-name"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[
                  { required: true, message: 'Please enter your last name' },
                  { min: 2, message: 'Last name must be at least 2 characters' }
                ]}
              >
                <Input 
                  prefix={<UserOutlined />}
                  placeholder="Last name"
                  autoComplete="family-name"
                />
              </Form.Item>
            </Col>
          </Row>

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
            name="postalCode"
            label="Postal Code"
            rules={[
              { required: true, message: 'Please enter your postal code' },
              { min: 4, message: 'Postal code must be at least 4 characters' }
            ]}
          >
            <Input 
              prefix={<HomeOutlined />}
              placeholder="Enter your postal code"
              autoComplete="postal-code"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            extra="Must contain: uppercase, lowercase, number, special char (!@#$%^&*()_+-=[]{}|;:,.<>?) . Avoid weak patterns like: 123456, abcdef, password, qwerty"
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 8, message: 'Password must be at least 8 characters' },
              { 
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{}|;:,.<>?]{8,}$/,
                message: 'Password must contain uppercase, lowercase, number and special character (!@#$%^&*()_+-=[]{}|;:,.<>?)'
              },
              {
                validator: (_: any, value: any) => {
                  if (!value) return Promise.resolve();
                  
                  // Check for weak patterns
                  const weakPatterns = [
                    /(.)\1{2,}/, // Three or more consecutive identical characters
                    /123456/, // Sequential numbers
                    /abcdef/i, // Sequential letters
                    /password/i, // Contains "password"
                    /qwerty/i, // Contains "qwerty"
                  ];
                  
                  for (const pattern of weakPatterns) {
                    if (pattern.test(value)) {
                      return Promise.reject(new Error('Password contains weak patterns. Avoid sequences like 123456, abcdef, password, qwerty'));
                    }
                  }
                  
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />}
              placeholder="Create a strong password"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />}
              placeholder="Confirm your password"
              autoComplete="new-password"
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
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ margin: '24px 0' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            OR
          </Text>
        </Divider>

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#27408b', fontWeight: '500' }}>
              Sign In
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Register;
