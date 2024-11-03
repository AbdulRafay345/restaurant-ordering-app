import React, { useState, useEffect } from 'react';
import { Button, Card, Col, Image, Row, Typography, Spin } from 'antd';
import { collection, deleteDoc, doc, getDocs, query, where, setDoc } from 'firebase/firestore';
import { firestore } from '../../../config/firebase';
import { useCart } from '../../../contexts/CartContexts';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../../contexts/AuthContext';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';

const { toastify } = window;
const { Paragraph } = Typography;

export default function Favorites({ searchQuery = '' }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart, updateCartItem } = useCart();
    const { state, user } = useAuthContext();
    const [quantities, setQuantities] = useState({});
    const [showControls, setShowControls] = useState({});
    const [favorites, setFavorites] = useState(new Set());

    const getData = async () => {
        if (!state.isAuthenticated || !user?.uid) return; // Avoid fetching if not authenticated
        try {
            const querySnapshot = await getDocs(collection(firestore, "favorites"));
            const items = querySnapshot.docs
                .map(doc => ({ key: doc.id, ...doc.data() }))
                .filter(item => item.user_id === user.uid); // Filter by user ID
            setData(items);
        } catch (error) {
            console.error("Error fetching menu items: ", error);
            toastify("Something went wrong while fetching menu items", "error");
        } finally {
            setLoading(false);
        }
    };

    const getFavorites = async () => {
        if (state.isAuthenticated && user?.uid) {
            try {
                const favoritesQuery = query(
                    collection(firestore, "favorites"),
                    where("user_id", "==", user.uid)
                );
                const querySnapshot = await getDocs(favoritesQuery);
                const favoriteItems = querySnapshot.docs.map(doc => doc.id);
                const favoritesSet = new Set(favoriteItems);
                setFavorites(favoritesSet);
            } catch (error) {
                console.error("Error fetching favorites: ", error);
                toastify("Something went wrong while fetching favorites", "error");
            }
        }
    };

    useEffect(() => {
        getData();
        getFavorites();
    }, [state.isAuthenticated, user?.uid]);

    const handleAddToCart = (item) => {
        if (state.isAuthenticated) {
            addToCart(item);
            setQuantities(prev => ({
                ...prev,
                [item.key]: (prev[item.key] || 0) + 1
            }));
            setShowControls(prev => ({ ...prev, [item.key]: true }));
        } else {
            toastify("Please login to add items", "warning");
        }
    };

    const handleRemoveFromCart = (item) => {
        const currentQuantity = quantities[item.key] || 0;
        if (currentQuantity > 0) {
            const newQuantity = currentQuantity - 1;
            setQuantities(prev => ({
                ...prev,
                [item.key]: newQuantity
            }));
            updateCartItem(item.key, newQuantity);

            if (newQuantity === 0) {
                setShowControls(prev => ({ ...prev, [item.key]: false }));
            }
        }
    };

    const handleToggleFavorite = async (item) => {
        const isFavorited = favorites.has(item.key);
        const updatedFavorites = new Set(favorites);

        if (isFavorited) {
            updatedFavorites.delete(item.key);
            toastify("Item removed from favorites", "success");

            try {
                const fvrtDocRef = doc(firestore, "favorites", item.key);
                await deleteDoc(fvrtDocRef);
            } catch (error) {
                console.error("Error removing favorite: ", error);
                toastify("Something went wrong while removing from favorites", "error");
            }
        } else {
            updatedFavorites.add(item.key);
            toastify("Item added to favorites", "success");

            try {
                const fvrtDocRef = doc(firestore, "favorites", item.key);
                await setDoc(fvrtDocRef, { name: item.name, price: item.price, description: item.description, imageUrl: item.imageUrl, user_id: user.uid }, { merge: true });
            } catch (error) {
                console.error("Error adding favorite: ", error);
                toastify("Something went wrong while adding to favorites", "error");
            }
        }

        setFavorites(updatedFavorites);
    };

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
                    <div className='text-end'>
                        <Link className='btn btn-light m-3' to='/order'>Check Cart</Link>
                    </div>
                    <Row gutter={[16, 16]} className='justify-content-center'>
                        {filteredData.map((item) => (
                            <Col key={item.key} xs={24} sm={12} md={8}>
                                <Card className='text-start' bordered={true} style={{ maxWidth: "350px", maxHeight: "280px" }}
                                    title={
                                        <div className='d-flex justify-content-between align-items-center'>
                                            {item.name}
                                            <span className='d-flex align-items-center'>
                                                {showControls[item.key] && (
                                                    <div className="d-flex align-items-center">
                                                        <Button onClick={() => handleRemoveFromCart(item)} disabled={!quantities[item.key]}>-</Button>
                                                        <span className="mx-2">{quantities[item.key] || 0}</span>
                                                    </div>
                                                )}
                                                <div className="d-flex align-items-center">
                                                    <Button onClick={() => handleAddToCart(item)}>+</Button>
                                                    <Button type="text" onClick={() => handleToggleFavorite(item)} icon={favorites.has(item.key) ? <HeartFilled style={{ color: 'red' }} /> : <HeartOutlined />} />
                                                </div>
                                            </span>
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
