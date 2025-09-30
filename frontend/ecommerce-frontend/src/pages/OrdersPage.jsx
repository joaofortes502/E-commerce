import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './OrdersPage.css';

const OrdersPage = () => {
    // Estados para gerenciar pedidos e interface
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    
    // Obtemos funções do contexto de autenticação
    const { getAuthHeaders } = useAuth();
    
    // Carregamos os pedidos quando o componente é montado
    useEffect(() => {
        loadOrders();
    }, []);
    
    // Função principal que busca os pedidos do usuário no backend
    const loadOrders = async () => {
        try {
            setLoading(true);
            setError('');
            
            const response = await fetch('http://localhost:5000/api/orders/my-orders', {
                headers: getAuthHeaders()
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Erro ao carregar pedidos');
            }
            
            if (data.success) {
                // Ordenamos os pedidos do mais recente para o mais antigo
                const sortedOrders = (data.orders || []).sort((a, b) => 
                    new Date(b.created_at) - new Date(a.created_at)
                );
                setOrders(sortedOrders);
            }
        } catch (error) {
            console.error('Erro ao carregar pedidos:', error);
            setError('Não foi possível carregar seus pedidos. Por favor, tente novamente.');
        } finally {
            setLoading(false);
        }
    };
    
    // Função para expandir/colapsar detalhes de um pedido
    // Funciona como um accordion - apenas um pedido expandido por vez
    const toggleOrderExpansion = (orderId) => {
        if (expandedOrderId === orderId) {
            // Se clicar no pedido já expandido, fechamos ele
            setExpandedOrderId(null);
        } else {
            // Caso contrário, expandimos o novo pedido
            setExpandedOrderId(orderId);
            // Se o pedido não tem itens carregados ainda, buscamos os detalhes
            const order = orders.find(o => o.id === orderId);
            if (order && !order.items) {
                loadOrderDetails(orderId);
            }
        }
    };
    
    // Função para carregar detalhes completos de um pedido específico
    // Isso é feito sob demanda para não carregar dados desnecessários
    const loadOrderDetails = async (orderId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
                headers: getAuthHeaders()
            });
            
            const data = await response.json();
            
            if (data.success && data.order) {
                // Atualizamos apenas o pedido específico com os detalhes completos
                setOrders(prevOrders => 
                    prevOrders.map(order => 
                        order.id === orderId 
                            ? { ...order, items: data.order.items }
                            : order
                    )
                );
            }
        } catch (error) {
            console.error('Erro ao carregar detalhes do pedido:', error);
        }
    };
    
    // Função para tentar cancelar um pedido
    // Só funciona se o pedido ainda estiver pendente
    const cancelOrder = async (orderId) => {
        if (!window.confirm('Tem certeza que deseja cancelar este pedido?')) {
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:5000/api/orders/${orderId}/cancel`, {
                method: 'PUT',
                headers: getAuthHeaders()
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Atualizamos o pedido localmente para refletir o cancelamento
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order.id === orderId
                            ? { ...order, status: 'cancelled' }
                            : order
                    )
                );
                alert('Pedido cancelado com sucesso!');
            } else {
                alert(data.message || 'Não foi possível cancelar o pedido');
            }
        } catch (error) {
            console.error('Erro ao cancelar pedido:', error);
            alert('Erro ao cancelar pedido. Por favor, tente novamente.');
        }
    };
    
    // Função para formatar valores monetários no padrão brasileiro
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    
    // Função para formatar datas de forma amigável
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        
        // Se foi hoje, mostramos "Hoje"
        if (diffDays === 0) {
            return `Hoje às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
        }
        // Se foi ontem, mostramos "Ontem"
        else if (diffDays === 1) {
            return `Ontem às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
        }
        // Caso contrário, mostramos a data completa
        else {
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };
    
    // Função para traduzir status do pedido para português
    const translateStatus = (status) => {
        const translations = {
            pending: 'Pendente',
            confirmed: 'Confirmado',
            shipped: 'Enviado',
            delivered: 'Entregue',
            cancelled: 'Cancelado'
        };
        return translations[status] || status;
    };
    
    // Função para obter classe CSS apropriada baseada no status
    const getStatusClass = (status) => {
        const statusClasses = {
            pending: 'status-pending',
            confirmed: 'status-confirmed',
            shipped: 'status-shipped',
            delivered: 'status-delivered',
            cancelled: 'status-cancelled'
        };
        return statusClasses[status] || 'status-default';
    };
    
    // Função para obter ícone apropriado baseado no status
    const getStatusIcon = (status) => {
        const icons = {
            pending: '⏳',
            confirmed: '✅',
            shipped: '🚚',
            delivered: '📦',
            cancelled: '❌'
        };
        return icons[status] || '📋';
    };
    
    // Função para filtrar pedidos baseado no status selecionado
    const getFilteredOrders = () => {
        if (filterStatus === 'all') {
            return orders;
        }
        return orders.filter(order => order.status === filterStatus);
    };
    
    // Calculamos algumas estatísticas úteis para mostrar ao usuário
    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        completed: orders.filter(o => o.status === 'delivered').length,
        totalSpent: orders
            .filter(o => o.status !== 'cancelled')
            .reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0)
    };
    
    // Se está carregando, mostramos indicador de loading
    if (loading) {
        return (
            <div className="orders-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Carregando seus pedidos...</p>
                </div>
            </div>
        );
    }
    
    // Se houve erro, mostramos mensagem de erro com botão para tentar novamente
    if (error) {
        return (
            <div className="orders-page">
                <div className="error-container">
                    <h2>😕 Ops!</h2>
                    <p>{error}</p>
                    <button onClick={loadOrders} className="btn-retry">
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }
    
    // Renderização principal da página
    return (
        <div className="orders-page">
            <div className="orders-header">
                <div className="header-content">
                    <h1>Meus Pedidos</h1>
                    <p>Acompanhe o status de todos os seus pedidos</p>
                </div>
                
                {/* Mostramos estatísticas se houver pedidos */}
                {orders.length > 0 && (
                    <div className="orders-stats">
                        <div className="stat-item">
                            <span className="stat-label">Total de Pedidos</span>
                            <span className="stat-value">{stats.total}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Pendentes</span>
                            <span className="stat-value highlight-pending">{stats.pending}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Concluídos</span>
                            <span className="stat-value highlight-success">{stats.completed}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Total Gasto</span>
                            <span className="stat-value highlight-amount">{formatCurrency(stats.totalSpent)}</span>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Se não há pedidos, mostramos mensagem encorajadora */}
            {orders.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🛒</div>
                    <h2>Você ainda não fez nenhum pedido</h2>
                    <p>Que tal explorar nossos produtos e fazer sua primeira compra?</p>
                    <Link to="/" className="btn-shop">
                        Começar a Comprar
                    </Link>
                </div>
            ) : (
                <>
                    {/* Filtros de status */}
                    <div className="orders-filters">
                        <button 
                            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                            onClick={() => setFilterStatus('all')}
                        >
                            Todos ({orders.length})
                        </button>
                        <button 
                            className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
                            onClick={() => setFilterStatus('pending')}
                        >
                            Pendentes ({stats.pending})
                        </button>
                        <button 
                            className={`filter-btn ${filterStatus === 'confirmed' ? 'active' : ''}`}
                            onClick={() => setFilterStatus('confirmed')}
                        >
                            Confirmados
                        </button>
                        <button 
                            className={`filter-btn ${filterStatus === 'shipped' ? 'active' : ''}`}
                            onClick={() => setFilterStatus('shipped')}
                        >
                            Enviados
                        </button>
                        <button 
                            className={`filter-btn ${filterStatus === 'delivered' ? 'active' : ''}`}
                            onClick={() => setFilterStatus('delivered')}
                        >
                            Entregues
                        </button>
                    </div>
                    
                    {/* Lista de pedidos */}
                    <div className="orders-list">
                        {getFilteredOrders().map(order => (
                            <div key={order.id} className="order-card">
                                {/* Cabeçalho do pedido - sempre visível */}
                                <div 
                                    className="order-summary"
                                    onClick={() => toggleOrderExpansion(order.id)}
                                >
                                    <div className="order-main-info">
                                        <div className="order-id-status">
                                            <h3>Pedido #{order.id}</h3>
                                            <span className={`status-badge ${getStatusClass(order.status)}`}>
                                                {getStatusIcon(order.status)} {translateStatus(order.status)}
                                            </span>
                                        </div>
                                        <p className="order-date">{formatDate(order.created_at)}</p>
                                    </div>
                                    
                                    <div className="order-quick-info">
                                        <div className="info-item">
                                            <span className="info-label">Itens:</span>
                                            <span className="info-value">{order.item_count}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Total:</span>
                                            <span className="info-value total-amount">
                                                {formatCurrency(order.total_amount)}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="expand-indicator">
                                        {expandedOrderId === order.id ? '▲' : '▼'}
                                    </div>
                                </div>
                                
                                {/* Detalhes expandidos do pedido */}
                                {expandedOrderId === order.id && (
                                    <div className="order-details">
                                        {/* Endereço de entrega se disponível */}
                                        {order.shipping_address && (
                                            <div className="detail-section">
                                                <h4>📍 Endereço de Entrega</h4>
                                                <p>{order.shipping_address}</p>
                                            </div>
                                        )}
                                        
                                        {/* Notas/Observações se disponíveis */}
                                        {order.notes && (
                                            <div className="detail-section">
                                                <h4>📝 Observações</h4>
                                                <p>{order.notes}</p>
                                            </div>
                                        )}
                                        
                                        {/* Lista de itens do pedido */}
                                        <div className="detail-section">
                                            <h4>📦 Itens do Pedido</h4>
                                            {order.items ? (
                                                <div className="order-items">
                                                    {order.items.map(item => (
                                                        <div key={item.id} className="order-item">
                                                            <div className="item-info">
                                                                <h5>{item.product_name}</h5>
                                                                {item.product_description && (
                                                                    <p className="item-description">
                                                                        {item.product_description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="item-quantity">
                                                                <span>{item.quantity}x</span>
                                                            </div>
                                                            <div className="item-price">
                                                                <span className="unit-price">
                                                                    {formatCurrency(item.unit_price)}
                                                                </span>
                                                                <span className="subtotal">
                                                                    {formatCurrency(item.subtotal)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="loading-items">Carregando itens...</p>
                                            )}
                                        </div>
                                        
                                        {/* Ações disponíveis para o pedido */}
                                        <div className="order-actions">
                                            {order.status === 'pending' && (
                                                <button 
                                                    onClick={() => cancelOrder(order.id)}
                                                    className="btn-cancel-order"
                                                >
                                                    ❌ Cancelar Pedido
                                                </button>
                                            )}
                                            {order.status === 'delivered' && (
                                                <button className="btn-buy-again">
                                                    🔄 Comprar Novamente
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default OrdersPage;