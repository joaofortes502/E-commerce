import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useParams } from 'react-router-dom';

const ProductPage = () => {
    // Estados para gerenciar o produto e interações
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [notification, setNotification] = useState(null);
    const [imageError, setImageError] = useState(false);

    // Simulação do contexto do carrinho - você substituirá pela importação real
    const { addItem, isItemInCart, getItemQuantity } = useCart();

    // Simula obter ID do produto da URL - você usará useParams do react-router-dom
    const {id} = useParams(); // Em produção: const { id } = useParams();

    useEffect(() => {
        if (id) {
            loadProduct();
        }
    }, [id]);

    // Carrega dados do produto específico
    const loadProduct = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`http://localhost:5000/api/products/${id}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Produto não encontrado');
            }

            if (data.success && data.product) {
                setProduct(data.product);
            } else {
                throw new Error('Produto não encontrado');
            }

        } catch (err) {
            console.error('Erro ao carregar produto:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Adiciona produto ao carrinho com quantidade especificada
    const handleAddToCart = async () => {
        try {
            const result = await addItem(product.id, quantity);
            
            if (result.success) {
                showNotification(
                    `${quantity} ${quantity === 1 ? 'unidade' : 'unidades'} de "${product.name}" adicionado(s) ao carrinho!`, 
                    'success'
                );
            } else {
                showNotification(result.message || 'Erro ao adicionar ao carrinho', 'error');
            }
        } catch (error) {
            showNotification('Erro ao adicionar ao carrinho', 'error');
        }
    };

    // Sistema de notificações
    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    // Formatação de preço
    const formatPrice = (price) => {
        return parseFloat(price).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    };

    // Funções para controlar quantidade
    const incrementQuantity = () => {
        if (quantity < product.stock_quantity) {
            setQuantity(prev => prev + 1);
        }
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 1 && value <= product.stock_quantity) {
            setQuantity(value);
        }
    };

    // Componente de loading
    const LoadingSpinner = () => (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Carregando produto...</p>
        </div>
    );

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-content">
                    <h2>Produto não encontrado</h2>
                    <p>{error}</p>
                    <button onClick={() => window.history.back()} className="back-button">
                        ← Voltar
                    </button>
                </div>
            </div>
        );
    }

    if (!product) {
        return <div>Produto não encontrado</div>;
    }

    const currentCartQuantity = getItemQuantity(product.id);
    const isInCart = isItemInCart(product.id);
    const maxQuantity = Math.max(0, product.stock_quantity - currentCartQuantity);

    return (
        <div className="product-page">
            <div className="container">
                {/* Breadcrumb de navegação */}
                <nav className="breadcrumb">
                    <a href="#/">Início</a>
                    <span className="separator">›</span>
                    <span className="category">{product.category}</span>
                    <span className="separator">›</span>
                    <span className="current">{product.name}</span>
                </nav>

                {/* Notificação */}
                {notification && (
                    <div className={`notification ${notification.type}`}>
                        {notification.message}
                    </div>
                )}

                {/* Layout principal do produto */}
                <div className="product-layout">
                    {/* Seção da imagem */}
                    <div className="product-image-section">
                        <div className="main-image">
                            {product.image_url && !imageError ? (
                                <img 
                                    src={product.image_url} 
                                    alt={product.name}
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div className="placeholder-image">
                                    <span className="icon">📦</span>
                                    <p>Imagem não disponível</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Seção de informações e compra */}
                    <div className="product-info-section">
                        <div className="product-header">
                            <span className="product-category">{product.category}</span>
                            <h1 className="product-title">{product.name}</h1>
                        </div>

                        <div className="product-price">
                            {formatPrice(product.price)}
                        </div>

                        {/* Informações de estoque */}
                        <div className="stock-info">
                            {product.stock_quantity > 10 ? (
                                <span className="stock-status in-stock">
                                    ✅ Em estoque ({product.stock_quantity} disponíveis)
                                </span>
                            ) : product.stock_quantity > 0 ? (
                                <span className="stock-status low-stock">
                                    ⚠️ Apenas {product.stock_quantity} em estoque
                                </span>
                            ) : (
                                <span className="stock-status out-of-stock">
                                    ❌ Fora de estoque
                                </span>
                            )}

                            {isInCart && (
                                <div className="cart-status">
                                    🛒 Você já tem {currentCartQuantity} no carrinho
                                </div>
                            )}
                        </div>

                        {/* Seleção de quantidade e compra */}
                        {product.stock_quantity > 0 && maxQuantity > 0 && (
                            <div className="purchase-section">
                                <div className="quantity-selector">
                                    <label>Quantidade:</label>
                                    <div className="quantity-controls">
                                        <button 
                                            onClick={decrementQuantity}
                                            disabled={quantity <= 1}
                                            className="qty-btn"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={handleQuantityChange}
                                            min="1"
                                            max={maxQuantity}
                                            className="qty-input"
                                        />
                                        <button 
                                            onClick={incrementQuantity}
                                            disabled={quantity >= maxQuantity}
                                            className="qty-btn"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <span className="max-info">
                                        (máx: {maxQuantity})
                                    </span>
                                </div>

                                <div className="total-price">
                                    <strong>
                                        Total: {formatPrice(product.price * quantity)}
                                    </strong>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    className="add-to-cart-main"
                                >
                                    🛒 Adicionar ao Carrinho
                                </button>
                            </div>
                        )}

                        {/* Descrição do produto */}
                        <div className="product-description">
                            <h3>Descrição</h3>
                            <p>
                                {product.description || 'Nenhuma descrição disponível para este produto.'}
                            </p>
                        </div>

                        {/* Informações adicionais */}
                        <div className="product-details">
                            <h3>Detalhes</h3>
                            <div className="details-grid">
                                <div className="detail-item">
                                    <strong>Categoria:</strong>
                                    <span>{product.category}</span>
                                </div>
                                <div className="detail-item">
                                    <strong>Código:</strong>
                                    <span>#{product.id}</span>
                                </div>
                                <div className="detail-item">
                                    <strong>Disponibilidade:</strong>
                                    <span>
                                        {product.stock_quantity > 0 
                                            ? `${product.stock_quantity} em estoque`
                                            : 'Indisponível'
                                        }
                                    </span>
                                </div>
                                {product.creator_name && (
                                    <div className="detail-item">
                                        <strong>Adicionado por:</strong>
                                        <span>{product.creator_name}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botões de navegação */}
                <div className="navigation-buttons">
                    <button 
                        onClick={() => window.history.back()} 
                        className="back-button"
                    >
                        ← Voltar
                    </button>
                    <a href="#/cart" className="view-cart-button">
                        Ver Carrinho 🛒
                    </a>
                </div>
            </div>

            <style jsx>{`
                .product-page {
                    min-height: calc(100vh - 200px);
                    padding: 2rem 0;
                }

                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 1rem;
                }

                /* Breadcrumb */
                .breadcrumb {
                    margin-bottom: 2rem;
                    font-size: 0.9rem;
                    color: #666;
                }

                .breadcrumb a {
                    color: #667eea;
                    text-decoration: none;
                }

                .breadcrumb a:hover {
                    text-decoration: underline;
                }

                .separator {
                    margin: 0 0.5rem;
                    color: #999;
                }

                .current {
                    color: #333;
                    font-weight: 500;
                }

                /* Notificação */
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

                /* Layout principal */
                .product-layout {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 3rem;
                    margin-bottom: 3rem;
                }

                /* Seção de imagem */
                .product-image-section {
                    display: flex;
                    flex-direction: column;
                }

                .main-image {
                    width: 100%;
                    height: 500px;
                    border-radius: 12px;
                    overflow: hidden;
                    background-color: #f8f9fa;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .main-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }

                .placeholder-image {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: #999;
                    height: 100%;
                }

                .placeholder-image .icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }

                /* Seção de informações */
                .product-info-section {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                .product-header .product-category {
                    display: inline-block;
                    background-color: #667eea;
                    color: white;
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    margin-bottom: 1rem;
                }

                .product-title {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: #333;
                    line-height: 1.2;
                    margin: 0;
                }

                .product-price {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: #28a745;
                }

                /* Informações de estoque */
                .stock-info {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .stock-status {
                    font-weight: 500;
                    font-size: 1.1rem;
                }

                .stock-status.in-stock {
                    color: #28a745;
                }

                .stock-status.low-stock {
                    color: #fd7e14;
                }

                .stock-status.out-of-stock {
                    color: #dc3545;
                }

                .cart-status {
                    color: #667eea;
                    font-weight: 500;
                    background-color: #f8f9ff;
                    padding: 0.5rem;
                    border-radius: 6px;
                }

                /* Seção de compra */
                .purchase-section {
                    padding: 1.5rem;
                    background-color: #f8f9fa;
                    border-radius: 12px;
                    border: 2px solid #e9ecef;
                }

                .quantity-selector {
                    margin-bottom: 1rem;
                }

                .quantity-selector label {
                    display: block;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    color: #333;
                }

                .quantity-controls {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.5rem;
                }

                .qty-btn {
                    width: 40px;
                    height: 40px;
                    border: 2px solid #667eea;
                    background-color: white;
                    color: #667eea;
                    border-radius: 8px;
                    font-size: 1.2rem;
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

                .qty-input {
                    width: 80px;
                    height: 40px;
                    text-align: center;
                    border: 2px solid #e9ecef;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                }

                .qty-input:focus {
                    outline: none;
                    border-color: #667eea;
                }

                .max-info {
                    font-size: 0.9rem;
                    color: #666;
                }

                .total-price {
                    font-size: 1.3rem;
                    margin-bottom: 1rem;
                    color: #333;
                }

                .add-to-cart-main {
                    width: 100%;
                    padding: 1rem 2rem;
                    background-color: #667eea;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .add-to-cart-main:hover {
                    background-color: #5a67d8;
                    transform: translateY(-1px);
                }

                /* Descrição */
                .product-description {
                    padding: 1.5rem 0;
                    border-top: 1px solid #e9ecef;
                }

                .product-description h3 {
                    margin-bottom: 1rem;
                    color: #333;
                }

                .product-description p {
                    line-height: 1.6;
                    color: #666;
                    font-size: 1rem;
                }

                /* Detalhes */
                .product-details {
                    padding: 1.5rem 0;
                    border-top: 1px solid #e9ecef;
                }

                .product-details h3 {
                    margin-bottom: 1rem;
                    color: #333;
                }

                .details-grid {
                    display: grid;
                    gap: 0.75rem;
                }

                .detail-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.5rem 0;
                }

                .detail-item strong {
                    color: #333;
                    min-width: 120px;
                }

                .detail-item span {
                    color: #666;
                    text-align: right;
                }

                /* Botões de navegação */
                .navigation-buttons {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    margin-top: 2rem;
                }

                .back-button, .view-cart-button {
                    padding: 0.75rem 1.5rem;
                    border: 2px solid #667eea;
                    border-radius: 8px;
                    font-weight: 500;
                    text-decoration: none;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .back-button {
                    background-color: white;
                    color: #667eea;
                }

                .back-button:hover {
                    background-color: #667eea;
                    color: white;
                }

                .view-cart-button {
                    background-color: #667eea;
                    color: white;
                }

                .view-cart-button:hover {
                    background-color: #5a67d8;
                }

                /* Loading e erro */
                .loading-container, .error-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 400px;
                }

                .error-content {
                    text-align: center;
                    padding: 2rem;
                    background-color: #f8f9fa;
                    border-radius: 12px;
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
                @media (max-width: 768px) {
                    .product-layout {
                        grid-template-columns: 1fr;
                        gap: 2rem;
                    }

                    .product-title {
                        font-size: 2rem;
                    }

                    .product-price {
                        font-size: 2rem;
                    }

                    .main-image {
                        height: 300px;
                    }

                    .navigation-buttons {
                        flex-direction: column;
                        align-items: center;
                    }
                }
            `}</style>
        </div>
    );
};

export default ProductPage;