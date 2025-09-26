import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Criamos o contexto do carrinho
const CartContext = createContext();

// Hook personalizado para usar o contexto do carrinho
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart deve ser usado dentro de CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    // Estados do carrinho
    const [items, setItems] = useState([]); // Itens no carrinho
    const [loading, setLoading] = useState(false); // Loading durante operações
    const [summary, setSummary] = useState({
        item_count: 0,
        total_quantity: 0,
        subtotal: '0.00',
        has_items: false
    });

    // Obtemos funções e dados do contexto de autenticação
    const { getAuthHeaders, isAuthenticated } = useAuth();

    // Efeito que carrega o carrinho quando o componente é montado
    useEffect(() => {
        loadCart();
    }, [isAuthenticated]); // Recarrega quando status de autenticação muda

    // Função para carregar carrinho do servidor
    const loadCart = async () => {
        try {
            setLoading(true);
            
            const response = await fetch('http://localhost:5000/api/cart', {
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.success && data.cart) {
                    setItems(data.cart.items || []);
                    setSummary({
                        item_count: data.cart.item_count || 0,
                        total_quantity: data.cart.total_quantity || 0,
                        subtotal: data.cart.subtotal || '0.00',
                        has_items: (data.cart.item_count || 0) > 0
                    });
                }
            } else {
                // Se falhar ao carregar carrinho, iniciamos vazio
                console.warn('Não foi possível carregar o carrinho');
                initializeEmptyCart();
            }
        } catch (error) {
            console.error('Erro ao carregar carrinho:', error);
            initializeEmptyCart();
        } finally {
            setLoading(false);
        }
    };

    // Função auxiliar para inicializar carrinho vazio
    const initializeEmptyCart = () => {
        setItems([]);
        setSummary({
            item_count: 0,
            total_quantity: 0,
            subtotal: '0.00',
            has_items: false
        });
    };

    // Função para adicionar item ao carrinho
    const addItem = async (productId, quantity = 1) => {
        try {
            setLoading(true);
            
            const response = await fetch('http://localhost:5000/api/cart/items', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    product_id: productId,
                    quantity: quantity
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao adicionar item');
            }

            if (data.success && data.cart) {
                // Atualizamos o estado com o carrinho atualizado do servidor
                setItems(data.cart.items || []);
                setSummary({
                    item_count: data.cart.item_count || 0,
                    total_quantity: data.cart.total_quantity || 0,
                    subtotal: data.cart.subtotal || '0.00',
                    has_items: (data.cart.item_count || 0) > 0
                });
                
                return {
                    success: true,
                    message: data.message,
                    item_added: data.item_added
                };
            }

        } catch (error) {
            console.error('Erro ao adicionar item ao carrinho:', error);
            return {
                success: false,
                message: error.message || 'Erro ao adicionar item ao carrinho'
            };
        } finally {
            setLoading(false);
        }
    };

    // Função para atualizar quantidade de um item
    const updateItemQuantity = async (productId, newQuantity) => {
        try {
            setLoading(true);

            const response = await fetch(`http://localhost:5000/api/cart/items/${productId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    quantity: newQuantity
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao atualizar quantidade');
            }

            if (data.success && data.cart) {
                setItems(data.cart.items || []);
                setSummary({
                    item_count: data.cart.item_count || 0,
                    total_quantity: data.cart.total_quantity || 0,
                    subtotal: data.cart.subtotal || '0.00',
                    has_items: (data.cart.item_count || 0) > 0
                });
                
                return {
                    success: true,
                    message: data.message
                };
            }

        } catch (error) {
            console.error('Erro ao atualizar quantidade:', error);
            return {
                success: false,
                message: error.message || 'Erro ao atualizar quantidade'
            };
        } finally {
            setLoading(false);
        }
    };

    // Função para remover item do carrinho
    const removeItem = async (productId) => {
        try {
            setLoading(true);

            const response = await fetch(`http://localhost:5000/api/cart/items/${productId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao remover item');
            }

            if (data.success && data.cart) {
                setItems(data.cart.items || []);
                setSummary({
                    item_count: data.cart.item_count || 0,
                    total_quantity: data.cart.total_quantity || 0,
                    subtotal: data.cart.subtotal || '0.00',
                    has_items: (data.cart.item_count || 0) > 0
                });
                
                return {
                    success: true,
                    message: data.message
                };
            }

        } catch (error) {
            console.error('Erro ao remover item:', error);
            return {
                success: false,
                message: error.message || 'Erro ao remover item'
            };
        } finally {
            setLoading(false);
        }
    };

    // Função para limpar todo o carrinho
    const clearCart = async () => {
        try {
            setLoading(true);

            const response = await fetch('http://localhost:5000/api/cart', {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao limpar carrinho');
            }

            if (data.success) {
                initializeEmptyCart();
                
                return {
                    success: true,
                    message: data.message
                };
            }

        } catch (error) {
            console.error('Erro ao limpar carrinho:', error);
            return {
                success: false,
                message: error.message || 'Erro ao limpar carrinho'
            };
        } finally {
            setLoading(false);
        }
    };

    // Função para obter resumo rápido do carrinho 
    const getCartSummary = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/cart/summary', {
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.summary) {
                    setSummary(data.summary);
                    return data.summary;
                }
            }
        } catch (error) {
            console.error('Erro ao obter resumo do carrinho:', error);
        }
        
        return summary; // Retorna o resumo atual em caso de erro
    };

    // Função para verificar se um produto específico está no carrinho
    const isItemInCart = (productId) => {
        return items.some(item => item.product_id === parseInt(productId));
    };

    // Função para obter quantidade de um produto específico no carrinho
    const getItemQuantity = (productId) => {
        const item = items.find(item => item.product_id === parseInt(productId));
        return item ? item.quantity : 0;
    };

    // Função para obter item específico do carrinho
    const getItem = (productId) => {
        return items.find(item => item.product_id === parseInt(productId));
    };

    // Função para calcular total de itens únicos no carrinho
    const getUniqueItemsCount = () => {
        return items.length;
    };

    // Função para calcular total de itens considerando quantidades
    const getTotalItemsCount = () => {
        return items.reduce((total, item) => total + item.quantity, 0);
    };

    // Função para verificar se há problemas no carrinho (estoque, preços)
    const hasCartIssues = () => {
        return items.some(item => 
            item.stock_available === 0 || 
            item.price_changed === 1
        );
    };

    // Função para obter itens com problemas
    const getItemsWithIssues = () => {
        return {
            stock_issues: items.filter(item => item.stock_available === 0),
            price_changes: items.filter(item => item.price_changed === 1)
        };
    };

    // Valor fornecido pelo contexto
    const value = {
        // Estados
        items,
        loading,
        summary,
        
        // Funções principais
        loadCart,
        addItem,
        updateItemQuantity,
        removeItem,
        clearCart,
        
        // Funções utilitárias
        getCartSummary,
        isItemInCart,
        getItemQuantity,
        getItem,
        getUniqueItemsCount,
        getTotalItemsCount,
        
        // Funções para verificar problemas
        hasCartIssues,
        getItemsWithIssues,
        
        // Propriedades derivadas para conveniência
        isEmpty: summary.item_count === 0,
        hasItems: summary.has_items,
        itemCount: summary.item_count,
        totalQuantity: summary.total_quantity,
        subtotal: summary.subtotal
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};