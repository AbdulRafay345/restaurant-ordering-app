import React, { useEffect, useState } from 'react';
import { Card, Table, Typography } from 'antd';
import { getDocs, collection, query, orderBy } from "firebase/firestore";
import { firestore } from '../../../config/firebase';

const { Title } = Typography;

export default function Users() {
    const [dataSource, setDataSource] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        const usersQuery = query(collection(firestore, "users"), orderBy("fullName", "asc"));
        const querySnapshot = await getDocs(usersQuery);
        const data = querySnapshot.docs.map(doc => ({
            key: doc.id,
            name: doc.data().fullName,
            email: doc.data().email,
            uid: doc.data().uid,
            role: doc.data().role
        }));
        setDataSource(data);
        setIsLoading(false);
    };
    useEffect(() => {
        fetchData();
    }, []);

    const columns = [
        { title: "#", dataIndex: "index", render: (_, __, c) => c + 1 },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Uid', dataIndex: 'uid', key: 'uid' },
        { title: 'Role', dataIndex: 'role', key: 'role' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100vh', padding: '20px' }}>
            <Title>Users</Title>
            <Card style={{ width: '90%', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', overflowY: 'auto', maxHeight: '80vh' }}>
                <Table columns={columns} dataSource={dataSource} pagination={false} loading={isLoading} />
            </Card>
        </div>
    );
}
