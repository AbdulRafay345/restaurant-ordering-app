import React from 'react';
import { PlusOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom';


export default function Home() {
    return (
        <>
            <div className="container container-home">
                <div className="image-container">
                    <img src="./images/baker.png" alt="Placeholder" />
                </div>
                <div className="text-container">
                    <h1>Nova Bloom</h1>
                    <p>
                        Discover the flavors of "Nova Bloom", now available online for your convenience! Our virtual kitchen brings the essence of our renowned dishes directly to your doorstep, offering a wide array of freshly prepared meals crafted with the finest ingredients. From comfort classics to chef's specials, each dish is designed to deliver restaurant-quality taste and experience at home. With easy online ordering and prompt delivery, "Nova Bloom" ensures that delicious, high-quality food is just a click away.
                    </p>
                </div>
            </div>

            <div className="services-container">
                <h3 className="services-heading">Our Services And Benefits</h3>
                <div className="services-grid">
                    <div className="service-card">
                        <img src="./images/pizza.jpg" alt="Pastries" className="service-image" />
                        <p className="service-caption">Satisfy your cravings with our range of burgers, fries,etc</p>
                    </div>
                    <div className="service-card">
                        <img src="./images/cake.jpg" alt="Cake" className="service-image" />
                        <p className="service-caption">Savor Our Freshly Baked, Delightful Cakes</p>
                    </div>
                    <div className="service-card">
                        <img src="./images/drink.jpg" alt="Drinks" className="service-image" />
                        <p className="service-caption">Enjoy a Selection of Hot and Refreshing Beverages</p>
                    </div>
                </div>
            </div>
            <Link className='fixed-button btn btn-light' to='/menu'>Order Now <PlusOutlined /></Link>
        </>
    );
};