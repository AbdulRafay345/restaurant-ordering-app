import React, { useState } from 'react';
import { Button, Card, Table, Typography, List } from 'antd';
import { useCart } from '../../../contexts/CartContexts';
import { useMediaQuery } from 'react-responsive';
import { firestore } from '../../../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useAuthContext } from '../../../contexts/AuthContext';

const { Text } = Typography;
const { toastify } = window

export default function Order() {

  const { cart, updateCartItem } = useCart();
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuthContext()
  const isLargeScreen = useMediaQuery({ query: '(min-width: 768px)' });

  const handleIncrease = (item) => {
    updateCartItem(item.key, item.quantity + 1);
  };

  const handleDecrease = (item) => {
    if (item.quantity > 1) {
      updateCartItem(item.key, item.quantity - 1);
    }
  };

  const columns = [
    { title: 'Item', dataIndex: 'name', key: 'name' },
    { title: 'Price', dataIndex: 'price', key: 'price', render: (text) => `Rs. ${text}` },
    {
      title: 'Quantity',
      key: 'quantity',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button onClick={() => handleDecrease(record)}>-</Button>
          <span style={{ margin: '0 8px' }}>{record.quantity}</span>
          <Button onClick={() => handleIncrease(record)}>+</Button>
        </div>
      ),
    },
    { title: 'Total Amount', key: 'total', render: (_, record) => `Rs. ${record.price * record.quantity}` },
  ];

  const grandTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const confirmOrder = async () => {
    if (grandTotal === 0) return toastify("No Order is placed", "error");

    setIsLoading(true);

    try {
      const orderDocRef = doc(firestore, "orderPlaced", new Date().toISOString());
      const orderData = {
        name: user.name,
        items: cart.map(item => ({
          name: item.name,
          quantity: item.quantity
        })),
        total: grandTotal,
        customer: user.uid,
        address: user.address,
        status:"Pending",
        createdAt: new Date().toISOString(),
      };
      await setDoc(orderDocRef, orderData);
      toastify("Order confirmed", "success");
    } catch (error) {
      console.error(error.code);
      toastify("Something went wrong while confirming the order", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main>

      <div className='text-center p-5'>
        <h2>Your Order</h2>

        {cart.length === 0 ? (
          <p>No items in the cart</p>
        ) : (
          <>
            {isLargeScreen ? (
              <>
                <Card style={{ width: '90%', margin: '0 auto', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }}>
                  <Table columns={columns} dataSource={cart} pagination={false} rowKey="key" />
                </Card>
                <div style={{ marginTop: '16px', textAlign: 'right' }}>
                  <Text strong>Grand Total: Rs. {grandTotal}</Text>
                </div>
              </>
            ) : (
              <Card style={{ width: '90%', margin: '0 auto', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }}>
                <List
                  dataSource={cart}
                  renderItem={item => (
                    <List.Item key={item.key} className='text-start'>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <p><strong>Item:</strong> {item.name}</p>
                        <p>
                          <strong>Quantity:</strong>
                          <Button onClick={() => handleDecrease(item)} className='mx-1'>-</Button>
                          {item.quantity}
                          <Button onClick={() => handleIncrease(item)} className='mx-1'>+</Button>
                        </p>
                        <p><strong>Total:</strong> Rs. {item.price * item.quantity}</p>
                      </div>
                    </List.Item>
                  )}
                  footer={<div style={{ textAlign: 'right' }}><Text strong>Grand Total: Rs. {grandTotal}</Text></div>}
                />
              </Card>
            )}
            <Button type='primary' style={{ backgroundColor: "#a97e4d", marginTop: '16px' }} onClick={confirmOrder} loading={isLoading}>Confirm Order</Button>
          </>
        )}
      </div>
    </main>
  );
}
