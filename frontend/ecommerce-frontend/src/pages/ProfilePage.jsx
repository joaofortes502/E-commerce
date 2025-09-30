import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
    // Obtém funções e dados do contexto de autenticação
    const { user, token, updateUser, getAuthHeaders } = useAuth();

    // Estados para controlar o modo de edição e os dados do formulário
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const [errors, setErrors] = useState({});

    // Carrega os dados do usuário no formulário quando o componente é montado
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || ''
            });
        }
    }, [user]);

    // Função para atualizar os campos do formulário conforme o usuário digita
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Limpa erros específicos do campo quando o usuário começa a editar
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Validações do formulário antes de enviar
    const validateForm = () => {
        const newErrors = {};

        // Valida o nome - deve ter pelo menos 2 caracteres
        if (!formData.name.trim()) {
            newErrors.name = 'Nome é obrigatório';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
        }

        // Valida o email usando uma expressão regular
        if (!formData.email) {
            newErrors.email = 'E-mail é obrigatório';
        } else if (!isValidEmail(formData.email)) {
            newErrors.email = 'Formato de e-mail inválido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Função auxiliar para validar formato de email
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Mostra notificações temporárias para o usuário
    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });
        // Remove a notificação automaticamente após 4 segundos
        setTimeout(() => setNotification(null), 4000);
    };

    // Cancela a edição e restaura os valores originais
    const handleCancelEdit = () => {
        setIsEditing(false);
        setFormData({
            name: user.name || '',
            email: user.email || ''
        });
        setErrors({});
    };

    // Salva as alterações no perfil
    const handleSaveProfile = async (e) => {
        e.preventDefault();

        // Valida o formulário antes de enviar
        if (!validateForm()) {
            showNotification('Por favor, corrija os erros antes de salvar', 'error');
            return;
        }

        // Verifica se houve alguma mudança nos dados
        if (formData.name === user.name && formData.email === user.email) {
            showNotification('Nenhuma alteração foi feita', 'info');
            setIsEditing(false);
            return;
        }

        try {
            setLoading(true);

            // Faz a requisição para atualizar o perfil no backend
            const response = await fetch('http://localhost:5000/api/auth/profile', {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim().toLowerCase()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao atualizar perfil');
            }

            // Atualiza o contexto com os novos dados do usuário
            if (data.success && data.user) {
                updateUser(data.user);
                setIsEditing(false);
                showNotification('Perfil atualizado com sucesso!', 'success');
            }

        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            showNotification(error.message || 'Erro ao atualizar perfil', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Formata a data de criação da conta para exibição
    const formatDate = (dateString) => {
        if (!dateString) return 'Não disponível';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    // Se não houver usuário carregado, mostra um loading
    if (!user) {
        return (
            <div className="profile-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Carregando perfil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="container">
                {/* Notificação flutuante */}
                {notification && (
                    <div className={`notification ${notification.type}`}>
                        {notification.type === 'success' && '✅ '}
                        {notification.type === 'error' && '⚠️ '}
                        {notification.type === 'info' && 'ℹ️ '}
                        {notification.message}
                    </div>
                )}

                {/* Cabeçalho da página */}
                <div className="page-header">
                    <h1>Meu Perfil</h1>
                    <p>Gerencie suas informações pessoais</p>
                </div>

                <div className="profile-content">
                    {/* Card principal do perfil */}
                    <div className="profile-card">
                        {/* Avatar e informações básicas */}
                        <div className="profile-header">
                            <div className="avatar-section">
                                <div className="avatar">
                                    <span className="avatar-icon">
                                        {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
                                    </span>
                                </div>
                                <div className="user-basic-info">
                                    <h2>{user.name}</h2>
                                    <p className="user-email">{user.email}</p>
                                    <span className={`user-badge ${user.type}`}>
                                        {user.type === 'admin' ? '👑 Administrador' : '👤 Cliente'}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Botão de editar/cancelar */}
                            {!isEditing && (
                                <button 
                                    onClick={() => setIsEditing(true)} 
                                    className="edit-button"
                                >
                                    ✏️ Editar Perfil
                                </button>
                            )}
                        </div>

                        {/* Formulário de edição ou visualização */}
                        <div className="profile-body">
                            {isEditing ? (
                                /* Modo de edição */
                                <form onSubmit={handleSaveProfile} className="edit-form">
                                    <div className="form-section">
                                        <h3>Informações Pessoais</h3>
                                        
                                        {/* Campo de nome */}
                                        <div className="form-group">
                                            <label htmlFor="name">Nome Completo</label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                disabled={loading}
                                                className={errors.name ? 'error' : ''}
                                                placeholder="Seu nome completo"
                                            />
                                            {errors.name && (
                                                <span className="error-text">{errors.name}</span>
                                            )}
                                        </div>

                                        {/* Campo de email */}
                                        <div className="form-group">
                                            <label htmlFor="email">E-mail</label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                disabled={loading}
                                                className={errors.email ? 'error' : ''}
                                                placeholder="seu@email.com"
                                            />
                                            {errors.email && (
                                                <span className="error-text">{errors.email}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Botões de ação do formulário */}
                                    <div className="form-actions">
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            disabled={loading}
                                            className="cancel-button"
                                        >
                                            ✕ Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="save-button"
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="button-spinner"></span>
                                                    Salvando...
                                                </>
                                            ) : (
                                                <>💾 Salvar Alterações</>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                /* Modo de visualização */
                                <div className="info-view">
                                    <div className="info-section">
                                        <h3>Informações da Conta</h3>
                                        
                                        <div className="info-grid">
                                            <div className="info-item">
                                                <span className="info-label">
                                                    <span className="info-icon">👤</span>
                                                    Nome Completo
                                                </span>
                                                <span className="info-value">{user.name}</span>
                                            </div>

                                            <div className="info-item">
                                                <span className="info-label">
                                                    <span className="info-icon">📧</span>
                                                    E-mail
                                                </span>
                                                <span className="info-value">{user.email}</span>
                                            </div>

                                            <div className="info-item">
                                                <span className="info-label">
                                                    <span className="info-icon">🏷️</span>
                                                    Tipo de Conta
                                                </span>
                                                <span className="info-value">
                                                    {user.type === 'admin' ? 'Administrador' : 'Cliente'}
                                                </span>
                                            </div>

                                            <div className="info-item">
                                                <span className="info-label">
                                                    <span className="info-icon">📅</span>
                                                    Membro desde
                                                </span>
                                                <span className="info-value">
                                                    {formatDate(user.created_at)}
                                                </span>
                                            </div>

                                            <div className="info-item">
                                                <span className="info-label">
                                                    <span className="info-icon">🆔</span>
                                                    ID do Usuário
                                                </span>
                                                <span className="info-value">#{user.id}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Card de ações adicionais */}
                    <div className="actions-card">
                        <h3>Ações Rápidas</h3>
                        <div className="quick-actions">
                            <a href="/orders" className="action-link">
                                <span className="action-icon">📋</span>
                                <div className="action-content">
                                    <strong>Meus Pedidos</strong>
                                    <small>Visualize seu histórico de compras</small>
                                </div>
                            </a>

                            <a href="/cart" className="action-link">
                                <span className="action-icon">🛒</span>
                                <div className="action-content">
                                    <strong>Carrinho</strong>
                                    <small>Veja os itens no seu carrinho</small>
                                </div>
                            </a>

                            {user.type === 'admin' && (
                                <a href="/admin" className="action-link admin">
                                    <span className="action-icon">👑</span>
                                    <div className="action-content">
                                        <strong>Painel Admin</strong>
                                        <small>Gerenciar produtos e pedidos</small>
                                    </div>
                                </a>
                            )}

                            <a href="/" className="action-link">
                                <span className="action-icon">🏠</span>
                                <div className="action-content">
                                    <strong>Página Inicial</strong>
                                    <small>Voltar para a loja</small>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .profile-page {
                    min-height: calc(100vh - 200px);
                    padding: 2rem 0;
                    background-color: #f8f9fa;
                }

                .container {
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 0 1rem;
                }

                /* Notificação */
                .notification {
                    position: fixed;
                    top: 90px;
                    right: 20px;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 500;
                    z-index: 1000;
                    animation: slideInRight 0.3s ease-out;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    max-width: 400px;
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

                .notification.info {
                    background-color: #d1ecf1;
                    color: #0c5460;
                    border: 1px solid #bee5eb;
                }

                /* Cabeçalho da página */
                .page-header {
                    margin-bottom: 2rem;
                }

                .page-header h1 {
                    font-size: 2.5rem;
                    color: #333;
                    margin-bottom: 0.5rem;
                    font-weight: 700;
                }

                .page-header p {
                    color: #666;
                    font-size: 1.1rem;
                }

                /* Layout do conteúdo */
                .profile-content {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 2rem;
                }

                /* Card principal do perfil */
                .profile-card {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }

                .profile-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }

                .avatar-section {
                    display: flex;
                    gap: 1.5rem;
                    align-items: center;
                }

                .avatar {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.2);
                    border: 4px solid rgba(255, 255, 255, 0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: white;
                    flex-shrink: 0;
                }

                .user-basic-info h2 {
                    color: white;
                    font-size: 1.75rem;
                    margin-bottom: 0.5rem;
                }

                .user-email {
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 1rem;
                    margin-bottom: 0.75rem;
                }

                .user-badge {
                    display: inline-block;
                    padding: 0.35rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 600;
                }

                .user-badge.admin {
                    background-color: rgba(255, 215, 0, 0.3);
                    color: #ffd700;
                    border: 1px solid rgba(255, 215, 0, 0.5);
                }

                .user-badge.client {
                    background-color: rgba(255, 255, 255, 0.2);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }

                .edit-button {
                    padding: 0.75rem 1.5rem;
                    background: white;
                    color: #667eea;
                    border: none;
                    border-radius: 25px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }

                .edit-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                /* Corpo do perfil */
                .profile-body {
                    padding: 2rem;
                }

                /* Formulário de edição */
                .edit-form {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                .form-section h3 {
                    margin-bottom: 1.5rem;
                    color: #333;
                    font-size: 1.3rem;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    margin-bottom: 1.5rem;
                }

                .form-group label {
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 0.5rem;
                    font-size: 0.95rem;
                }

                .form-group input {
                    padding: 0.875rem;
                    border: 2px solid #e9ecef;
                    border-radius: 8px;
                    font-size: 1rem;
                    transition: all 0.2s ease;
                }

                .form-group input:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }

                .form-group input.error {
                    border-color: #dc3545;
                }

                .form-group input:disabled {
                    background-color: #f8f9fa;
                    cursor: not-allowed;
                }

                .error-text {
                    color: #dc3545;
                    font-size: 0.85rem;
                    margin-top: 0.25rem;
                }

                .form-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: flex-end;
                    padding-top: 1rem;
                    border-top: 1px solid #e9ecef;
                }

                .cancel-button,
                .save-button {
                    padding: 0.875rem 2rem;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .cancel-button {
                    background-color: #6c757d;
                    color: white;
                }

                .cancel-button:hover:not(:disabled) {
                    background-color: #5a6268;
                }

                .save-button {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }

                .save-button:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                }

                .cancel-button:disabled,
                .save-button:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .button-spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid transparent;
                    border-top: 2px solid white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                /* Visualização de informações */
                .info-view {
                    padding: 1rem 0;
                }

                .info-section h3 {
                    margin-bottom: 1.5rem;
                    color: #333;
                    font-size: 1.3rem;
                }

                .info-grid {
                    display: grid;
                    gap: 1.5rem;
                }

                .info-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    padding: 1rem;
                    background-color: #f8f9fa;
                    border-radius: 8px;
                    border-left: 4px solid #667eea;
                }

                .info-label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #666;
                    font-size: 0.9rem;
                    font-weight: 500;
                }

                .info-icon {
                    font-size: 1.2rem;
                }

                .info-value {
                    color: #333;
                    font-size: 1.1rem;
                    font-weight: 600;
                }

                /* Card de ações */
                .actions-card {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    padding: 2rem;
                    height: fit-content;
                }

                .actions-card h3 {
                    margin-bottom: 1.5rem;
                    color: #333;
                    font-size: 1.3rem;
                }

                .quick-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .action-link {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    background-color: #f8f9fa;
                    border-radius: 8px;
                    text-decoration: none;
                    transition: all 0.3s ease;
                    border: 2px solid transparent;
                }

                .action-link:hover {
                    background-color: #e9ecef;
                    border-color: #667eea;
                    transform: translateX(4px);
                }

                .action-link.admin {
                    background-color: #fff3cd;
                }

                .action-link.admin:hover {
                    background-color: #ffe8a1;
                    border-color: #ffd700;
                }

                .action-icon {
                    font-size: 1.5rem;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: white;
                    border-radius: 8px;
                    flex-shrink: 0;
                }

                .action-content strong {
                    display: block;
                    color: #333;
                    margin-bottom: 0.25rem;
                }

                .action-content small {
                    color: #666;
                    font-size: 0.85rem;
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
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(100px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                /* Responsividade */
                @media (max-width: 968px) {
                    .profile-content {
                        grid-template-columns: 1fr;
                    }

                    .notification {
                        right: 10px;
                        left: 10px;
                        max-width: none;
                    }
                }

                @media (max-width: 768px) {
                    .page-header h1 {
                        font-size: 2rem;
                    }

                    .profile-header {
                        flex-direction: column;
                        gap: 1.5rem;
                    }

                    .avatar-section {
                        flex-direction: column;
                        text-align: center;
                    }

                    .edit-button {
                        width: 100%;
                    }

                    .form-actions {
                        flex-direction: column-reverse;
                    }

                    .cancel-button,
                    .save-button {
                        width: 100%;
                        justify-content: center;
                    }
                }

                @media (max-width: 480px) {
                    .container {
                        padding: 0 0.5rem;
                    }

                    .profile-card,
                    .actions-card {
                        border-radius: 12px;
                    }

                    .profile-header,
                    .profile-body,
                    .actions-card {
                        padding: 1.5rem;
                    }

                    .avatar {
                        width: 80px;
                        height: 80px;
                        font-size: 2rem;
                    }

                    .user-basic-info h2 {
                        font-size: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default ProfilePage;