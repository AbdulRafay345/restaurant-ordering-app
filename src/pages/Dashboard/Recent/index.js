import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Select } from 'antd';
import { collection, getDocs, orderBy, query, updateDoc, doc } from 'firebase/firestore';
import { firestore } from '../../../config/firebase';
import { useAuthContext } from '../../../contexts/AuthContext';

const { toastify } = window;
const { Title } = Typography;
const { Option } = Select;

export default function Recent() {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuthContext();

    const getData = async () => {
        setIsLoading(true);
        try {
            const q = query(collection(firestore, "orderPlaced"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const items = querySnapshot.docs.map(doc => {
                const { name, items, total, createdAt, address, status } = doc.data();
                return {
                    key: doc.id, items, total, createdAt, address, name, status,
                    itemsDetails: items.map(item => ({
                        name: item.name,
                        quantity: item.quantity,
                    })),
                };
            });
            setData(items);
        } catch (error) {
            console.error("Error fetching order data: ", error);
            toastify("Something went wrong while fetching orders", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            getData();
        }
    }, [user]);

    // Function to handle status change
    const handleStatusChange = async (key, newStatus) => {
        const orderRef = doc(firestore, "orderPlaced", key);
        try {
            await updateDoc(orderRef, { status: newStatus });
            setData(prevData => prevData.map(item => item.key === key ? { ...item, status: newStatus } : item));
            toastify(`Status updated to "${newStatus}"`, "success");
        } catch (error) {
            console.error("Error updating order status: ", error);
            toastify("Failed to update status", "error");
        }
    };

    const columns = [
        { title: 'Order Date and time', dataIndex: 'createdAt', key: 'createdAt', render: (text) => new Date(text).toLocaleString(), },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        {
            title: 'Items', key: 'itemsDetails',
            render: (_, record) => (
                <ul>
                    {record.itemsDetails.map((item, index) => (
                        <li key={index}>
                            {item.name} - Quantity: {item.quantity}
                        </li>
                    ))}
                </ul>
            ),
        },
        { title: 'Address', dataIndex: 'address', key: 'address' },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (text, record) => (
                <Select defaultValue={text} style={{ width: 120 }} onChange={(value) => handleStatusChange(record.key, value)}>
                    <Option value="Preparing">Preparing</Option>
                    <Option value="Ready to Deliver">Ready to Deliver</Option>
                    <Option value="Delivered">Delivered</Option>
                </Select>
            ),
        },
        { title: 'Total', dataIndex: 'total', key: 'total', render: (text) => `Rs. ${text}`, },
    ];

    return (
        <div className='d-flex flex-column justify-content-center align-items-center px-1 py-3'>
            <Title className='text-center p-4'>Recent Orders</Title>
            <Card style={{ width: '95%', maxWidth: '1200px', margin: '0 auto', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', overflowX: 'auto' }}>
                <Table dataSource={data} columns={columns} pagination={false} rowKey="key" loading={isLoading} rowClassName={() => "custom-row"} scroll={{ x: true }} />
            </Card>
        </div>
    );
}
