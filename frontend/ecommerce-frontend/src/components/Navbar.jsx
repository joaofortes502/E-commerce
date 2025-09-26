import React, { useState, useEffect } from 'react';

const Navbar = () => {
    // Estados do componente
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [cartItemCount, setCartItemCount] = useState(0);

    // Simulação dos contextos - você substituirá pelas importações reais
    const { user, isAuthenticated, isAdmin, logout } = {
        user: null, // { name: 'João Silva', email: 'joao@test.com', type: 'client' }
        isAuthenticated: () => false,
        isAdmin: () => false,
        logout: () => console.log('Logout simulado')
    };

    const { summary, loadCart } = {
        summary: { item_count: 0, total_quantity: 0, subtotal: '0.00' },
        loadCart: async () => {}
    };

    // Carrega dados do carrinho ao montar o componente
    useEffect(() => {
        loadCart();
    }, []);

    // Atualiza contador do carrinho baseado no summary
    useEffect(() => {
        setCartItemCount(summary.item_count || 0);
    }, [summary.item_count]);

    // Alterna o menu mobile
    const toggleMenu = () => {
        setIsMenuOpen(prev => !prev);
        // Fecha dropdown do perfil se estiver aberto
        if (isProfileDropdownOpen) {
            setIsProfileDropdownOpen(false);
        }
    };

    // Alterna dropdown do perfil
    const toggleProfileDropdown = () => {
        setIsProfileDropdownOpen(prev => !prev);
    };

    // Fecha dropdowns ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.profile-dropdown') && !event.target.closest('.profile-button')) {
                setIsProfileDropdownOpen(false);
            }
            if (!event.target.closest('.mobile-menu') && !event.target.closest('.menu-toggle')) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Handle do logout
    const handleLogout = () => {
        logout();
        setIsProfileDropdownOpen(false);
        setIsMenuOpen(false);
    };

    // Fecha menu ao navegar (para mobile)
    const closeMenu = () => {
        setIsMenuOpen(false);
        setIsProfileDropdownOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo/Brand */}
                <div className="navbar-brand">
                    <a href="/" className="brand-link" onClick={closeMenu}>
                        <span className="brand-icon">🛍️</span>
                        <span className="brand-text">E-commerce</span>
                    </a>
                </div>

                {/* Menu Desktop */}
                <div className="navbar-menu desktop-menu">
                    <div className="navbar-nav">
                        <a href="/" className="nav-link">
                            🏠 Início
                        </a>
                        <a href="/products" className="nav-link">
                            📦 Produtos
                        </a>
                        {isAuthenticated() && (
                            <a href="/orders" className="nav-link">
                                📋 Meus Pedidos
                            </a>
                        )}
                        {isAdmin() && (
                            <a href="/admin" className="nav-link admin-link">
                                ⚙️ Administração
                            </a>
                        )}
                    </div>

                    <div className="navbar-actions">
                        {/* Carrinho */}
                        <a href="/cart" className="cart-link">
                            <span className="cart-icon">🛒</span>
                            {cartItemCount > 0 && (
                                <span className="cart-badge">{cartItemCount}</span>
                            )}
                            <span className="cart-text">Carrinho</span>
                        </a>

                        {/* Usuário logado */}
                        {isAuthenticated() ? (
                            <div className="profile-section">
                                <button 
                                    className="profile-button"
                                    onClick={toggleProfileDropdown}
                                >
                                    <span className="profile-icon">👤</span>
                                    <span className="profile-name">
                                        {user?.name?.split(' ')[0] || 'Usuário'}
                                    </span>
                                    <span className="dropdown-arrow">
                                        {isProfileDropdownOpen ? '▲' : '▼'}
                                    </span>
                                </button>

                                {/* Dropdown do perfil */}
                                {isProfileDropdownOpen && (
                                    <div className="profile-dropdown">
                                        <div className="dropdown-header">
                                            <div className="user-info">
                                                <strong>{user?.name}</strong>
                                                <small>{user?.email}</small>
                                                <span className={`user-badge ${user?.type}`}>
                                                    {user?.type === 'admin' ? '👑 Admin' : '👤 Cliente'}
                                                </span>
                                            </div>
                                        </div>
                                        <hr className="dropdown-divider" />
                                        <div className="dropdown-body">
                                            <a href="/profile" className="dropdown-link">
                                                ⚙️ Meu Perfil
                                            </a>
                                            <a href="/orders" className="dropdown-link">
                                                📋 Meus Pedidos
                                            </a>
                                            {isAdmin() && (
                                                <a href="/admin" className="dropdown-link">
                                                    👑 Painel Admin
                                                </a>
                                            )}
                                        </div>
                                        <hr className="dropdown-divider" />
                                        <div className="dropdown-footer">
                                            <button 
                                                onClick={handleLogout} 
                                                className="logout-button"
                                            >
                                                🚪 Sair
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Usuário não logado */
                            <div className="auth-links">
                                <a href="/login" className="nav-link login-link">
                                    🔐 Entrar
                                </a>
                                <a href="/register" className="nav-link register-button">
                                    ✨ Criar Conta
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Toggle do menu mobile */}
                <button className="menu-toggle" onClick={toggleMenu}>
                    <span className="menu-icon">
                        {isMenuOpen ? '✕' : '☰'}
                    </span>
                </button>
            </div>

            {/* Menu Mobile */}
            {isMenuOpen && (
                <div className="mobile-menu">
                    <div className="mobile-nav">
                        <a href="#/" className="mobile-link" onClick={closeMenu}>
                            🏠 Início
                        </a>
                        <a href="#/products" className="mobile-link" onClick={closeMenu}>
                            📦 Produtos
                        </a>
                        <a href="#/cart" className="mobile-link" onClick={closeMenu}>
                            🛒 Carrinho
                            {cartItemCount > 0 && (
                                <span className="mobile-cart-badge">{cartItemCount}</span>
                            )}
                        </a>
                        
                        {isAuthenticated() ? (
                            <>
                                <hr className="mobile-divider" />
                                <div className="mobile-user-info">
                                    <strong>{user?.name}</strong>
                                    <small>{user?.email}</small>
                                </div>
                                <a href="#/profile" className="mobile-link" onClick={closeMenu}>
                                    ⚙️ Meu Perfil
                                </a>
                                <a href="#/orders" className="mobile-link" onClick={closeMenu}>
                                    📋 Meus Pedidos
                                </a>
                                {isAdmin() && (
                                    <a href="#/admin" className="mobile-link admin-link" onClick={closeMenu}>
                                        👑 Administração
                                    </a>
                                )}
                                <hr className="mobile-divider" />
                                <button 
                                    onClick={handleLogout} 
                                    className="mobile-logout"
                                >
                                    🚪 Sair
                                </button>
                            </>
                        ) : (
                            <>
                                <hr className="mobile-divider" />
                                <a href="/login" className="mobile-link" onClick={closeMenu}>
                                    🔐 Fazer Login
                                </a>
                                <a href="/register" className="mobile-link register-style" onClick={closeMenu}>
                                    ✨ Criar Conta
                                </a>
                            </>
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
                .navbar {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                }

                .navbar-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    height: 70px;
                }

                /* Brand/Logo */
                .navbar-brand {
                    flex-shrink: 0;
                }

                .brand-link {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: white;
                    text-decoration: none;
                    font-size: 1.5rem;
                    font-weight: 700;
                    transition: transform 0.2s;
                }

                .brand-link:hover {
                    transform: scale(1.05);
                    color: white;
                }

                .brand-icon {
                    font-size: 2rem;
                }

                /* Menu Desktop */
                .desktop-menu {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                    flex: 1;
                    justify-content: space-between;
                    margin-left: 2rem;
                }

                .navbar-nav {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .nav-link {
                    color: white;
                    text-decoration: none;
                    padding: 0.5rem 1rem;
                    border-radius: 25px;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    white-space: nowrap;
                }

                .nav-link:hover {
                    background-color: rgba(255, 255, 255, 0.15);
                    color: white;
                    transform: translateY(-1px);
                }

                .nav-link.admin-link {
                    background-color: rgba(255, 215, 0, 0.2);
                    color: #ffd700;
                }

                .nav-link.admin-link:hover {
                    background-color: rgba(255, 215, 0, 0.3);
                    color: #ffd700;
                }

                /* Ações da navbar */
                .navbar-actions {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                /* Carrinho */
                .cart-link {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: white;
                    text-decoration: none;
                    padding: 0.5rem 1rem;
                    border-radius: 25px;
                    background-color: rgba(255, 255, 255, 0.1);
                    transition: all 0.3s ease;
                    position: relative;
                }

                .cart-link:hover {
                    background-color: rgba(255, 255, 255, 0.2);
                    color: white;
                    transform: translateY(-1px);
                }

                .cart-icon {
                    font-size: 1.3rem;
                }

                .cart-badge {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background-color: #ff4757;
                    color: white;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    font-size: 0.8rem;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: pulse 2s infinite;
                }

                /* Seção do perfil */
                .profile-section {
                    position: relative;
                }

                .profile-button {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: rgba(255, 255, 255, 0.15);
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }

                .profile-button:hover {
                    background: rgba(255, 255, 255, 0.25);
                    transform: translateY(-1px);
                }

                .profile-icon {
                    font-size: 1.2rem;
                }

                .dropdown-arrow {
                    font-size: 0.8rem;
                    transition: transform 0.3s ease;
                }

                /* Dropdown do perfil */
                .profile-dropdown {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                    min-width: 250px;
                    margin-top: 0.5rem;
                    animation: slideDown 0.3s ease-out;
                    border: 1px solid rgba(0, 0, 0, 0.1);
                }

                .dropdown-header {
                    padding: 1rem;
                }

                .user-info strong {
                    display: block;
                    color: #333;
                    font-size: 1rem;
                    margin-bottom: 0.25rem;
                }

                .user-info small {
                    display: block;
                    color: #666;
                    font-size: 0.85rem;
                    margin-bottom: 0.5rem;
                }

                .user-badge {
                    display: inline-block;
                    padding: 0.25rem 0.5rem;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .user-badge.admin {
                    background-color: #fff3cd;
                    color: #856404;
                }

                .user-badge.client {
                    background-color: #d1ecf1;
                    color: #0c5460;
                }

                .dropdown-divider {
                    margin: 0;
                    border: none;
                    height: 1px;
                    background-color: #e9ecef;
                }

                .dropdown-body {
                    padding: 0.5rem 0;
                }

                .dropdown-link {
                    display: block;
                    padding: 0.75rem 1rem;
                    color: #333;
                    text-decoration: none;
                    transition: background-color 0.2s;
                }

                .dropdown-link:hover {
                    background-color: #f8f9fa;
                    color: #333;
                }

                .dropdown-footer {
                    padding: 0.5rem;
                }

                .logout-button {
                    width: 100%;
                    padding: 0.75rem;
                    background-color: #dc3545;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }

                .logout-button:hover {
                    background-color: #c82333;
                }

                /* Links de autenticação */
                .auth-links {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .login-link {
                    background: rgba(255, 255, 255, 0.15);
                }

                .register-button {
                    background: rgba(255, 255, 255, 0.9);
                    color: #667eea !important;
                    font-weight: 600;
                }

                .register-button:hover {
                    background: white;
                    color: #5a67d8 !important;
                }

                /* Toggle do menu mobile */
                .menu-toggle {
                    display: none;
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 6px;
                    transition: background-color 0.2s;
                }

                .menu-toggle:hover {
                    background-color: rgba(255, 255, 255, 0.1);
                }

                /* Menu mobile */
                .mobile-menu {
                    display: none;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    border-top: 1px solid rgba(255, 255, 255, 0.2);
                    animation: slideDown 0.3s ease-out;
                }

                .mobile-nav {
                    padding: 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .mobile-link {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0.75rem;
                    color: #333;
                    text-decoration: none;
                    border-radius: 8px;
                    transition: background-color 0.2s;
                    font-weight: 500;
                }

                .mobile-link:hover {
                    background-color: rgba(102, 126, 234, 0.1);
                    color: #333;
                }

                .mobile-link.admin-link {
                    background-color: rgba(255, 215, 0, 0.1);
                    color: #b8860b;
                }

                .mobile-link.register-style {
                    background-color: #667eea;
                    color: white;
                }

                .mobile-link.register-style:hover {
                    background-color: #5a67d8;
                    color: white;
                }

                .mobile-cart-badge {
                    background-color: #ff4757;
                    color: white;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    font-size: 0.8rem;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .mobile-divider {
                    margin: 0.5rem 0;
                    border: none;
                    height: 1px;
                    background-color: rgba(0, 0, 0, 0.1);
                }

                .mobile-user-info {
                    padding: 0.75rem;
                    background-color: rgba(102, 126, 234, 0.05);
                    border-radius: 8px;
                    margin-bottom: 0.5rem;
                }

                .mobile-user-info strong {
                    display: block;
                    color: #333;
                    margin-bottom: 0.25rem;
                }

                .mobile-user-info small {
                    color: #666;
                    font-size: 0.85rem;
                }

                .mobile-logout {
                    width: 100%;
                    padding: 0.75rem;
                    background-color: #dc3545;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }

                .mobile-logout:hover {
                    background-color: #c82333;
                }

                /* Animações */
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }

                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* Responsividade */
                @media (max-width: 768px) {
                    .desktop-menu {
                        display: none;
                    }

                    .menu-toggle {
                        display: block;
                    }

                    .mobile-menu {
                        display: block;
                    }

                    .navbar-container {
                        height: 60px;
                        padding: 0 0.5rem;
                    }

                    .brand-link {
                        font-size: 1.25rem;
                    }

                    .brand-icon {
                        font-size: 1.5rem;
                    }
                }

                @media (max-width: 480px) {
                    .brand-text {
                        display: none;
                    }

                    .navbar-container {
                        padding: 0 1rem;
                    }

                    .mobile-nav {
                        padding: 0.5rem;
                    }
                }
            `}</style>
        </nav>
    );
};

export default Navbar;