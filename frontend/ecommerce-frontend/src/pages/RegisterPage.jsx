import React, { useState, useEffect } from 'react';

const RegisterPage = () => {
    // Estados do formulário
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        type: 'client'
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [success, setSuccess] = useState(false);

    // Simulação do contexto de autenticação - você substituirá pela importação real
    const { register, isAuthenticated } = {
        register: async (name, email, password, type) => {
            // Simula uma requisição de registro
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (email === 'existe@test.com') {
                throw new Error('Este e-mail já está em uso');
            }
            return { success: true, user: { name, email, type } };
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
        
        // Limpa erros específicos quando usuário começa a digitar
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Validações do formulário
    const validateForm = () => {
        const newErrors = {};

        // Validação do nome
        if (!formData.name.trim()) {
            newErrors.name = 'Nome é obrigatório';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
        }

        // Validação do e-mail
        if (!formData.email) {
            newErrors.email = 'E-mail é obrigatório';
        } else if (!isValidEmail(formData.email)) {
            newErrors.email = 'Formato de e-mail inválido';
        }

        // Validação da senha
        if (!formData.password) {
            newErrors.password = 'Senha é obrigatória';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
        }

        // Validação da confirmação de senha
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Senhas não coincidem';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Validação de e-mail
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Submete o formulário de registro
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);

            await register(
                formData.name.trim(),
                formData.email.trim().toLowerCase(),
                formData.password,
                formData.type
            );

            setSuccess(true);
            
            // Redireciona após sucesso
            setTimeout(() => {
                // Em produção: navigate('/');
                window.location.hash = '#/';
            }, 2000);

        } catch (err) {
            setErrors({
                submit: err.message || 'Erro ao criar conta. Tente novamente.'
            });
        } finally {
            setLoading(false);
        }
    };

    // Alterna visibilidade das senhas
    const togglePasswordVisibility = (field) => {
        if (field === 'password') {
            setShowPassword(prev => !prev);
        } else {
            setShowConfirmPassword(prev => !prev);
        }
    };

    // Verifica força da senha
    const getPasswordStrength = (password) => {
        if (!password) return { level: 0, text: '', color: '' };
        
        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        const levels = [
            { level: 0, text: '', color: '' },
            { level: 1, text: 'Muito fraca', color: '#dc3545' },
            { level: 2, text: 'Fraca', color: '#fd7e14' },
            { level: 3, text: 'Regular', color: '#ffc107' },
            { level: 4, text: 'Forte', color: '#28a745' },
            { level: 5, text: 'Muito forte', color: '#20c997' }
        ];

        return levels[strength];
    };

    if (success) {
        return (
            <div className="register-page">
                <div className="container">
                    <div className="success-card">
                        <div className="success-icon">✅</div>
                        <h1>Conta criada com sucesso!</h1>
                        <p>Você será redirecionado em alguns segundos...</p>
                        <a href="#/" className="continue-btn">Continuar</a>
                    </div>
                </div>
                
                <style jsx>{`
                    .register-page {
                        min-height: calc(100vh - 200px);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                    }
                    .success-card {
                        background: white;
                        border-radius: 16px;
                        padding: 3rem;
                        text-align: center;
                        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
                        animation: slideUp 0.5s ease-out;
                    }
                    .success-icon {
                        font-size: 4rem;
                        margin-bottom: 1rem;
                    }
                    .success-card h1 {
                        color: #28a745;
                        margin-bottom: 1rem;
                    }
                    .success-card p {
                        color: #666;
                        margin-bottom: 2rem;
                    }
                    .continue-btn {
                        display: inline-block;
                        padding: 1rem 2rem;
                        background-color: #28a745;
                        color: white;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: 600;
                        transition: background-color 0.2s;
                    }
                    .continue-btn:hover {
                        background-color: #218838;
                    }
                    @keyframes slideUp {
                        from { opacity: 0; transform: translateY(30px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
            </div>
        );
    }

    const passwordStrength = getPasswordStrength(formData.password);

    return (
        <div className="register-page">
            <div className="container">
                <div className="register-wrapper">
                    <div className="register-card">
                        {/* Cabeçalho */}
                        <div className="register-header">
                            <h1>Criar Conta</h1>
                            <p>Preencha os dados para criar sua conta</p>
                        </div>

                        {/* Formulário de registro */}
                        <form onSubmit={handleSubmit} className="register-form">
                            {/* Campo de nome */}
                            <div className="form-group">
                                <label htmlFor="name">Nome completo</label>
                                <div className="input-wrapper">
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Seu nome completo"
                                        disabled={loading}
                                        className={errors.name ? 'error' : ''}
                                    />
                                    <span className="input-icon">👤</span>
                                </div>
                                {errors.name && (
                                    <span className="field-error">{errors.name}</span>
                                )}
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
                                        className={errors.email ? 'error' : ''}
                                    />
                                    <span className="input-icon">📧</span>
                                </div>
                                {errors.email && (
                                    <span className="field-error">{errors.email}</span>
                                )}
                            </div>

                            {/* Campo de tipo de usuário */}
                            <div className="form-group">
                                <label htmlFor="type">Tipo de conta</label>
                                <div className="input-wrapper">
                                    <select
                                        id="type"
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                    >
                                        <option value="client">Cliente</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                    <span className="input-icon">🏷️</span>
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
                                        placeholder="Sua senha"
                                        disabled={loading}
                                        className={errors.password ? 'error' : ''}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => togglePasswordVisibility('password')}
                                        disabled={loading}
                                    >
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                                {errors.password && (
                                    <span className="field-error">{errors.password}</span>
                                )}
                                {/* Indicador de força da senha */}
                                {formData.password && (
                                    <div className="password-strength">
                                        <div 
                                            className="strength-bar"
                                            style={{ 
                                                width: `${(passwordStrength.level / 5) * 100}%`,
                                                backgroundColor: passwordStrength.color 
                                            }}
                                        ></div>
                                        <span 
                                            className="strength-text"
                                            style={{ color: passwordStrength.color }}
                                        >
                                            {passwordStrength.text}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Campo de confirmação de senha */}
                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirmar senha</label>
                                <div className="input-wrapper">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        placeholder="Digite a senha novamente"
                                        disabled={loading}
                                        className={errors.confirmPassword ? 'error' : ''}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => togglePasswordVisibility('confirm')}
                                        disabled={loading}
                                    >
                                        {showConfirmPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <span className="field-error">{errors.confirmPassword}</span>
                                )}
                            </div>

                            {/* Mensagem de erro geral */}
                            {errors.submit && (
                                <div className="error-message">
                                    ⚠️ {errors.submit}
                                </div>
                            )}

                            {/* Botão de submissão */}
                            <button
                                type="submit"
                                disabled={loading || Object.keys(errors).length > 0}
                                className="register-button"
                            >
                                {loading ? (
                                    <>
                                        <span className="loading-spinner"></span>
                                        Criando conta...
                                    </>
                                ) : (
                                    '✨ Criar conta'
                                )}
                            </button>
                        </form>

                        {/* Footer do registro */}
                        <div className="register-footer">
                            <div className="login-link">
                                <span>Já tem uma conta? </span>
                                <a href="#/login">Fazer login</a>
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
                    max-width: 550px;
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

                /* Cabeçalho */
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

                /* Formulário */
                .register-form {
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

                .input-wrapper input,
                .input-wrapper select {
                    width: 100%;
                    padding: 1rem 1rem 1rem 3rem;
                    border: 2px solid #e9ecef;
                    border-radius: 10px;
                    font-size: 1rem;
                    transition: all 0.2s ease;
                    background-color: #f8f9fa;
                }

                .input-wrapper input:focus,
                .input-wrapper select:focus {
                    outline: none;
                    border-color: #667eea;
                    background-color: white;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }

                .input-wrapper input.error,
                .input-wrapper select.error {
                    border-color: #dc3545;
                    background-color: #fff5f5;
                }

                .input-wrapper input:disabled,
                .input-wrapper select:disabled {
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

                /* Erros de campo específico */
                .field-error {
                    color: #dc3545;
                    font-size: 0.85rem;
                    margin-top: 0.25rem;
                    font-weight: 500;
                }

                /* Força da senha */
                .password-strength {
                    margin-top: 0.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .strength-bar {
                    height: 4px;
                    border-radius: 2px;
                    transition: all 0.3s ease;
                    min-width: 20px;
                }

                .strength-text {
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                /* Mensagem de erro geral */
                .error-message {
                    background-color: #f8d7da;
                    color: #721c24;
                    padding: 0.75rem 1rem;
                    border-radius: 8px;
                    border: 1px solid #f5c6cb;
                    font-size: 0.9rem;
                    animation: shake 0.5s ease-in-out;
                }

                /* Botão de registro */
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

                /* Footer do registro */
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

                    .input-wrapper input,
                    .input-wrapper select {
                        padding: 0.875rem 0.875rem 0.875rem 2.75rem;
                    }

                    .input-icon {
                        left: 0.875rem;
                    }

                    .password-toggle {
                        right: 0.875rem;
                    }

                    .register-form {
                        gap: 1.25rem;
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

                    .form-group {
                        gap: 1rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default RegisterPage;
                