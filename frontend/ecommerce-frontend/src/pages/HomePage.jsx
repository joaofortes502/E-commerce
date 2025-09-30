import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

// Componente da página inicial do e-commerce
const HomePage = () => {
    // Estados para gerenciar produtos e carregamento
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [notification, setNotification] = useState(null);

    // Simulação do contexto do carrinho - você substituirá pela importação real
    const { addItem } = useCart();

    // Carrega produtos quando o componente é montado ou categoria muda
    useEffect(() => {
        loadProducts();
    }, [selectedCategory]);

    // Função para buscar produtos do backend
    const loadProducts = async () => {
        try {
            setLoading(true);
            setError(null);

            // Monta a URL com filtros se necessário
            let url = 'http://localhost:5000/api/products';
            const params = new URLSearchParams();
            
            if (selectedCategory) {
                params.append('category', selectedCategory);
            }
            params.append('inStock', 'true'); // Só produtos com estoque
            
            if (params.toString()) {
                url += '?' + params.toString();
            }

            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao carregar produtos');
            }

            if (data.success && data.products) {
                setProducts(data.products);
                
                // Extrai categorias únicas dos produtos para o filtro
                const uniqueCategories = [...new Set(data.products.map(p => p.category))];
                setCategories(uniqueCategories);
            }

        } catch (err) {
            console.error('Erro ao carregar produtos:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Função para adicionar produto ao carrinho
    const handleAddToCart = async (productId, productName) => {
        try {
            const result = await addItem(productId, 1);
            
            if (result.success) {
                showNotification(`${productName} adicionado ao carrinho!`, 'success');
            } else {
                showNotification(result.message || 'Erro ao adicionar ao carrinho', 'error');
            }
        } catch (error) {
            showNotification('Erro ao adicionar ao carrinho', 'error');
        }
    };

    // Função para mostrar notificações temporárias
    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // Função para formatar preço em reais
    const formatPrice = (price) => {
        return parseFloat(price).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    };

    // Componente de loading simples
    const LoadingSpinner = () => (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Carregando produtos...</p>
        </div>
    );

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="home-page">
            {/* Seção hero com boas-vindas */}
            <section className="hero-section">
                <div className="container">
                    <h1>Bem-vindo ao nosso E-commerce</h1>
                    <p>Encontre os melhores produtos com os melhores preços!</p>
                </div>
            </section>

            <div className="container">
                {/* Sistema de notificações para feedback do usuário */}
                {notification && (
                    <div className={`notification ${notification.type}`}>
                        {notification.message}
                    </div>
                )}

                {/* Seção de filtros por categoria */}
                <section className="filters-section">
                    <div className="filter-group">
                        <label htmlFor="category-filter">Filtrar por categoria:</label>
                        <select 
                            id="category-filter"
                            value={selectedCategory} 
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="category-select"
                        >
                            <option value="">Todas as categorias</option>
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>
                </section>

                {/* Seção principal com lista de produtos */}
                <section className="products-section">
                    {error ? (
                        <div className="error-message">
                            <h3>Erro ao carregar produtos</h3>
                            <p>{error}</p>
                            <button onClick={loadProducts} className="retry-button">
                                Tentar novamente
                            </button>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="no-products">
                            <h3>Nenhum produto encontrado</h3>
                            <p>Tente selecionar uma categoria diferente ou recarregue a página.</p>
                        </div>
                    ) : (
                        <>
                            <h2>Nossos Produtos ({products.length})</h2>
                            <div className="products-grid">
                                {products.map(product => (
                                    <div key={product.id} className="product-card">
                                        {/* Seção da imagem do produto */}
                                        <div className="product-image">
                                            {product.image_url ? (
                                                <img 
                                                    src={product.image_url} 
                                                    alt={product.name}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <div 
                                                className="placeholder-image"
                                                style={{ display: product.image_url ? 'none' : 'flex' }}
                                            >
                                                <span>📦</span>
                                                <span>Sem imagem</span>
                                            </div>
                                        </div>

                                        {/* Informações detalhadas do produto */}
                                        <div className="product-info">
                                            <div className="product-category">
                                                {product.category}
                                            </div>
                                            
                                            <h3 className="product-name">
                                                <a href={`#/products/${product.id}`}>
                                                    {product.name}
                                                </a>
                                            </h3>

                                            <p className="product-description">
                                                {product.description && product.description.length > 100 
                                                    ? product.description.substring(0, 100) + '...'
                                                    : product.description || 'Sem descrição disponível'
                                                }
                                            </p>

                                            <div className="product-price">
                                                {formatPrice(product.price)}
                                            </div>

                                            {/* Indicador de disponibilidade em estoque */}
                                            <div className="product-stock">
                                                {product.stock_quantity > 10 ? (
                                                    <span className="in-stock">✅ Em estoque</span>
                                                ) : product.stock_quantity > 0 ? (
                                                    <span className="low-stock">
                                                        ⚠️ Restam apenas {product.stock_quantity}
                                                    </span>
                                                ) : (
                                                    <span className="out-of-stock">❌ Fora de estoque</span>
                                                )}
                                            </div>

                                            {/* Botões de ação para cada produto */}
                                            <div className="product-actions">
                                                <a 
                                                    href={`#/products/${product.id}`}
                                                    className="view-details-btn"
                                                >
                                                    Ver Detalhes
                                                </a>
                                                
                                                {product.stock_quantity > 0 && (
                                                    <button
                                                        onClick={() => handleAddToCart(product.id, product.name)}
                                                        className="add-to-cart-btn"
                                                    >
                                                        🛒 Adicionar ao Carrinho
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </section>
            </div>

            <style jsx>{`
                /* Estilos gerais da página */
                .home-page {
                    min-height: calc(100vh - 200px);
                }

                /* Seção hero com gradiente atrativo */
                .hero-section {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 4rem 0;
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .hero-section h1 {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                    font-weight: 700;
                }

                .hero-section p {
                    font-size: 1.2rem;
                    opacity: 0.9;
                }

                /* Container principal com centralização responsiva */
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 1rem;
                }

                /* Sistema de notificações */
                .notification {
                    padding: 1rem;
                    border-radius: 8px;
                    margin-bottom: 1rem;
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

                /* Seção de filtros com design limpo */
                .filters-section {
                    margin-bottom: 2rem;
                    padding: 1.5rem;
                    background-color: #f8f9fa;
                    border-radius: 12px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }

                .filter-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                    color: #333;
                }

                .category-select {
                    padding: 0.75rem;
                    border: 2px solid #e9ecef;
                    border-radius: 8px;
                    min-width: 200px;
                    font-size: 1rem;
                    background-color: white;
                    transition: border-color 0.2s;
                }

                .category-select:focus {
                    outline: none;
                    border-color: #667eea;
                }

                /* Título da seção de produtos */
                .products-section h2 {
                    margin-bottom: 2rem;
                    color: #333;
                    text-align: center;
                    font-size: 2rem;
                    font-weight: 600;
                }

                /* Grid responsivo de produtos */
                .products-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 2rem;
                    margin-bottom: 3rem;
                }

                /* Cards de produto com hover effects */
                .product-card {
                    border: 1px solid #eee;
                    border-radius: 16px;
                    overflow: hidden;
                    transition: all 0.3s ease;
                    background: white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                }

                .product-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 12px 32px rgba(0,0,0,0.15);
                    border-color: #667eea;
                }

                /* Seção de imagem do produto */
                .product-image {
                    height: 240px;
                    position: relative;
                    overflow: hidden;
                    background-color: #f8f9fa;
                }

                .product-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s;
                }

                .product-card:hover .product-image img {
                    transform: scale(1.05);
                }

                .placeholder-image {
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: #999;
                    font-size: 3rem;
                    gap: 0.5rem;
                }

                .placeholder-image span:last-child {
                    font-size: 1rem;
                }

                /* Área de informações do produto */
                .product-info {
                    padding: 1.5rem;
                }

                .product-category {
                    font-size: 0.85rem;
                    color: #667eea;
                    text-transform: uppercase;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    letter-spacing: 0.5px;
                }

                .product-name a {
                    color: #333;
                    text-decoration: none;
                    font-size: 1.25rem;
                    font-weight: 600;
                    line-height: 1.3;
                    display: block;
                    margin-bottom: 0.5rem;
                }

                .product-name a:hover {
                    color: #667eea;
                    text-decoration: underline;
                }

                .product-description {
                    color: #666;
                    font-size: 0.95rem;
                    line-height: 1.5;
                    margin: 1rem 0;
                    height: 3em;
                    overflow: hidden;
                }

                .product-price {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #28a745;
                    margin: 1rem 0;
                }

                .product-stock {
                    margin-bottom: 1.5rem;
                    font-size: 0.9rem;
                }

                .in-stock {
                    color: #28a745;
                    font-weight: 500;
                }

                .low-stock {
                    color: #fd7e14;
                    font-weight: 500;
                }

                .out-of-stock {
                    color: #dc3545;
                    font-weight: 500;
                }

                /* Botões de ação do produto */
                .product-actions {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }

                .view-details-btn, .add-to-cart-btn {
                    padding: 0.75rem 1rem;
                    border: none;
                    border-radius: 8px;
                    font-weight: 500;
                    text-decoration: none;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    flex: 1;
                    min-width: 120px;
                    font-size: 0.9rem;
                }

                .view-details-btn {
                    background-color: #6c757d;
                    color: white;
                }

                .view-details-btn:hover {
                    background-color: #5a6268;
                    color: white;
                    transform: translateY(-1px);
                }

                .add-to-cart-btn {
                    background-color: #667eea;
                    color: white;
                }

                .add-to-cart-btn:hover {
                    background-color: #5a67d8;
                    transform: translateY(-1px);
                }

                /* Estados de erro e carregamento */
                .error-message, .no-products {
                    text-align: center;
                    padding: 3rem;
                    background-color: #f8f9fa;
                    border-radius: 12px;
                    margin: 2rem 0;
                }

                .error-message h3, .no-products h3 {
                    color: #dc3545;
                    margin-bottom: 1rem;
                }

                .retry-button {
                    background-color: #667eea;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    cursor: pointer;
                    margin-top: 1rem;
                    font-weight: 500;
                    transition: background-color 0.2s;
                }

                .retry-button:hover {
                    background-color: #5a67d8;
                }

                /* Loading spinner */
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

                /* Responsividade para dispositivos móveis */
                @media (max-width: 768px) {
                    .hero-section {
                        padding: 3rem 0;
                    }
                    
                    .hero-section h1 {
                        font-size: 2rem;
                    }
                    
                    .products-grid {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }
                    
                    .product-actions {
                        flex-direction: column;
                    }
                    
                    .filters-section {
                        padding: 1rem;
                    }
                }

                @media (max-width: 480px) {
                    .hero-section h1 {
                        font-size: 1.5rem;
                    }
                    
                    .container {
                        padding: 0 0.5rem;
                    }
                    
                    .product-card {
                        margin: 0.5rem 0;
                    }
                }
            `}</style>
        </div>
    );
};

export default HomePage;