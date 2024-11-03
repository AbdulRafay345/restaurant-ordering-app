import React, { useState } from 'react'
import { Col, Form, Input, Row, Button, Typography, Upload } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { doc, setDoc } from 'firebase/firestore'
import { firestore, storage } from '../../../config/firebase'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'

const { Title } = Typography
const { toastify } = window
const initialState = { name: "", description: "", category: "", price: "" }

export default function AddItem() {
    const [state, setState] = useState(initialState)
    const [isLoading, setIsLoading] = useState(false)
    const [file, setFile] = useState(null)

    const handleChange = e => setState(s => ({ ...s, [e.target.name]: e.target.value }))

    const handleFileChange = e => {
        setFile(e.file)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        let { name, description, category, price } = state

        if (name.length < 3) return toastify("Please enter a proper item name", "error")
        if (!category) return toastify("Please enter the category of item", "error")
        if (!price) return toastify("Please enter the price of the item", "error")

        const id = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
        let imageUrl = ""

        if (file) {
            const storageRef = ref(storage, `images/${id}-${file.name}`)
            setIsLoading(true)
            try {
                const snapshot = await uploadBytes(storageRef, file)
                imageUrl = await getDownloadURL(snapshot.ref)
            } catch (error) {
                console.error("Image upload error:", error)
                toastify("Failed to upload image", "error")
            }
        }

        const formData = { name, description, category, price, id, imageUrl }
        setIsLoading(true)
        try {
            await setDoc(doc(firestore, "menuItems", id), formData);
            toastify("Item added successfully", "success")
            setState(initialState)
            setFile(null)
        } catch (error) {
            console.error(error.code)
            toastify("Something went wrong while adding menu item", "error")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <div className='d-flex justify-content-center align-items-center w-100 min-vh-100'>
                <Form layout='vertical' className='border border-2 p-5 bg-white' style={{ maxWidth: '700px', width: '100%' }}>
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Title level={2} style={{ textAlign: 'center' }}>Add Item In Menu</Title>
                        </Col>
                        <Col span={24}>
                            <Input type='text' placeholder='Name' name='name' onChange={handleChange} />
                        </Col>
                        <Col span={24}>
                            <Input.TextArea rows={5} placeholder='Description' name='description' style={{ resize: "none" }} onChange={handleChange} />
                        </Col>
                        <Col span={24}>
                            <Input type='text' placeholder='Category' name='category' onChange={handleChange} />
                        </Col>
                        <Col span={24}>
                            <Input type='number' placeholder='Price' name='price' onChange={handleChange} />
                        </Col>
                        <Col span={24}>
                            <Upload
                                beforeUpload={() => false}
                                onChange={handleFileChange}
                                showUploadList={{ showPreviewIcon: false }}
                            >
                                <Button icon={<UploadOutlined />} >Click to Upload Image</Button>
                            </Upload>
                        </Col>
                        <Col span={24}>
                            <Button type='primary' block htmlType='submit' loading={isLoading} onClick={handleSubmit}>Add</Button>
                        </Col>
                    </Row>
                </Form>
            </div>
        </>
    )
}
