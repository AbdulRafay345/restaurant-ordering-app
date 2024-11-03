import React, { useState, useEffect } from 'react';
import { Card, Col, Image, Row, Typography, Spin } from 'antd';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../../config/firebase';

const { toastify } = window;
const { Paragraph } = Typography;

export default function Home({ searchQuery = '' }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const getData = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, "menuItems"));
      const items = querySnapshot.docs.map(doc => ({ key: doc.id, ...doc.data() }));
      setData(items);
    } catch (error) {
      console.error("Error fetching menu items: ", error);
      toastify("Something went wrong while fetching menu items", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

 
  const filteredData = data.filter(item => {
    const query = searchQuery.toLowerCase();
    return (
      (item.name && typeof item.name === 'string' && item.name.toLowerCase().includes(query)) ||
      (item.category && typeof item.category === 'string' && item.category.toLowerCase().includes(query))
    );
  });

  return (
    <main>
      <Spin spinning={loading} size='large'>
        <div className='text-center p-5'>
          <h1>Menu</h1>
          <Row gutter={[16, 16]} className='justify-content-center'>
            {filteredData.map((item) => (
              <Col key={item.key} xs={24} sm={12} md={8}>
                <Card className='text-start' bordered={true} style={{ maxWidth: "350px", maxHeight: "280px" }}
                  title={
                    <div className='d-flex justify-content-between align-items-center'>
                      {item.name}
                    </div>
                  }
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className='text-danger'>Rs. {item.price}</p>
                      <Paragraph ellipsis={{ rows: 4 }}>{item.description}</Paragraph>
                    </div>
                    <Image src={item.imageUrl} alt={item.name} preview={false} style={{ width: '150px', height: '150px', objectFit: 'cover', marginLeft: '16px' }} />
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Spin>
    </main>
  );
}