import React, { useState } from 'react';
import { Form, Input, Row, Col, Button, Typography } from 'antd';
import { useAuthContext } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { CloseOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { toastify, isEmail } = window;
const initialState = { email: '', password: '' };

export default function Login() {
  const [state, setState] = useState(initialState);
  const { login, isProcessing } = useAuthContext();
  const handleChange = (e) => setState((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();

    let { email, password } = state;

    if (!isEmail(email)) return toastify('Please enter a valid email address', 'error');
    login(email, password);
  };

  return (
    <div id="auth-container" style={{ position: 'relative' }}>
      <div className="auth text-center border border-dark p-5 rounded-2" style={{ position: 'relative' }}>
        <Link style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '16px', color: "rgba(0,0,0,.5)" }} to='/'>
          <CloseOutlined />
        </Link>

        <Form layout="vertical">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Title level={2}>Login</Title>
            </Col>
            <Col span={24}>
              <Input type="email" placeholder="Enter Your Email" name="email" onChange={handleChange} />
            </Col>
            <Col span={24} className="text-end">
              <Input.Password placeholder="Enter Password" name="password" onChange={handleChange} />
              <Link to="/auth/forgot-password" style={{ textDecoration: 'none', color: 'black' }} className="small"       >
                Forgot-Password
              </Link>
            </Col>
            <Col span={24}>
              <Button type="primary" block htmlType="submit" style={{backgroundColor:"#a97e4d"}} loading={isProcessing} onClick={handleSubmit} > Login</Button>
            </Col>
            <Col span={24}>
              <p className="small text-center">
                Don't have an account? <Link to="/auth/register" style={{ color: 'black' }}>Register</Link>
              </p>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
}
