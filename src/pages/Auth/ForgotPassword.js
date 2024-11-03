import React, { useState } from 'react'
import { Form, Input, Row, Col, Button, Typography } from 'antd'
import { auth } from '../../config/firebase'
import { sendPasswordResetEmail } from 'firebase/auth'
import { Link, useNavigate } from 'react-router-dom'
import { CloseOutlined, LeftOutlined } from '@ant-design/icons'

const { Title } = Typography
const { toastify, isEmail } = window
const initialState = { email: "" }

export default function ForogtPassword() {

  const [state, setState] = useState(initialState)
  const [isLoading, setIsloading] = useState(false)
  const navigate = useNavigate()

  const handleChange = e => setState(s => ({ ...s, [e.target.name]: e.target.value }))

  const handleSubmit = e => {
    e.preventDefault()

    let { email } = state

    if (!isEmail(email)) return toastify("Please enter a valid email address", "error")

    setIsloading(true)
    sendPasswordResetEmail(auth, email)
      .then(() => {
        toastify("Password reset email has been sent", "success")
        navigate('/auth')
      })
      .catch((error) => {
        console.error(error.code)
        if (error.code) {
          toastify("Something went wrong while adding the new user", "error");
        }
      })
      .finally(() => {
        setIsloading(false)
      })

  }

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
              <Title level={2}>Forgot Password</Title>
            </Col>
            <Col span={24}>
              <Input type='email' placeholder='Enter Your Email' name='email' onChange={handleChange} />
            </Col>
            <Col span={24}>
              <Button type='primary' block htmlType='submit' style={{backgroundColor:"#a97e4d"}} loading={isLoading} onClick={handleSubmit}>Submit</Button>
            </Col>
            <Col span={24}>
              <p className='small text-center'>Don't have an account? <Link to='/auth/register' style={{ color: "black" }}>Register</Link></p>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  )
}
