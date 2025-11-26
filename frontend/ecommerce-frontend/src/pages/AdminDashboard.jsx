import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
    // Estado para controlar qual aba está ativa
    const [activeTab, setActiveTab] = useState('overview');
    
    // Estados para produtos
    const [products, setProducts] = useState([]);
    const [productLoading, setProductLoading] = useState(false);
    
    // Estados para pedidos
    const [orders, setOrders] = useState([]);
    const [orderLoading, setOrderLoading] = useState(false);
    
    // NOVO: Estados para fornecedores
    const [suppliers, setSuppliers] = useState([]);
    const [supplierLoading, setSupplierLoading] = useState(false);
    
    // Estados para estatísticas gerais
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        totalSuppliers: 0 // NOVO
    });
    
    // Estados para estatísticas avançadas
    const [dashboardStats, setDashboardStats] = useState({
        monthSales: { total_orders: 0, total_revenue: 0, month: '' },
        topProduct: null,
        lowStockProducts: [],
        topProductsRanking: []
    });
    const [statsLoading, setStatsLoading] = useState(false);
    
    // Estados para o formulário de produto
    const [productForm, setProductForm] = useState({
        id: null,
        name: '',
        description: '',
        price: '',
        category: '',
        stock_quantity: '',
        image_url: '',
        supplier_id: '', // NOVO
        supplier_sku: '', // NOVO
        cost_price: '' // NOVO
    });
    const [isEditingProduct, setIsEditingProduct] = useState(false);
    
    // NOVO: Estados para o formulário de fornecedor
    const [supplierForm, setSupplierForm] = useState({
        id: null,
        name: '',
        contact_name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'Brasil',
        cnpj: '',
        category: '',
        notes: ''
    });
    const [isEditingSupplier, setIsEditingSupplier] = useState(false);
    
    // Estados para feedback visual
    const [message, setMessage] = useState({ text: '', type: '' });
    
    // Obtemos o token de autenticação
    const { getAuthHeaders } = useAuth();
    
    // Carregamos os dados iniciais quando o componente é montado
    useEffect(() => {
        loadDashboardData();
    }, []);
    
    // Função principal que carrega todos os dados do dashboard
    const loadDashboardData = async () => {
        await Promise.all([
            loadProducts(),
            loadOrders(),
            loadSuppliers(), // NOVA FUNÇÃO
            loadDashboardStats()
        ]);
    };
    
    // NOVA FUNÇÃO: Carregar lista de fornecedores
    const loadSuppliers = async () => {
        try {
            setSupplierLoading(true);
            const response = await fetch('http://localhost:5000/api/suppliers', {
                headers: getAuthHeaders()
            });
            
            const data = await response.json();
            if (data.success) {
                setSuppliers(data.suppliers || []);
                // Atualizamos estatísticas de fornecedores
                setStats(prev => ({
                    ...prev,
                    totalSuppliers: data.suppliers?.length || 0
                }));
            }
        } catch (error) {
            console.error('Erro ao carregar fornecedores:', error);
            showMessage('Erro ao carregar fornecedores', 'error');
        } finally {
            setSupplierLoading(false);
        }
    };
    
    // Função para carregar estatísticas avançadas
    const loadDashboardStats = async () => {
        try {
            setStatsLoading(true);
            const response = await fetch('http://localhost:5000/api/orders/admin/dashboard-stats', {
                headers: getAuthHeaders()
            });
            
            const data = await response.json();
            if (data.success) {
                setDashboardStats({
                    monthSales: data.stats.month_sales || { total_orders: 0, total_revenue: 0, month: '' },
                    topProduct: data.stats.top_product || null,
                    lowStockProducts: data.stats.low_stock_products || [],
                    topProductsRanking: data.stats.top_products_ranking || []
                });
            }
        } catch (error) {
            console.error('Erro ao carregar estatísticas do dashboard:', error);
            showMessage('Erro ao carregar estatísticas avançadas', 'error');
        } finally {
            setStatsLoading(false);
        }
    };
    
    // Função para carregar lista de produtos
    const loadProducts = async () => {
        try {
            setProductLoading(true);
            const response = await fetch('http://localhost:5000/api/products', {
                headers: getAuthHeaders()
            });
            
            const data = await response.json();
            if (data.success) {
                setProducts(data.products || []);
                // Atualizamos estatísticas de produtos
                setStats(prev => ({
                    ...prev,
                    totalProducts: data.products?.length || 0
                }));
            }
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            showMessage('Erro ao carregar produtos', 'error');
        } finally {
            setProductLoading(false);
        }
    };
    
    // Função para carregar lista de pedidos
    const loadOrders = async () => {
        try {
            setOrderLoading(true);
            const response = await fetch('http://localhost:5000/api/orders', {
                headers: getAuthHeaders()
            });
            
            const data = await response.json();
            if (data.success) {
                setOrders(data.orders || []);
                
                // Calculamos estatísticas dos pedidos
                const totalRevenue = data.orders?.reduce((sum, order) => 
                    sum + parseFloat(order.total_amount || 0), 0
                ) || 0;
                
                const pendingCount = data.orders?.filter(order => 
                    order.status === 'pending'
                ).length || 0;
                
                setStats(prev => ({
                    ...prev,
                    totalOrders: data.orders?.length || 0,
                    totalRevenue: totalRevenue.toFixed(2),
                    pendingOrders: pendingCount
                }));
            }
        } catch (error) {
            console.error('Erro ao carregar pedidos:', error);
            showMessage('Erro ao carregar pedidos', 'error');
        } finally {
            setOrderLoading(false);
        }
    };
    
    // Função para mostrar mensagens de feedback
    const showMessage = (text, type = 'info') => {
        setMessage({ text, type });
        // Remove a mensagem automaticamente após 5 segundos
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    };
    
    // ========== FUNÇÕES PARA PRODUTOS ==========
    
    // Função para lidar com mudanças no formulário de produto
    const handleProductFormChange = (e) => {
        const { name, value } = e.target;
        setProductForm(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    // Função para resetar o formulário de produto
    const resetProductForm = () => {
        setProductForm({
            id: null,
            name: '',
            description: '',
            price: '',
            category: '',
            stock_quantity: '',
            image_url: '',
            supplier_id: '',
            supplier_sku: '',
            cost_price: ''
        });
        setIsEditingProduct(false);
    };
    
    // Função para preencher o formulário para edição
    const editProduct = (product) => {
        setProductForm({
            id: product.id,
            name: product.name,
            description: product.description || '',
            price: product.price,
            category: product.category,
            stock_quantity: product.stock_quantity,
            image_url: product.image_url || '',
            supplier_id: product.supplier_id || '',
            supplier_sku: product.supplier_sku || '',
            cost_price: product.cost_price || ''
        });
        setIsEditingProduct(true);
        // Rola até o formulário
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    // Função para submeter o formulário de produto (criar ou editar)
    const handleProductSubmit = async (e) => {
        e.preventDefault();
        
        // Validações básicas
        if (!productForm.name || !productForm.price || !productForm.category) {
            showMessage('Por favor, preencha todos os campos obrigatórios', 'error');
            return;
        }
        
        try {
            const url = isEditingProduct 
                ? `http://localhost:5000/api/products/${productForm.id}`
                : 'http://localhost:5000/api/products';
            
            const method = isEditingProduct ? 'PUT' : 'POST';
            
            const productData = {
                name: productForm.name,
                description: productForm.description,
                price: parseFloat(productForm.price),
                category: productForm.category,
                stock_quantity: parseInt(productForm.stock_quantity) || 0,
                image_url: productForm.image_url
            };
            
            // Adiciona campos do fornecedor apenas se preenchidos
            if (productForm.supplier_id) {
                productData.supplier_id = parseInt(productForm.supplier_id);
            }
            if (productForm.supplier_sku) {
                productData.supplier_sku = productForm.supplier_sku;
            }
            if (productForm.cost_price) {
                productData.cost_price = parseFloat(productForm.cost_price);
            }
            console.log(productData);
            const response = await fetch(url, {
                method: method,
                headers: getAuthHeaders(),
                body: JSON.stringify(productData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                showMessage(
                    isEditingProduct ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!',
                    'success'
                );
                resetProductForm();
                await loadProducts();
                await loadDashboardStats();
            } else {
                showMessage(data.message || 'Erro ao salvar produto', 'error');
            }
        } catch (error) {
            console.error('Erro ao salvar produto:', error);
            showMessage('Erro ao salvar produto', 'error');
        }
    };
    
    // Função para deletar um produto
    const deleteProduct = async (productId) => {
        if (!window.confirm('Tem certeza que deseja deletar este produto?')) {
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            
            const data = await response.json();
            
            if (data.success) {
                showMessage('Produto removido com sucesso!', 'success');
                await loadProducts();
                await loadDashboardStats();
            } else {
                showMessage(data.message || 'Erro ao deletar produto', 'error');
            }
        } catch (error) {
            console.error('Erro ao deletar produto:', error);
            showMessage('Erro ao deletar produto', 'error');
        }
    };
    
    // ========== NOVAS FUNÇÕES PARA FORNECEDORES ==========
    
    // Função para lidar com mudanças no formulário de fornecedor
    const handleSupplierFormChange = (e) => {
        const { name, value } = e.target;
        setSupplierForm(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    // Função para resetar o formulário de fornecedor
    const resetSupplierForm = () => {
        setSupplierForm({
            id: null,
            name: '',
            contact_name: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            state: '',
            zip_code: '',
            country: 'Brasil',
            cnpj: '',
            category: '',
            notes: ''
        });
        setIsEditingSupplier(false);
    };
    
    // Função para preencher o formulário para edição
    const editSupplier = (supplier) => {
        setSupplierForm({
            id: supplier.id,
            name: supplier.name,
            contact_name: supplier.contact_name || '',
            email: supplier.email || '',
            phone: supplier.phone || '',
            address: supplier.address || '',
            city: supplier.city || '',
            state: supplier.state || '',
            zip_code: supplier.zip_code || '',
            country: supplier.country || 'Brasil',
            cnpj: supplier.cnpj || '',
            category: supplier.category || '',
            notes: supplier.notes || ''
        });
        setIsEditingSupplier(true);
        // Rola até o formulário
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    // Função para submeter o formulário de fornecedor (criar ou editar)
    const handleSupplierSubmit = async (e) => {
        e.preventDefault();
        
        // Validações básicas
        if (!supplierForm.name) {
            showMessage('Nome do fornecedor é obrigatório', 'error');
            return;
        }
        
        try {
            const url = isEditingSupplier 
                ? `http://localhost:5000/api/suppliers/${supplierForm.id}`
                : 'http://localhost:5000/api/suppliers';
            
            const method = isEditingSupplier ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: getAuthHeaders(),
                body: JSON.stringify(supplierForm)
            });
            
            const data = await response.json();
            
            if (data.success) {
                showMessage(
                    isEditingSupplier ? 'Fornecedor atualizado com sucesso!' : 'Fornecedor criado com sucesso!',
                    'success'
                );
                resetSupplierForm();
                await loadSuppliers();
            } else {
                showMessage(data.message || 'Erro ao salvar fornecedor', 'error');
            }
        } catch (error) {
            console.error('Erro ao salvar fornecedor:', error);
            showMessage('Erro ao salvar fornecedor', 'error');
        }
    };
    
    // Função para deletar um fornecedor
    const deleteSupplier = async (supplierId) => {
        if (!window.confirm('Tem certeza que deseja deletar este fornecedor?')) {
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:5000/api/suppliers/${supplierId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            
            const data = await response.json();
            
            if (data.success) {
                showMessage('Fornecedor removido com sucesso!', 'success');
                await loadSuppliers();
            } else {
                showMessage(data.message || 'Erro ao deletar fornecedor', 'error');
            }
        } catch (error) {
            console.error('Erro ao deletar fornecedor:', error);
            showMessage('Erro ao deletar fornecedor', 'error');
        }
    };
    
    // Função para desativar um fornecedor
    const deactivateSupplier = async (supplierId) => {
        if (!window.confirm('Tem certeza que deseja desativar este fornecedor?')) {
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:5000/api/suppliers/${supplierId}/deactivate`, {
                method: 'PATCH',
                headers: getAuthHeaders()
            });
            
            const data = await response.json();
            
            if (data.success) {
                showMessage('Fornecedor desativado com sucesso!', 'success');
                await loadSuppliers();
            } else {
                showMessage(data.message || 'Erro ao desativar fornecedor', 'error');
            }
        } catch (error) {
            console.error('Erro ao desativar fornecedor:', error);
            showMessage('Erro ao desativar fornecedor', 'error');
        }
    };
    
    // Função para atualizar status de um pedido
    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({ status: newStatus })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showMessage('Status do pedido atualizado!', 'success');
                await loadOrders();
                await loadDashboardStats();
            } else {
                showMessage(data.message || 'Erro ao atualizar status', 'error');
            }
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            showMessage('Erro ao atualizar status do pedido', 'error');
        }
    };
    
    // Função para formatar valores monetários
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    
    // Função para formatar datas
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    // Função para obter classe CSS baseada no status do pedido
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
    
    // Tradução de status para português
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
    
    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h1>Painel Administrativo</h1>
                <p>Gerencie produtos, pedidos, fornecedores e visualize estatísticas da loja</p>
            </div>
            
            {/* Mensagem de feedback */}
            {message.text && (
                <div className={`message message-${message.type}`}>
                    {message.text}
                </div>
            )}
            
            {/* Navegação por abas */}
            <div className="dashboard-tabs">
                <button 
                    className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    📊 Visão Geral
                </button>
                <button 
                    className={`tab ${activeTab === 'products' ? 'active' : ''}`}
                    onClick={() => setActiveTab('products')}
                >
                    📦 Produtos
                </button>
                <button 
                    className={`tab ${activeTab === 'suppliers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('suppliers')}
                >
                    🏢 Fornecedores
                </button>
                <button 
                    className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    🛒 Pedidos
                </button>
            </div>
            
            {/* Conteúdo da aba ativa */}
            <div className="dashboard-content">
                
                {/* ABA: VISÃO GERAL */}
                {activeTab === 'overview' && (
                    <div className="overview-section">
                        <h2>Estatísticas Gerais</h2>
                        
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">📦</div>
                                <div className="stat-content">
                                    <h3>Total de Produtos</h3>
                                    <p className="stat-value">{stats.totalProducts}</p>
                                </div>
                            </div>
                            
                            <div className="stat-card">
                                <div className="stat-icon">🏢</div>
                                <div className="stat-content">
                                    <h3>Total de Fornecedores</h3>
                                    <p className="stat-value">{stats.totalSuppliers}</p>
                                </div>
                            </div>
                            
                            <div className="stat-card">
                                <div className="stat-icon">🛒</div>
                                <div className="stat-content">
                                    <h3>Total de Pedidos</h3>
                                    <p className="stat-value">{stats.totalOrders}</p>
                                </div>
                            </div>
                            
                            <div className="stat-card">
                                <div className="stat-icon">💰</div>
                                <div className="stat-content">
                                    <h3>Receita Total</h3>
                                    <p className="stat-value">{formatCurrency(stats.totalRevenue)}</p>
                                </div>
                            </div>
                            
                            <div className="stat-card">
                                <div className="stat-icon">⏳</div>
                                <div className="stat-content">
                                    <h3>Pedidos Pendentes</h3>
                                    <p className="stat-value">{stats.pendingOrders}</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* ESTATÍSTICAS AVANÇADAS */}
                        <div className="advanced-stats">
                            <h2>Estatísticas Avançadas</h2>
                            
                            {statsLoading ? (
                                <p className="loading">Carregando estatísticas...</p>
                            ) : (
                                <>
                                    {/* Vendas do Mês */}
                                    <div className="stat-section">
                                        <h3>📅 Vendas de {dashboardStats.monthSales.month}</h3>
                                        <div className="month-sales-card">
                                            <div className="sales-metric">
                                                <span className="metric-label">Pedidos no Mês:</span>
                                                <span className="metric-value">{dashboardStats.monthSales.total_orders}</span>
                                            </div>
                                            <div className="sales-metric">
                                                <span className="metric-label">Receita do Mês:</span>
                                                <span className="metric-value highlight">
                                                    {formatCurrency(dashboardStats.monthSales.total_revenue)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Produto Mais Vendido */}
                                    <div className="stat-section">
                                        <h3>🏆 Produto Mais Vendido</h3>
                                        {dashboardStats.topProduct ? (
                                            <div className="top-product-card">
                                                {dashboardStats.topProduct.image_url && (
                                                    <img 
                                                        src={dashboardStats.topProduct.image_url} 
                                                        alt={dashboardStats.topProduct.name}
                                                        className="product-image"
                                                    />
                                                )}
                                                <div className="product-details">
                                                    <h4>{dashboardStats.topProduct.name}</h4>
                                                    <p className="product-category">{dashboardStats.topProduct.category}</p>
                                                    <div className="product-stats">
                                                        <span>Unidades Vendidas: <strong>{dashboardStats.topProduct.total_sold}</strong></span>
                                                        <span>Em {dashboardStats.topProduct.order_count} pedidos</span>
                                                        <span>Receita: <strong>{formatCurrency(dashboardStats.topProduct.total_revenue)}</strong></span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="empty-state">Nenhuma venda registrada ainda.</p>
                                        )}
                                    </div>
                                    
                                    {/* Top 5 Produtos */}
                                    {dashboardStats.topProductsRanking.length > 0 && (
                                        <div className="stat-section">
                                            <h3>🔝 Top 5 Produtos Mais Vendidos</h3>
                                            <div className="ranking-list">
                                                {dashboardStats.topProductsRanking.map((product, index) => (
                                                    <div key={product.id} className="ranking-item">
                                                        <div className="ranking-position">#{index + 1}</div>
                                                        <div className="ranking-info">
                                                            <span className="ranking-name">{product.name}</span>
                                                            <span className="ranking-category">{product.category}</span>
                                                        </div>
                                                        <div className="ranking-stats">
                                                            <span className="ranking-sold">{product.total_sold} vendidos</span>
                                                            <span className="ranking-revenue">{formatCurrency(product.revenue)}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Produtos com Baixo Estoque */}
                                    <div className="stat-section">
                                        <h3>⚠️ Produtos com Baixo Estoque (menos de 10 unidades)</h3>
                                        {dashboardStats.lowStockProducts.length > 0 ? (
                                            <div className="low-stock-list">
                                                {dashboardStats.lowStockProducts.map(product => (
                                                    <div key={product.id} className="low-stock-item">
                                                        {product.image_url && (
                                                            <img 
                                                                src={product.image_url} 
                                                                alt={product.name}
                                                                className="stock-product-image"
                                                            />
                                                        )}
                                                        <div className="stock-product-info">
                                                            <h4>{product.name}</h4>
                                                            <p>{product.category}</p>
                                                            <p className="price">{formatCurrency(product.price)}</p>
                                                        </div>
                                                        <div className="stock-quantity">
                                                            <span className={product.stock_quantity === 0 ? 'stock-zero' : 'stock-low'}>
                                                                {product.stock_quantity} unidades
                                                            </span>
                                                        </div>
                                                        <button 
                                                            className="btn-restock"
                                                            onClick={() => {
                                                                editProduct(product);
                                                                setActiveTab('products');
                                                            }}
                                                        >
                                                            Reabastecer
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="success-state">✅ Todos os produtos têm estoque adequado!</p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                        
                        <div className="quick-actions">
                            <h3>Ações Rápidas</h3>
                            <div className="action-buttons">
                                <button 
                                    className="action-btn"
                                    onClick={() => setActiveTab('products')}
                                >
                                    ➕ Adicionar Produto
                                </button>
                                <button 
                                    className="action-btn"
                                    onClick={() => setActiveTab('suppliers')}
                                >
                                    🏢 Adicionar Fornecedor
                                </button>
                                <button 
                                    className="action-btn"
                                    onClick={() => setActiveTab('orders')}
                                >
                                    👁️ Ver Pedidos
                                </button>
                                <button 
                                    className="action-btn"
                                    onClick={loadDashboardData}
                                >
                                    🔄 Atualizar Dados
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* ABA: PRODUTOS */}
                {activeTab === 'products' && (
                    <div className="products-section">
                        <h2>{isEditingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}</h2>
                        
                        {/* Formulário de Produto */}
                        <form onSubmit={handleProductSubmit} className="product-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nome do Produto *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={productForm.name}
                                        onChange={handleProductFormChange}
                                        placeholder="Ex: Notebook Gamer"
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Preço (R$) *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={productForm.price}
                                        onChange={handleProductFormChange}
                                        placeholder="Ex: 2500.00"
                                        step="0.01"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Categoria *</label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={productForm.category}
                                        onChange={handleProductFormChange}
                                        placeholder="Ex: Eletrônicos"
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Quantidade em Estoque</label>
                                    <input
                                        type="number"
                                        name="stock_quantity"
                                        value={productForm.stock_quantity}
                                        onChange={handleProductFormChange}
                                        placeholder="Ex: 10"
                                        min="0"
                                    />
                                </div>
                            </div>
                            
                            {/* NOVO: Campos do Fornecedor */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Fornecedor</label>
                                    <select
                                        name="supplier_id"
                                        value={productForm.supplier_id}
                                        onChange={handleProductFormChange}
                                    >
                                        <option value="">Selecione um fornecedor</option>
                                        {suppliers.filter(s => s.status === 'active').map(supplier => (
                                            <option key={supplier.id} value={supplier.id}>
                                                {supplier.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="form-group">
                                    <label>SKU do Fornecedor</label>
                                    <input
                                        type="text"
                                        name="supplier_sku"
                                        value={productForm.supplier_sku}
                                        onChange={handleProductFormChange}
                                        placeholder="Ex: FORN-001"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Preço de Custo (R$)</label>
                                    <input
                                        type="number"
                                        name="cost_price"
                                        value={productForm.cost_price}
                                        onChange={handleProductFormChange}
                                        placeholder="Ex: 1500.00"
                                        step="0.01"
                                        min="0"
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>Descrição</label>
                                <textarea
                                    name="description"
                                    value={productForm.description}
                                    onChange={handleProductFormChange}
                                    placeholder="Descreva o produto..."
                                    rows="4"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>URL da Imagem</label>
                                <input
                                    type="text"
                                    name="image_url"
                                    value={productForm.image_url}
                                    onChange={handleProductFormChange}
                                    placeholder="https://exemplo.com/imagem.jpg"
                                />
                            </div>
                            
                            <div className="form-actions">
                                <button type="submit" className="btn-primary">
                                    {isEditingProduct ? '✅ Salvar Alterações' : '➕ Criar Produto'}
                                </button>
                                {isEditingProduct && (
                                    <button 
                                        type="button" 
                                        className="btn-secondary"
                                        onClick={resetProductForm}
                                    >
                                        ❌ Cancelar
                                    </button>
                                )}
                            </div>
                        </form>
                        
                        {/* Lista de Produtos */}
                        <div className="products-list">
                            <h3>Produtos Cadastrados ({products.length})</h3>
                            
                            {productLoading ? (
                                <p className="loading">Carregando produtos...</p>
                            ) : products.length === 0 ? (
                                <p className="empty-state">Nenhum produto cadastrado ainda.</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="products-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Nome</th>
                                                <th>Categoria</th>
                                                <th>Preço</th>
                                                <th>Estoque</th>
                                                <th>Fornecedor</th>
                                                <th>Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map(product => (
                                                <tr key={product.id}>
                                                    <td>{product.id}</td>
                                                    <td>{product.name}</td>
                                                    <td>{product.category}</td>
                                                    <td>{formatCurrency(product.price)}</td>
                                                    <td>
                                                        <span className={product.stock_quantity > 0 ? 'stock-available' : 'stock-empty'}>
                                                            {product.stock_quantity} unidades
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {product.supplier_name ? (
                                                            <span title={`${product.supplier_name} - ${product.supplier_contact}`}>
                                                                {product.supplier_name}
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted">-</span>
                                                        )}
                                                    </td>
                                                    <td className="actions-cell">
                                                        <button 
                                                            className="btn-edit"
                                                            onClick={() => editProduct(product)}
                                                            title="Editar"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button 
                                                            className="btn-delete"
                                                            onClick={() => deleteProduct(product.id)}
                                                            title="Deletar"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                {/* NOVA ABA: FORNECEDORES */}
                {activeTab === 'suppliers' && (
                    <div className="suppliers-section">
                        <h2>{isEditingSupplier ? 'Editar Fornecedor' : 'Adicionar Novo Fornecedor'}</h2>
                        
                        {/* Formulário de Fornecedor */}
                        <form onSubmit={handleSupplierSubmit} className="product-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nome do Fornecedor *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={supplierForm.name}
                                        onChange={handleSupplierFormChange}
                                        placeholder="Ex: TechImport Brasil LTDA"
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Nome do Contato</label>
                                    <input
                                        type="text"
                                        name="contact_name"
                                        value={supplierForm.contact_name}
                                        onChange={handleSupplierFormChange}
                                        placeholder="Ex: Carlos Silva"
                                    />
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={supplierForm.email}
                                        onChange={handleSupplierFormChange}
                                        placeholder="Ex: vendas@empresa.com.br"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Telefone</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={supplierForm.phone}
                                        onChange={handleSupplierFormChange}
                                        placeholder="Ex: (11) 99999-9999"
                                    />
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>CNPJ</label>
                                    <input
                                        type="text"
                                        name="cnpj"
                                        value={supplierForm.cnpj}
                                        onChange={handleSupplierFormChange}
                                        placeholder="Ex: 12.345.678/0001-90"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Categoria</label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={supplierForm.category}
                                        onChange={handleSupplierFormChange}
                                        placeholder="Ex: Eletrônicos"
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>Endereço</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={supplierForm.address}
                                    onChange={handleSupplierFormChange}
                                    placeholder="Ex: Av. Paulista, 1000"
                                />
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Cidade</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={supplierForm.city}
                                        onChange={handleSupplierFormChange}
                                        placeholder="Ex: São Paulo"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Estado</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={supplierForm.state}
                                        onChange={handleSupplierFormChange}
                                        placeholder="Ex: SP"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>CEP</label>
                                    <input
                                        type="text"
                                        name="zip_code"
                                        value={supplierForm.zip_code}
                                        onChange={handleSupplierFormChange}
                                        placeholder="Ex: 01310-100"
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>Observações</label>
                                <textarea
                                    name="notes"
                                    value={supplierForm.notes}
                                    onChange={handleSupplierFormChange}
                                    placeholder="Observações sobre o fornecedor..."
                                    rows="3"
                                />
                            </div>
                            
                            <div className="form-actions">
                                <button type="submit" className="btn-primary">
                                    {isEditingSupplier ? '✅ Salvar Alterações' : '➕ Criar Fornecedor'}
                                </button>
                                {isEditingSupplier && (
                                    <button 
                                        type="button" 
                                        className="btn-secondary"
                                        onClick={resetSupplierForm}
                                    >
                                        ❌ Cancelar
                                    </button>
                                )}
                            </div>
                        </form>
                        
                        {/* Lista de Fornecedores */}
                        <div className="suppliers-list">
                            <h3>Fornecedores Cadastrados ({suppliers.length})</h3>
                            
                            {supplierLoading ? (
                                <p className="loading">Carregando fornecedores...</p>
                            ) : suppliers.length === 0 ? (
                                <p className="empty-state">Nenhum fornecedor cadastrado ainda.</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="products-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Nome</th>
                                                <th>Contato</th>
                                                <th>Email</th>
                                                <th>Telefone</th>
                                                <th>Categoria</th>
                                                <th>Status</th>
                                                <th>Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {suppliers.map(supplier => (
                                                <tr key={supplier.id}>
                                                    <td>{supplier.id}</td>
                                                    <td>{supplier.name}</td>
                                                    <td>{supplier.contact_name || '-'}</td>
                                                    <td>{supplier.email || '-'}</td>
                                                    <td>{supplier.phone || '-'}</td>
                                                    <td>{supplier.category || '-'}</td>
                                                    <td>
                                                        <span className={`status-badge ${supplier.status === 'active' ? 'status-delivered' : 'status-cancelled'}`}>
                                                            {supplier.status === 'active' ? 'Ativo' : 'Inativo'}
                                                        </span>
                                                    </td>
                                                    <td className="actions-cell">
                                                        <button 
                                                            className="btn-edit"
                                                            onClick={() => editSupplier(supplier)}
                                                            title="Editar"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button 
                                                            className="btn-deactivate"
                                                            onClick={() => deactivateSupplier(supplier.id)}
                                                            title="Desativar"
                                                        >
                                                            ⏸️
                                                        </button>
                                                    
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                {/* ABA: PEDIDOS */}
                {activeTab === 'orders' && (
                    <div className="orders-section">
                        <h2>Gerenciar Pedidos ({orders.length})</h2>
                        
                        {orderLoading ? (
                            <p className="loading">Carregando pedidos...</p>
                        ) : orders.length === 0 ? (
                            <p className="empty-state">Nenhum pedido realizado ainda.</p>
                        ) : (
                            <div className="orders-list">
                                {orders.map(order => (
                                    <div key={order.id} className="order-card">
                                        <div className="order-header">
                                            <div className="order-info">
                                                <h3>Pedido #{order.id}</h3>
                                                <p className="order-customer">Cliente: {order.customer_name}</p>
                                                <p className="order-email">{order.customer_email}</p>
                                            </div>
                                            <div className="order-meta">
                                                <p className="order-date">{formatDate(order.created_at)}</p>
                                                <p className="order-total">{formatCurrency(order.total_amount)}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="order-details">
                                            <p><strong>Total de itens:</strong> {order.item_count}</p>
                                            {order.shipping_address && (
                                                <p><strong>Endereço:</strong> {order.shipping_address}</p>
                                            )}
                                        </div>
                                        
                                        <div className="order-footer">
                                            <div className="order-status">
                                                <span className={`status-badge ${getStatusClass(order.status)}`}>
                                                    {translateStatus(order.status)}
                                                </span>
                                            </div>
                                            
                                            <div className="order-actions">
                                                <label>Atualizar Status:</label>
                                                <select 
                                                    value={order.status}
                                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                    className="status-select"
                                                >
                                                    <option value="pending">Pendente</option>
                                                    <option value="confirmed">Confirmado</option>
                                                    <option value="shipped">Enviado</option>
                                                    <option value="delivered">Entregue</option>
                                                    <option value="cancelled">Cancelado</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                
            </div>
        </div>
    );
};

export default AdminDashboard;