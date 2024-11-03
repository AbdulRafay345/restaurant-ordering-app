import React, { useState, useEffect } from 'react';
import { Button, Card, Col, Form, Image, Input, Modal, Row, Space, Table } from 'antd';
import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';
import { firestore } from '../../../config/firebase';

const { toastify } = window
const initialState = { updatedName: "", updatedDescription: "", updatedCategory: "", updatedPrice: "" }

export default function Update() {
    const [state, setState] = useState(initialState)
    const [data, setData] = useState([]);
    const [currentTodo, setCurrentTodo] = useState(null)
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const showModal = (todo) => {
        setCurrentTodo(todo)
        setState({
            updatedName: todo.name,
            updatedDescription: todo.description,
            updatedCategory: todo.category,
            updatedPrice: todo.price
        })
        setIsModalOpen(true)
    }

    const showDeleteModal = (todo) => {
        setCurrentTodo(todo)
        setIsDeleteModalOpen(true)
    }

    const handleOk = () => {
        updateSubmit(currentTodo)
        setIsModalOpen(false)
    }

    const handleCancel = () => { setIsModalOpen(false) }
    const handleCancelDelete = () => { setIsDeleteModalOpen(false) }

    const handleChange = e => setState(s => ({ ...s, [e.target.name]: e.target.value }))

    const updateSubmit = async (menuItems) => {
        let { updatedName, updatedDescription, updatedCategory, updatedPrice } = state

        let formData = { name: updatedName, description: updatedDescription, category: updatedCategory, price: updatedPrice, dateUpdated: serverTimestamp() }

        try {
            const docRef = doc(firestore, "menuItems", menuItems.id);
            await setDoc(docRef, formData, { merge: true });
            setData(s => s.map(item => item.id === menuItems.id ? { ...item, ...formData } : item));
            toastify("Item updated successfully", "success");
        } catch (error) {
            console.error(error.code)
            toastify("Something went wrong while updating the menu item", "error")
        }
    }

    const handleDelete = async () => {
        try {
            await deleteDoc(doc(firestore, "menuItems", currentTodo.id));
            setData(s => s.filter(item => item.id !== currentTodo.id));
            toastify("Item deleted successfully", "success");
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.log(error.code)
            toastify("Something went wrong while deleting the item", "error")
        }
    }

    const columns = [
        { title: "#", dataIndex: "index", render: (_, __, index) => index + 1, },
        { title: 'Name', dataIndex: 'name', key: 'name', },
        { title: 'Description', dataIndex: 'description', key: 'description', },
        { title: 'Category', dataIndex: 'category', key: 'category', },
        { title: 'Price', dataIndex: 'price', key: 'price', },
        {
            title: 'Action', key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button type='primary' onClick={() => showModal(record)}>Update</Button>
                    <Button type='primary' onClick={() => showDeleteModal(record)} danger>Delete</Button>
                </Space>
            )
        },
    ];


    const getData = async () => {
        setIsLoading(true);
        try {
            const querySnapshot = await getDocs(collection(firestore, "menuItems"));
            const items = querySnapshot.docs.map(doc => ({ key: doc.id, ...doc.data(), }));
            setData(items);
        } catch (error) {
            console.error("Error fetching menu items: ", error);
            toastify("Something went wrong while fetching menu items", "error")
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getData()
    }, []);

    return (
        <>
            <div className='text-center p-5'>
                <h1>Update Menu</h1>
                <div className='d-flex justify-content-center align-items-center'>
                    <Card className="border rounded-2" style={{ overflowY: "auto", maxHeight: "80vh" }}>
                        <Table columns={columns} dataSource={data} loading={isLoading} pagination={false} />
                    </Card>
                </div>
            </div>

            {/* update Modal */}
            <Modal title="Update Todo" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}
                footer={[
                    <Button onClick={handleCancel}>Cancel</Button>,
                    <Button type='primary' htmlType='submit' onClick={handleOk}>Update</Button>
                ]}
            >
                <Form layout='vertical'>
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Input type='text' placeholder='Name' name='updatedName' value={state.updatedName} onChange={handleChange} />
                        </Col>
                        <Col span={24}>
                            <Input.TextArea rows={5} placeholder='Description' name='updatedDescription' value={state.updatedDescription} style={{ resize: "none" }} onChange={handleChange} />
                        </Col>
                        <Col span={24}>
                            <Input type='text' placeholder='Category' name='updatedCategory' value={state.updatedCategory} onChange={handleChange} />
                        </Col>
                        <Col span={24}>
                            <Input type='number' placeholder='Price' name='updatedPrice' value={state.updatedPrice} onChange={handleChange} />
                        </Col>
                    </Row>
                </Form>
            </Modal>

            {/* Delete Modal */}
            <Modal title="Delete Confirmation" open={isDeleteModalOpen} onCancel={handleCancelDelete}
                footer={[
                    <Button key="cancel" onClick={handleCancelDelete}>Cancel</Button>,
                    <Button key="delete" type='primary' danger onClick={handleDelete} >Delete</Button>
                ]}
            >
                <p>Are you sure you want to delete this item?</p>
            </Modal>

        </>
    );
}
