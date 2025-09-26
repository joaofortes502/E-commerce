import React, { useState, useEffect } from 'react';

const LoginPage = () => {
    // Estados do formulário
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Simulação do contexto de autenticação - você substituirá pela importação real
    const { login, isAuthenticated } = {
        login: async (email, password) => {
            // Simula uma requisição de login
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (email === 'admin@test.com' && password === '123456') {
                return { success: true, user: { name: 'Admin', email, type: 'admin' } };
            }
            throw new Error('Credenciais inválidas');
        },
        isAuthenticated: () => false
    };

    // Redireciona se já estiver logado
    useEffect(() => {
        if (isAuthenticated()) {
            // Em produção: navigate('/');
            window.location.hash = '#/';
        }
    }, [isAuthenticated]);

    // Atualiza os dados do formulário
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Limpa erro quando usuário começa a digitar
        if (error) setError('');
    };

    // Submete o formulário de login
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validações básicas
        if (!formData.email || !formData.password) {
            setError('Por favor, preencha todos os campos');
            return;
        }

        if (!isValidEmail(formData.email)) {
            setError('Por favor, insira um e-mail válido');
            return;
        }

        try {
            setLoading(true);
            setError('');

            await login(formData.email, formData.password);
            
            // Login bem-sucedido - redireciona para página inicial
            // Em produção: navigate('/');
            window.location.hash = '#/';

        } catch (err) {
            setError(err.message || 'Erro ao fazer login. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    // Validação de e-mail
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Alterna visibilidade da senha
    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    return (
        <div className="login-page">
            <div className="container">
                <div className="login-wrapper">
                    <div className="login-card">
                        {/* Cabeçalho */}
                        <div className="login-header">
                            <h1>Fazer Login</h1>
                            <p>Entre na sua conta para continuar</p>
                        </div>

                        {/* Formulário de login */}
                        <form onSubmit={handleSubmit} className="login-form">
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
                                        className={error && !formData.email ? 'error' : ''}
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
                                        placeholder="Digite sua senha"
                                        disabled={loading}
                                        className={error && !formData.password ? 'error' : ''}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={togglePasswordVisibility}
                                        disabled={loading}
                                    >
                                        {showPassword ? '🙈' : '👁️'}
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
                                disabled={loading || !formData.email || !formData.password}
                                className="login-button"
                            >
                                {loading ? (
                                    <>
                                        <span className="loading-spinner"></span>
                                        Entrando...
                                    </>
                                ) : (
                                    '🔐 Entrar'
                                )}
                            </button>
                        </form>

                        {/* Links adicionais */}
                        <div className="login-footer">
                            <div className="forgot-password">
                                <a href="#/forgot-password">Esqueceu sua senha?</a>
                            </div>
                            
                            <div className="signup-link">
                                <span>Não tem uma conta? </span>
                                <a href="#/register">Criar conta</a>
                            </div>
                        </div>

                        {/* Dados de teste para demonstração */}
                        <div className="demo-credentials">
                            <h4>💡 Dados para teste:</h4>
                            <div className="demo-item">
                                <strong>Admin:</strong> admin@test.com / 123456
                            </div>
                            <div className="demo-item">
                                <strong>Cliente:</strong> cliente@test.com / 123456
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .login-page {
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

                .login-wrapper {
                    display: flex;
                    justify-content: center;
                }

                .login-card {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
                    padding: 3rem;
                    width: 100%;
                    animation: slideUp 0.5s ease-out;
                }

                /* Cabeçalho do formulário */
                .login-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .login-header h1 {
                    font-size: 2rem;
                    color: #333;
                    margin-bottom: 0.5rem;
                    font-weight: 700;
                }

                .login-header p {
                    color: #666;
                    font-size: 1rem;
                }

                /* Formulário */
                .login-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
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

                .input-wrapper input.error {
                    border-color: #dc3545;
                    background-color: #fff5f5;
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

                /* Mensagem de erro */
                .error-message {
                    background-color: #f8d7da;
                    color: #721c24;
                    padding: 0.75rem 1rem;
                    border-radius: 8px;
                    border: 1px solid #f5c6cb;
                    font-size: 0.9rem;
                    animation: shake 0.5s ease-in-out;
                }

                /* Botão de login */
                .login-button {
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

                .login-button:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
                }

                .login-button:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }

                .login-button .loading-spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid transparent;
                    border-top: 2px solid white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                /* Footer do login */
                .login-footer {
                    margin-top: 2rem;
                    text-align: center;
                }

                .forgot-password {
                    margin-bottom: 1rem;
                }

                .forgot-password a,
                .signup-link a {
                    color: #667eea;
                    text-decoration: none;
                    font-weight: 600;
                    transition: color 0.2s;
                }

                .forgot-password a:hover,
                .signup-link a:hover {
                    color: #5a67d8;
                    text-decoration: underline;
                }

                .signup-link {
                    color: #666;
                    font-size: 0.95rem;
                }

                /* Credenciais de demonstração */
                .demo-credentials {
                    margin-top: 2rem;
                    padding: 1rem;
                    background-color: #e7f3ff;
                    border: 1px solid #b8daff;
                    border-radius: 8px;
                    font-size: 0.85rem;
                }

                .demo-credentials h4 {
                    margin-bottom: 0.75rem;
                    color: #004085;
                    font-size: 0.9rem;
                }

                .demo-item {
                    margin-bottom: 0.5rem;
                    color: #004085;
                }

                .demo-item:last-child {
                    margin-bottom: 0;
                }

                /* Animações */
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

                /* Responsividade */
                @media (max-width: 768px) {
                    .login-page {
                        padding: 1rem 0;
                        align-items: flex-start;
                        padding-top: 2rem;
                    }

                    .login-card {
                        padding: 2rem;
                        margin: 1rem 0;
                    }

                    .login-header h1 {
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

                    .login-card {
                        padding: 1.5rem;
                    }

                    .login-header h1 {
                        font-size: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default LoginPage;