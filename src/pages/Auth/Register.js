import React, { useState } from 'react';
import { Form, Input, Row, Col, Button, Typography } from 'antd';
import { auth, firestore } from '../../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { CloseOutlined, LeftOutlined } from '@ant-design/icons';
import { useAuthContext } from '../../contexts/AuthContext';

const { Title } = Typography;
const { toastify, isEmail } = window;

const initialState = { fullName: "", email: "", password: "", confirmPassword: "", address: "" };

export default function Register() {
  const [state, setState] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useAuthContext();

  const handleChange = (e) => setState((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();

    let { fullName, email, password, confirmPassword, address } = state;

    if (fullName.length < 3) return toastify("Please enter your full name", "error");
    if (!isEmail(email)) return toastify("Please enter a valid email address", "error");
    if (!address) return toastify("Please add your address", "error");
    if (password.length < 6) return toastify("Password must be at least 6 characters", "error");
    if (confirmPassword !== password) return toastify("Passwords don't match", "error");

    setIsLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        let formData = { fullName, email, uid: user.uid, address, role: "customer" };

        await setDoc(doc(firestore, "users", user.uid), formData);
        dispatch({
          type: "SET_LOGGED_IN",
          payload: { user: { email: user.email, uid: user.uid, address } }
        });

        toastify("User registered successfully", "success");
      })
      .catch((error) => {
        console.error(error.code);
        switch (error.code) {
          case "auth/email-already-in-use":
            toastify("Email already registered", "error");
            break;
          default:
            toastify("Something went wrong while adding the new user", "error");
            break;
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div id="auth-container" style={{ position: 'relative' }}>
      <div className="auth text-center border border-dark p-5 rounded-2" style={{ position: 'relative' }}>
        <Link style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '16px', color: 'rgba(0, 0, 0, .5)' }} to='/auth'>
          <LeftOutlined />
        </Link>
        <Link style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '16px', color: "rgba(0,0,0,.5)" }} to='/'>
          <CloseOutlined />
        </Link>
        <Form layout='vertical'>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Title level={2}>Register</Title>
            </Col>
            <Col span={24}>
              <Input type='text' placeholder='Enter Your Full Name' name='fullName' onChange={handleChange} />
            </Col>
            <Col span={24}>
              <Input type='email' placeholder='Enter Your Email' name='email' onChange={handleChange} />
            </Col>
            <Col span={24}>
              <Input.TextArea rows={2} style={{ resize: "none" }} placeholder='Enter Your current Address' name='address' onChange={handleChange} />
            </Col>
            <Col span={24}>
              <Input.Password placeholder='Enter Password' name='password' onChange={handleChange} />
            </Col>
            <Col span={24}>
              <Input.Password placeholder='Confirm Password' name='confirmPassword' onChange={handleChange} />
            </Col>
            <Col span={24}>
              <Button type='primary' block htmlType='submit' style={{backgroundColor:"#a97e4d"}} loading={isLoading} onClick={handleSubmit}>Register</Button>
            </Col>
            <Col span={24}>
              <p className='small text-center'>Already have an account? <Link to='/auth' style={{ color: "black" }}>Login</Link></p>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
}
