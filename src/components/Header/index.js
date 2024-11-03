import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { Modal } from 'antd';

export default function Header({ searchQuery, onSearchChange }) {
    const { state, logout } = useAuthContext();
    const [isModalVisible, setIsModalVisible] = useState(false);

    const showLogoutModal = () => {
        setIsModalVisible(true);
    };

    const handleLogout = () => {
        logout();
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    return (
        <nav className="navbar navbar-expand-lg" style={{ background: "#a97e4d" }}>
            <div className="container-fluid d-flex justify-content-between align-items-center">
                <Link className="navbar-brand text-white py-0" to='/'>
                    <img src='./images/logo.png' alt='Logo' style={{ width: "100px", height: "100px" }} />
                </Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation" >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link className="nav-link text-white" aria-current="page" to='/menu'>Menu</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link text-white" aria-current="page" to='/order'>Cart</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link text-white" aria-current="page" to='/recent'>Recent Orders</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link text-white" aria-current="page" to='/favorites'>Favorites</Link>
                        </li>
                    </ul>
                    <div className="d-flex ms-auto align-items-center">
                        <form className="d-flex" role="search">
                            <input className="form-control me-2" type="search" placeholder="Search by name/cate..." aria-label="Search" value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} />
                        </form>
                    </div>
                </div>
            </div>
            <div className='p-2'>
                {state.isAuthenticated ? (
                    <React.Fragment>
                        <button className="btn btn-outline-secondary ms-3" type="button" data-bs-toggle="dropdown" aria-expanded="false" style={{ padding: 0, border: 'none', background: 'transparent' }}>
                            <img src='./images/favicon.png' alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                            <li><Link className="dropdown-item" to='/profile'>Profile</Link></li>
                            <li>
                                <button className="dropdown-item" onClick={showLogoutModal}>Logout</button>
                            </li>
                        </ul>

                    </React.Fragment>
                ) : (
                    <Link className="btn btn-outline-light" to="/auth">
                        Login
                    </Link>
                )}
            </div>

            {/* Logout Confirmation Modal */}
            <Modal title="Confirm Logout" open={isModalVisible} onOk={handleLogout} onCancel={handleCancel} okText="Logout" cancelText="Cancel" okButtonProps={{ danger: true }}            >
                <p>Are you sure you want to log out?</p>
            </Modal>
        </nav>
    );
}
