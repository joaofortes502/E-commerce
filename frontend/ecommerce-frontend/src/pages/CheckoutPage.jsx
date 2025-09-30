import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './CheckoutPage.css';

const CheckoutPage = () => {
    // Estados do formulário de checkout
    const [shippingAddress, setShippingAddress] = useState('');
    const [notes, setNotes] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);
    
    // Estados de controle de UI
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [createdOrderId, setCreatedOrderId] = useState(null);
    
    // Hooks de navegação e contextos
    const navigate = useNavigate();
    const { isAuthenticated, user, getAuthHeaders } = useAuth();
    const { items, subtotal, itemCount, loadCart, clearCart: clearCartContext } = useCart();
    
    // Verificamos se o usuário está autenticado ao montar o componente
    useEffect(() => {
        if (!isAuthenticated()) {
            // Se não estiver logado, redirecionamos para login
            // Salvamos a intenção de ir para checkout para depois do login
            navigate('/login?redirect=checkout');
        }
    }, [isAuthenticated, navigate]);
    
    // Verificamos se o carrinho está vazio
    useEffect(() => {
        if (items.length === 0 && !orderSuccess) {
            // Se não há itens e não acabamos de fazer um pedido, voltamos para o carrinho
            navigate('/cart');
        }
    }, [items.length, orderSuccess, navigate]);
    
    // Função principal que processa o checkout
    const handleCheckout = async (e) => {
        e.preventDefault();
        
        // Validações no frontend antes de enviar
        if (!shippingAddress.trim()) {
            setError('Por favor, informe o endereço de entrega');
            return;
        }
        
        if (!agreeTerms) {
            setError('Você precisa concordar com os termos e condições');
            return;
        }
        
        // Verificação final: carrinho não pode estar vazio
        if (items.length === 0) {
            setError('Seu carrinho está vazio');
            return;
        }
        
        try {
            setLoading(true);
            setError('');
            
            // Fazemos a requisição para criar o pedido
            const response = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    shipping_address: shippingAddress.trim(),
                    notes: notes.trim()
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                // Tratamos diferentes tipos de erro com mensagens específicas
                if (response.status === 409) {
                    // Conflito - geralmente problema de estoque
                    setError(data.message || 'Alguns itens não estão mais disponíveis. Por favor, revise seu carrinho.');
                    
                    // Se há informações sobre itens com problema, mostramos
                    if (data.cart_issues) {
                        const issueItems = data.cart_issues.items_with_issues || [];
                        if (issueItems.length > 0) {
                            const itemNames = issueItems.map(item => item.product_name).join(', ');
                            setError(`Os seguintes itens não estão disponíveis: ${itemNames}`);
                        }
                    }
                    
                    // Recarregamos o carrinho para atualizar informações
                    await loadCart();
                } else if (response.status === 400) {
                    setError(data.message || 'Verifique os dados do pedido');
                } else {
                    setError('Não foi possível processar seu pedido. Por favor, tente novamente.');
                }
                return;
            }
            
            // Se chegou aqui, o pedido foi criado com sucesso!
            if (data.success && data.order) {
                setOrderSuccess(true);
                setCreatedOrderId(data.order.id);
                
                // Limpamos o carrinho localmente
                await clearCartContext();
                
                // Mostramos aviso se houve mudança de preços
                if (data.price_warning) {
                    console.warn('Aviso de preço:', data.price_warning);
                }
            }
            
        } catch (error) {
            console.error('Erro ao processar checkout:', error);
            setError('Erro ao processar seu pedido. Verifique sua conexão e tente novamente.');
        } finally {
            setLoading(false);
        }
    };
    
    // Função para formatar valores monetários
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };
    
    // Função para calcular taxa de entrega (simplificado - poderia ser baseado em CEP)
    const calculateShipping = () => {
        // Por enquanto, frete fixo ou grátis acima de certo valor
        const freeShippingThreshold = 100;
        const shippingFee = 15;
        
        return parseFloat(subtotal) >= freeShippingThreshold ? 0 : shippingFee;
    };
    
    // Função para calcular total final incluindo frete
    const calculateTotal = () => {
        return parseFloat(subtotal) + calculateShipping();
    };
    
    // Se o pedido foi criado com sucesso, mostramos página de confirmação
    if (orderSuccess) {
        return (
            <div className="checkout-page">
                <div className="success-container">
                    <div className="success-icon">✅</div>
                    <h1>Pedido Realizado com Sucesso!</h1>
                    <p className="success-message">
                        Seu pedido <strong>#{createdOrderId}</strong> foi confirmado e está sendo processado.
                    </p>
                    
                    <div className="success-details">
                        <div className="detail-item">
                            <span className="detail-label">Total do Pedido:</span>
                            <span className="detail-value">{formatCurrency(calculateTotal())}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Endereço de Entrega:</span>
                            <span className="detail-value">{shippingAddress}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Status:</span>
                            <span className="detail-value status-pending">Pendente</span>
                        </div>
                    </div>
                    
                    <div className="success-info">
                        <p>📧 Enviamos um email de confirmação para <strong>{user?.email}</strong></p>
                        <p>📦 Você pode acompanhar o status do seu pedido na área "Meus Pedidos"</p>
                    </div>
                    
                    <div className="success-actions">
                        <Link to="/orders" className="btn-view-orders">
                            Ver Meus Pedidos
                        </Link>
                        <Link to="/" className="btn-continue-shopping">
                            Continuar Comprando
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
    
    // Renderização principal da página de checkout
    return (
        <div className="checkout-page">
            <div className="checkout-container">
                {/* Cabeçalho */}
                <div className="checkout-header">
                    <h1>Finalizar Pedido</h1>
                    <p>Revise seu pedido e informe o endereço de entrega</p>
                </div>
                
                {/* Mensagem de erro se houver */}
                {error && (
                    <div className="error-message">
                        <span className="error-icon">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}
                
                <div className="checkout-content">
                    {/* Coluna da esquerda - Formulário */}
                    <div className="checkout-form-section">
                        <form onSubmit={handleCheckout}>
                            {/* Informações do cliente */}
                            <div className="form-section">
                                <h2>👤 Suas Informações</h2>
                                <div className="info-display">
                                    <div className="info-item">
                                        <span className="info-label">Nome:</span>
                                        <span className="info-value">{user?.name}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Email:</span>
                                        <span className="info-value">{user?.email}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Endereço de entrega */}
                            <div className="form-section">
                                <h2>📍 Endereço de Entrega</h2>
                                <div className="form-group">
                                    <label htmlFor="shippingAddress">
                                        Endereço Completo *
                                    </label>
                                    <textarea
                                        id="shippingAddress"
                                        value={shippingAddress}
                                        onChange={(e) => setShippingAddress(e.target.value)}
                                        placeholder="Rua, número, complemento, bairro, cidade, estado, CEP"
                                        rows="4"
                                        required
                                        disabled={loading}
                                    />
                                    <span className="field-hint">
                                        Informe seu endereço completo para entrega
                                    </span>
                                </div>
                            </div>
                            
                            {/* Observações adicionais */}
                            <div className="form-section">
                                <h2>📝 Observações (opcional)</h2>
                                <div className="form-group">
                                    <label htmlFor="notes">
                                        Informações adicionais
                                    </label>
                                    <textarea
                                        id="notes"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Ex: Entregar após as 18h, portão azul, etc."
                                        rows="3"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            
                            {/* Método de pagamento (simplificado) */}
                            <div className="form-section">
                                <h2>💳 Método de Pagamento</h2>
                                <div className="payment-info">
                                    <p className="info-text">
                                        ℹ️ O pagamento será processado na entrega.
                                        Você pode pagar em dinheiro ou cartão.
                                    </p>
                                </div>
                            </div>
                            
                            {/* Termos e condições */}
                            <div className="form-section">
                                <div className="checkbox-group">
                                    <input
                                        type="checkbox"
                                        id="agreeTerms"
                                        checked={agreeTerms}
                                        onChange={(e) => setAgreeTerms(e.target.checked)}
                                        disabled={loading}
                                    />
                                    <label htmlFor="agreeTerms">
                                        Concordo com os <Link to="/terms" target="_blank">termos e condições</Link> e 
                                        a <Link to="/privacy" target="_blank">política de privacidade</Link>
                                    </label>
                                </div>
                            </div>
                            
                            {/* Botão de finalizar */}
                            <button 
                                type="submit" 
                                className="btn-finalize"
                                disabled={loading || !agreeTerms}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-small"></span>
                                        Processando...
                                    </>
                                ) : (
                                    <>
                                        🛒 Finalizar Pedido
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                    
                    {/* Coluna da direita - Resumo do Pedido */}
                    <div className="order-summary-section">
                        <div className="summary-card">
                            <h2>📋 Resumo do Pedido</h2>
                            
                            {/* Lista de itens */}
                            <div className="summary-items">
                                {items.map(item => (
                                    <div key={item.product_id} className="summary-item">
                                        <div className="item-image">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.product_name} />
                                            ) : (
                                                <div className="placeholder-image">📦</div>
                                            )}
                                        </div>
                                        <div className="item-details">
                                            <h4>{item.product_name}</h4>
                                            <p className="item-quantity">Qtd: {item.quantity}</p>
                                        </div>
                                        <div className="item-price">
                                            {formatCurrency(item.subtotal)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Cálculos */}
                            <div className="summary-calculations">
                                <div className="calc-row">
                                    <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'itens'}):</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="calc-row">
                                    <span>Frete:</span>
                                    <span className={calculateShipping() === 0 ? 'free-shipping' : ''}>
                                        {calculateShipping() === 0 ? 'GRÁTIS' : formatCurrency(calculateShipping())}
                                    </span>
                                </div>
                                {calculateShipping() > 0 && parseFloat(subtotal) < 100 && (
                                    <div className="shipping-tip">
                                        💡 Falta {formatCurrency(100 - parseFloat(subtotal))} para frete grátis!
                                    </div>
                                )}
                                <div className="calc-row total-row">
                                    <span>Total:</span>
                                    <span className="total-value">{formatCurrency(calculateTotal())}</span>
                                </div>
                            </div>
                            
                            {/* Informações de segurança */}
                            <div className="security-badges">
                                <div className="badge">
                                    <span className="badge-icon">🔒</span>
                                    <span className="badge-text">Compra Segura</span>
                                </div>
                                <div className="badge">
                                    <span className="badge-icon">📦</span>
                                    <span className="badge-text">Entrega Garantida</span>
                                </div>
                                <div className="badge">
                                    <span className="badge-icon">↩️</span>
                                    <span className="badge-text">7 dias para troca</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Botão voltar para carrinho */}
                        <Link to="/cart" className="btn-back-to-cart">
                            ← Voltar para o Carrinho
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;