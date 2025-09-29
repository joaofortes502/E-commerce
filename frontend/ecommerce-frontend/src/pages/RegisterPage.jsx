import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
    // Estados do formulário de registro
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        type: 'cliente' // Tipo padrão de usuário
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Hook do contexto de autenticação - fornece função de registro
    const { register, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Se usuário já está logado, redireciona
    useEffect(() => {
        if (isAuthenticated()) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    // Atualiza estado conforme usuário digita
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError('');
    };

    // Valida os dados do formulário antes de enviar
    const validateForm = () => {
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            setError('Por favor, preencha todos os campos');
            return false;
        }

        if (!isValidEmail(formData.email)) {
            setError('Por favor, insira um e-mail válido');
            return false;
        }

        if (formData.password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem');
            return false;
        }

        return true;
    };

    // Submete o formulário de registro
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            setError('');

            // Chama a função de registro do contexto
            // Ela cria o usuário no backend e faz login automaticamente
            await register(formData.name, formData.email, formData.password, formData.type);
            
            // Registro bem-sucedido - usuário será redirecionado pelo useEffect
            
        } catch (err) {
            setError(err.message || 'Erro ao criar conta. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    return (
        <div className="register-page">
            <div className="container">
                <div className="register-wrapper">
                    <div className="register-card">
                        <div className="register-header">
                            <h1>Criar Conta</h1>
                            <p>Preencha os dados para se cadastrar</p>
                        </div>

                        <form onSubmit={handleSubmit} className="register-form">
                            {/* Campo de nome */}
                            <div className="form-group">
                                <label htmlFor="name">Nome Completo</label>
                                <div className="input-wrapper">
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Seu nome completo"
                                        disabled={loading}
                                    />
                                    <span className="input-icon">👤</span>
                                </div>
                            </div>

                            {/* Campo de e-mail */}
                            <div className="form-group">
                                <label htmlFor="email">E-mail</label>
                                <div className="input-wrapper">
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="seu@email.com"
                                        disabled={loading}
                                    />
                                    <span className="input-icon">📧</span>
                                </div>
                            </div>

                            {/* Campo de senha */}
                            <div className="form-group">
                                <label htmlFor="password">Senha</label>
                                <div className="input-wrapper">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Mínimo 6 caracteres"
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={loading}
                                    >
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>

                            {/* Campo de confirmação de senha */}
                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirmar Senha</label>
                                <div className="input-wrapper">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        placeholder="Digite a senha novamente"
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        disabled={loading}
                                    >
                                        {showConfirmPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>

                            {/* Mensagem de erro */}
                            {error && (
                                <div className="error-message">
                                    ⚠️ {error}
                                </div>
                            )}

                            {/* Botão de submissão */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="register-button"
                            >
                                {loading ? (
                                    <>
                                        <span className="loading-spinner"></span>
                                        Criando conta...
                                    </>
                                ) : (
                                    '✨ Criar Conta'
                                )}
                            </button>
                        </form>

                        {/* Link para login */}
                        <div className="register-footer">
                            <div className="login-link">
                                <span>Já tem uma conta? </span>
                                <a href="/login">Fazer login</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .register-page {
                    min-height: calc(100vh - 200px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }

                .container {
                    width: 100%;
                    max-width: 500px;
                    padding: 0 1rem;
                }

                .register-wrapper {
                    display: flex;
                    justify-content: center;
                }

                .register-card {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
                    padding: 3rem;
                    width: 100%;
                    animation: slideUp 0.5s ease-out;
                }

                .register-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .register-header h1 {
                    font-size: 2rem;
                    color: #333;
                    margin-bottom: 0.5rem;
                    font-weight: 700;
                }

                .register-header p {
                    color: #666;
                    font-size: 1rem;
                }

                .register-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                }

                .form-group label {
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 0.5rem;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .input-wrapper input {
                    width: 100%;
                    padding: 1rem 1rem 1rem 3rem;
                    border: 2px solid #e9ecef;
                    border-radius: 10px;
                    font-size: 1rem;
                    transition: all 0.2s ease;
                    background-color: #f8f9fa;
                }

                .input-wrapper input:focus {
                    outline: none;
                    border-color: #667eea;
                    background-color: white;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }

                .input-wrapper input:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .input-icon {
                    position: absolute;
                    left: 1rem;
                    font-size: 1.2rem;
                    color: #666;
                    pointer-events: none;
                }

                .password-toggle {
                    position: absolute;
                    right: 1rem;
                    background: none;
                    border: none;
                    font-size: 1.2rem;
                    cursor: pointer;
                    padding: 0.25rem;
                    border-radius: 4px;
                    transition: background-color 0.2s;
                }

                .password-toggle:hover:not(:disabled) {
                    background-color: rgba(0, 0, 0, 0.05);
                }

                .password-toggle:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .error-message {
                    background-color: #f8d7da;
                    color: #721c24;
                    padding: 0.75rem 1rem;
                    border-radius: 8px;
                    border: 1px solid #f5c6cb;
                    font-size: 0.9rem;
                    animation: shake 0.5s ease-in-out;
                }

                .register-button {
                    padding: 1rem 2rem;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    margin-top: 1rem;
                }

                .register-button:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
                }

                .register-button:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }

                .register-button .loading-spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid transparent;
                    border-top: 2px solid white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                .register-footer {
                    margin-top: 2rem;
                    text-align: center;
                }

                .login-link {
                    color: #666;
                    font-size: 0.95rem;
                }

                .login-link a {
                    color: #667eea;
                    text-decoration: none;
                    font-weight: 600;
                    transition: color 0.2s;
                }

                .login-link a:hover {
                    color: #5a67d8;
                    text-decoration: underline;
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @media (max-width: 768px) {
                    .register-page {
                        padding: 1rem 0;
                        align-items: flex-start;
                        padding-top: 2rem;
                    }

                    .register-card {
                        padding: 2rem;
                        margin: 1rem 0;
                    }

                    .register-header h1 {
                        font-size: 1.75rem;
                    }

                    .input-wrapper input {
                        padding: 0.875rem 0.875rem 0.875rem 2.75rem;
                    }

                    .input-icon {
                        left: 0.875rem;
                    }

                    .password-toggle {
                        right: 0.875rem;
                    }
                }

                @media (max-width: 480px) {
                    .container {
                        padding: 0 0.5rem;
                    }

                    .register-card {
                        padding: 1.5rem;
                    }

                    .register-header h1 {
                        font-size: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default RegisterPage;