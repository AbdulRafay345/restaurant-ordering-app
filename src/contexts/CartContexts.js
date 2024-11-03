import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

const { toastify } = window;

export default function CartProvider({ children }) {
    const [cart, setCart] = useState([]);

    const addToCart = (item) => {
        setCart(s => {
            const itemInCart = s.find(cartItem => cartItem.key === item.key);
            if (itemInCart) {
                return s.map(cartItem => 
                    cartItem.key === item.key 
                        ? { ...cartItem, quantity: cartItem.quantity + 1 } 
                        : cartItem
                );
            } else {
                return [...s, { ...item, quantity: 1 }];
            }
        });
        toastify("Item added to cart", "success");
    };

    const updateCartItem = (key, quantity) => {
        setCart(s => {
            if (quantity <= 0) {
                // Remove item from cart if quantity is 0 or less
                return s.filter(item => item.key !== key);
            } else {
                // Update item quantity
                return s.map(item => item.key === key ? { ...item, quantity } : item);
            }
        });
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, updateCartItem }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
