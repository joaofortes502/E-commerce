import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartPage = () => {
    // Estados para gerenciar o carrinho
    const [updating, setUpdating] = useState({});
    const [notification, setNotification] = useState(null);

    const { 
        items, 
        loading: cartLoading, 
        summary,
        updateItemQuantity, 
        removeItem, 
        clearCart,
        loadCart,
        hasCartIssues,
        getItemsWithIssues
    } = useCart();

    const { isAuthenticated } = useAuth();

    useEffect(() => {
        loadCart();
    },[]);

    // Função para mostrar notificações
    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // Função para atualizar quantidade de um item
    const handleUpdateQuantity = async (productId, newQuantity) => {
        try {
            setUpdating(prev => ({ ...prev, [productId]: true }));
            
            const result = await updateItemQuantity(productId, newQuantity);
            
            if (result.success) {
                showNotification('Quantidade atualizada com sucesso', 'success');
            } else {
                showNotification(result.message || 'Erro ao atualizar quantidade', 'error');
            }
        } catch (error) {
            showNotification('Erro ao atualizar quantidade', 'error');
        } finally {
            setUpdating(prev => ({ ...prev, [productId]: false }));
        }
    };

    // Função para remover item do carrinho
    const handleRemoveItem = async (productId, productName) => {
        try {
            setUpdating(prev => ({ ...prev, [productId]: true }));
            
            const result = await removeItem(productId);
            
            if (result.success) {
                showNotification(`${productName} removido do carrinho`, 'success');
            } else {
                showNotification(result.message || 'Erro ao remover item', 'error');
            }
        } catch (error) {
            showNotification('Erro ao remover item', 'error');
        } finally {
            setUpdating(prev => ({ ...prev, [productId]: false }));
        }
    };

    // Função para limpar carrinho inteiro
    const handleClearCart = async () => {
        if (window.confirm('Tem certeza que deseja limpar todo o carrinho?')) {
            try {
                const result = await clearCart();
                
                if (result.success) {
                    showNotification('Carrinho limpo com sucesso', 'success');
                } else {
                    showNotification(result.message || 'Erro ao limpar carrinho', 'error');
                }
            } catch (error) {
                showNotification('Erro ao limpar carrinho', 'error');
            }
        }
    };

    // Função para finalizar compra
    const handleCheckout = () => {
        if (!isAuthenticated()) {
            showNotification('Você precisa estar logado para finalizar a compra', 'error');
            // Redirecionar para login: navigate('/login');
            return;
        }

        if (hasCartIssues()) {
            showNotification('Resolva os problemas no carrinho antes de finalizar a compra', 'error');
            return;
        }

        // Redirecionar para checkout: navigate('/checkout');
        window.location.hash = '/checkout';
    };

    // Formatação de preço
    const formatPrice = (price) => {
        return parseFloat(price).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    };

    // Componente de loading
    const LoadingSpinner = () => (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Carregando carrinho...</p>
        </div>
    );

    if (cartLoading) {
        return <LoadingSpinner />;
    }

    const cartIssues = getItemsWithIssues();
    const hasIssues = hasCartIssues();

    return (
        <div className="cart-page">
            <div className="container">
                <div className="cart-header">
                    <h1>Meu Carrinho</h1>
                    <div className="cart-summary-header">
                        {summary.item_count > 0 ? (
                            <span>
                                {summary.item_count} {summary.item_count === 1 ? 'item' : 'itens'} 
                                ({summary.total_quantity} {summary.total_quantity === 1 ? 'unidade' : 'unidades'})
                            </span>
                        ) : (
                            <span>Carrinho vazio</span>
                        )}
                    </div>
                </div>

                {/* Notificação */}
                {notification && (
                    <div className={`notification ${notification.type}`}>
                        {notification.message}
                    </div>
                )}

                {/* Avisos sobre problemas no carrinho */}
                {hasIssues && (
                    <div className="cart-issues">
                        <h3>⚠️ Atenção - Problemas no carrinho:</h3>
                        {cartIssues.stock_issues.length > 0 && (
                            <div className="issue-section">
                                <h4>Produtos sem estoque:</h4>
                                <ul>
                                    {cartIssues.stock_issues.map(item => (
                                        <li key={item.id}>{item.product_name}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {cartIssues.price_changes.length > 0 && (
                            <div className="issue-section">
                                <h4>Produtos com preços alterados:</h4>
                                <ul>
                                    {cartIssues.price_changes.map(item => (
                                        <li key={item.id}>
                                            {item.product_name}: 
                                            <span className="old-price">{formatPrice(item.price_when_added)}</span>
                                            → 
                                            <span className="new-price">{formatPrice(item.current_price)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {items.length === 0 ? (
                    /* Carrinho vazio */
                    <div className="empty-cart">
                        <div className="empty-icon">🛒</div>
                        <h2>Seu carrinho está vazio</h2>
                        <p>Que tal dar uma olhada nos nossos produtos?</p>
                        <a href="#/" className="continue-shopping-btn">
                            Ver Produtos
                        </a>
                    </div>
                ) : (
                    /* Carrinho com itens */
                    <div className="cart-content">
                        <div className="cart-items-section">
                            {/* Cabeçalho da lista */}
                            <div className="items-header">
                                <h2>Itens no carrinho</h2>
                                {items.length > 1 && (
                                    <button onClick={handleClearCart} className="clear-cart-btn">
                                        🗑️ Limpar carrinho
                                    </button>
                                )}
                            </div>

                            {/* Lista de itens */}
                            <div className="cart-items">
                                {items.map(item => (
                                    <div key={item.id} className={`cart-item ${item.stock_available === 0 ? 'out-of-stock' : ''}`}>
                                        {/* Imagem do produto */}
                                        <div className="item-image">
                                            {item.image_url ? (
                                                <img 
                                                    src={item.image_url} 
                                                    alt={item.product_name}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <div 
                                                className="placeholder-image"
                                                style={{ display: item.image_url ? 'none' : 'flex' }}
                                            >
                                                📦
                                            </div>
                                        </div>

                                        {/* Informações do produto */}
                                        <div className="item-info">
                                            <h3 className="item-name">
                                                <a href={`/products/${item.product_id}`}>
                                                    {item.product_name}
                                                </a>
                                            </h3>
                                            <p className="item-description">
                                                {item.product_description || 'Sem descrição'}
                                            </p>
                                            
                                            {/* Avisos específicos do item */}
                                            {item.stock_available === 0 && (
                                                <div className="item-warning">
                                                    ❌ Produto fora de estoque
                                                </div>
                                            )}
                                            {item.price_changed === 1 && (
                                                <div className="item-warning price-change">
                                                    💰 Preço alterado: 
                                                    <span className="old-price">{formatPrice(item.price_when_added)}</span>
                                                    →
                                                    <span className="new-price">{formatPrice(item.current_price)}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Controles de quantidade */}
                                        <div className="item-quantity">
                                            <label>Quantidade:</label>
                                            <div className="quantity-controls">
                                                <button 
                                                    onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1 || updating[item.product_id]}
                                                    className="qty-btn"
                                                >
                                                    -
                                                </button>
                                                <span className="quantity-display">
                                                    {updating[item.product_id] ? '...' : item.quantity}
                                                </span>
                                                <button 
                                                    onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                                                    disabled={item.quantity >= item.stock_quantity || updating[item.product_id]}
                                                    className="qty-btn"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        {/* Preço unitário */}
                                        <div className="item-price">
                                            <div className="unit-price">
                                                {formatPrice(item.price_when_added)}
                                                <small>/un</small>
                                            </div>
                                        </div>

                                        {/* Subtotal do item */}
                                        <div className="item-subtotal">
                                            <strong>{formatPrice(item.subtotal)}</strong>
                                        </div>

                                        {/* Botão de remoção */}
                                        <div className="item-actions">
                                            <button
                                                onClick={() => handleRemoveItem(item.product_id, item.product_name)}
                                                disabled={updating[item.product_id]}
                                                className="remove-btn"
                                                title="Remover item"
                                            >
                                                {updating[item.product_id] ? '⏳' : '🗑️'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Resumo e finalização */}
                        <div className="cart-summary-section">
                            <div className="cart-summary">
                                <h3>Resumo do pedido</h3>
                                
                                <div className="summary-line">
                                    <span>Subtotal ({summary.total_quantity} itens):</span>
                                    <strong>{formatPrice(summary.subtotal)}</strong>
                                </div>
                                
                                <div className="summary-line">
                                    <span>Frete:</span>
                                    <span>Calculado no checkout</span>
                                </div>
                                
                                <hr />
                                
                                <div className="summary-line total">
                                    <span>Total:</span>
                                    <strong>{formatPrice(summary.subtotal)}</strong>
                                </div>

                                {!isAuthenticated() && (
                                    <div className="auth-notice">
                                        <p>💡 Faça login para finalizar sua compra</p>
                                        <a href="/login" className="login-link">
                                            Fazer Login
                                        </a>
                                    </div>
                                )}

                                <div className="checkout-actions">
                                    <button
                                        onClick={handleCheckout}
                                        disabled={hasIssues || summary.item_count === 0}
                                        className="checkout-btn"
                                    >
                                        {isAuthenticated() 
                                            ? '🛒 Finalizar Compra' 
                                            : '🔐 Fazer Login e Comprar'
                                        }
                                    </button>
                                    
                                    <a href="/" className="continue-shopping">
                                        ← Continuar comprando
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .cart-page {
                    min-height: calc(100vh - 200px);
                    padding: 2rem 0;
                }

                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 1rem;
                }

                /* Cabeçalho do carrinho */
                .cart-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                    border-bottom: 2px solid #e9ecef;
                }

                .cart-header h1 {
                    font-size: 2.5rem;
                    color: #333;
                    margin: 0;
                }

                .cart-summary-header {
                    font-size: 1.1rem;
                    color: #666;
                    font-weight: 500;
                }

                /* Notificações */
                .notification {
                    padding: 1rem;
                    border-radius: 8px;
                    margin-bottom: 2rem;
                    font-weight: 500;
                    animation: slideIn 0.3s ease-out;
                }

                .notification.success {
                    background-color: #d4edda;
                    color: #155724;
                    border: 1px solid #c3e6cb;
                }

                .notification.error {
                    background-color: #f8d7da;
                    color: #721c24;
                    border: 1px solid #f5c6cb;
                }

                /* Avisos de problemas */
                .cart-issues {
                    background-color: #fff3cd;
                    border: 2px solid #ffeaa7;
                    border-radius: 12px;
                    padding: 1.5rem;
                    margin-bottom: 2rem;
                }

                .cart-issues h3 {
                    color: #856404;
                    margin-bottom: 1rem;
                }

                .issue-section {
                    margin-bottom: 1rem;
                }

                .issue-section h4 {
                    color: #856404;
                    margin-bottom: 0.5rem;
                }

                .issue-section ul {
                    margin: 0;
                    padding-left: 1.5rem;
                }

                .old-price {
                    text-decoration: line-through;
                    color: #dc3545;
                    margin: 0 0.25rem;
                }

                .new-price {
                    color: #28a745;
                    font-weight: 600;
                    margin: 0 0.25rem;
                }

                /* Carrinho vazio */
                .empty-cart {
                    text-align: center;
                    padding: 4rem 2rem;
                    background-color: #f8f9fa;
                    border-radius: 16px;
                }

                .empty-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                    opacity: 0.5;
                }

                .empty-cart h2 {
                    color: #666;
                    margin-bottom: 1rem;
                }

                .empty-cart p {
                    color: #999;
                    margin-bottom: 2rem;
                }

                .continue-shopping-btn {
                    display: inline-block;
                    padding: 1rem 2rem;
                    background-color: #667eea;
                    color: white;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: 600;
                    transition: background-color 0.2s;
                }

                .continue-shopping-btn:hover {
                    background-color: #5a67d8;
                }

                /* Conteúdo do carrinho */
                .cart-content {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 3rem;
                }

                /* Seção de itens */
                .items-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .items-header h2 {
                    color: #333;
                    margin: 0;
                }

                .clear-cart-btn {
                    padding: 0.5rem 1rem;
                    background-color: #dc3545;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }

                .clear-cart-btn:hover {
                    background-color: #c82333;
                }

                /* Itens do carrinho */
                .cart-items {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .cart-item {
                    display: grid;
                    grid-template-columns: 80px 1fr auto auto auto auto;
                    gap: 1rem;
                    align-items: center;
                    padding: 1.5rem;
                    background-color: white;
                    border: 2px solid #e9ecef;
                    border-radius: 12px;
                    transition: all 0.2s;
                }

                .cart-item:hover {
                    border-color: #667eea;
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
                }

                .cart-item.out-of-stock {
                    opacity: 0.7;
                    background-color: #f8f9fa;
                }

                /* Imagem do item */
                .item-image {
                    width: 80px;
                    height: 80px;
                    border-radius: 8px;
                    overflow: hidden;
                    background-color: #f0f0f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .item-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .placeholder-image {
                    font-size: 2rem;
                    color: #999;
                }

                /* Informações do item */
                .item-info {
                    min-width: 0;
                }

                .item-name a {
                    color: #333;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 1.1rem;
                }

                .item-name a:hover {
                    color: #667eea;
                    text-decoration: underline;
                }

                .item-description {
                    color: #666;
                    font-size: 0.9rem;
                    margin: 0.5rem 0;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .item-warning {
                    font-size: 0.85rem;
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    margin-top: 0.5rem;
                }

                .item-warning {
                    background-color: #f8d7da;
                    color: #721c24;
                }

                .item-warning.price-change {
                    background-color: #fff3cd;
                    color: #856404;
                }

                /* Controles de quantidade */
                .item-quantity {
                    text-align: center;
                }

                .item-quantity label {
                    display: block;
                    font-size: 0.85rem;
                    color: #666;
                    margin-bottom: 0.5rem;
                }

                .quantity-controls {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .qty-btn {
                    width: 32px;
                    height: 32px;
                    border: 1px solid #667eea;
                    background-color: white;
                    color: #667eea;
                    border-radius: 4px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .qty-btn:hover:not(:disabled) {
                    background-color: #667eea;
                    color: white;
                }

                .qty-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .quantity-display {
                    min-width: 30px;
                    text-align: center;
                    font-weight: 600;
                }

                /* Preços */
                .item-price {
                    text-align: right;
                }

                .unit-price {
                    font-weight: 600;
                    color: #333;
                }

                .unit-price small {
                    color: #666;
                    font-weight: normal;
                }

                .item-subtotal {
                    text-align: right;
                    font-size: 1.1rem;
                }

                /* Ações do item */
                .item-actions {
                    text-align: center;
                }

                .remove-btn {
                    width: 40px;
                    height: 40px;
                    border: none;
                    background-color: #dc3545;
                    color: white;
                    border-radius: 50%;
                    font-size: 1.2rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .remove-btn:hover:not(:disabled) {
                    background-color: #c82333;
                    transform: scale(1.1);
                }

                .remove-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* Resumo do carrinho */
                .cart-summary {
                    background-color: #f8f9fa;
                    border: 2px solid #e9ecef;
                    border-radius: 12px;
                    padding: 2rem;
                    height: fit-content;
                    position: sticky;
                    top: 2rem;
                }

                .cart-summary h3 {
                    margin-bottom: 1.5rem;
                    color: #333;
                }

                .summary-line {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                    font-size: 1rem;
                }

                .summary-line.total {
                    font-size: 1.3rem;
                    color: #333;
                    margin-top: 1rem;
                }

                .auth-notice {
                    background-color: #e7f3ff;
                    border: 1px solid #b8daff;
                    border-radius: 8px;
                    padding: 1rem;
                    margin: 1.5rem 0;
                    text-align: center;
                }

                .auth-notice p {
                    margin-bottom: 0.5rem;
                    color: #004085;
                }

                .login-link {
                    color: #667eea;
                    text-decoration: none;
                    font-weight: 600;
                }

                .login-link:hover {
                    text-decoration: underline;
                }

                /* Ações de checkout */
                .checkout-actions {
                    margin-top: 2rem;
                }

                .checkout-btn {
                    width: 100%;
                    padding: 1rem 2rem;
                    background-color: #28a745;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    margin-bottom: 1rem;
                    transition: all 0.2s;
                }

                .checkout-btn:hover:not(:disabled) {
                    background-color: #218838;
                    transform: translateY(-1px);
                }

                .checkout-btn:disabled {
                    background-color: #6c757d;
                    cursor: not-allowed;
                }

                .continue-shopping {
                    display: block;
                    text-align: center;
                    color: #667eea;
                    text-decoration: none;
                    font-weight: 500;
                }

                .continue-shopping:hover {
                    text-decoration: underline;
                }

                /* Loading */
                .loading-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 4rem;
                }

                .loading-spinner {
                    width: 50px;
                    height: 50px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #667eea;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 1rem;
                }

                /* Animações */
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* Responsividade */
                @media (max-width: 1024px) {
                    .cart-content {
                        grid-template-columns: 1fr;
                        gap: 2rem;
                    }
                }

                @media (max-width: 768px) {
                    .cart-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.5rem;
                    }

                    .cart-header h1 {
                        font-size: 2rem;
                    }

                    .cart-item {
                        grid-template-columns: 60px 1fr;
                        grid-template-areas: 
                            "image info"
                            "quantity price"
                            "subtotal actions";
                        gap: 1rem;
                    }

                    .item-image {
                        grid-area: image;
                        width: 60px;
                        height: 60px;
                    }

                    .item-info {
                        grid-area: info;
                    }

                    .item-quantity {
                        grid-area: quantity;
                        text-align: left;
                    }

                    .item-price {
                        grid-area: price;
                        text-align: right;
                    }

                    .item-subtotal {
                        grid-area: subtotal;
                        text-align: left;
                    }

                    .item-actions {
                        grid-area: actions;
                        text-align: right;
                    }

                    .items-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default CartPage;