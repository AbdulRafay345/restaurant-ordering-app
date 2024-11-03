import React, { useState } from 'react'
import { useAuthContext } from '../../../contexts/AuthContext'
import { Button, Modal, Form, Input } from 'antd'

export default function Profile() {
  const { user, updateUser } = useAuthContext()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()

  const showModal = () => {
    form.setFieldsValue({
      name: user?.name,
      email: user?.email,
      address: user?.address,
    })
    setIsModalVisible(true)
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      await updateUser(values)
      setIsModalVisible(false)
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  const handleCancel = () => {
    setIsModalVisible(false)
  }

  return (
    <main className='d-flex justify-content-center align-items-center'>
      <div>
        <div style={{ display: 'flex', flexDirection: 'column', width: '300px', border: '1px solid #ddd', padding: '16px', borderRadius: "10px" }}>
          <h2 className='text-center'>Profile</h2>
          <hr className='text-white' />
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: 'bold' }}>Name:</div>
            <div>{user?.name}</div>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: 'bold' }}>Email:</div>
            <div>{user?.email}</div>
          </div>
          <div>
            <div style={{ fontWeight: 'bold' }}>Address:</div>
            <div>{user?.address}</div>
          </div>
          <div className='pt-1'>
            <Button type='default' block style={{ color: "#d4a373" }} onClick={showModal}>Update</Button>
          </div>
        </div>
      </div>


      {/* update modal */}
      <Modal title="Update Profile" open={isModalVisible} onOk={handleOk} onCancel={handleCancel} okText="Save" cancelText="Cancel">
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please input your name!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Please input a valid email!' }]} >
            <Input disabled />
          </Form.Item>
          <Form.Item name="address" label="Address" rules={[{ required: true, message: 'Please input your address!' }]} >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </main>
  )
}
