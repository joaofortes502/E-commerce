import React from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    {/* Seção principal do footer */}
                    <div className="footer-main">
                        <div className="footer-section">
                            <h3 className="footer-title">
                                🛍️ E-commerce
                            </h3>
                            <p className="footer-description">
                                Sua loja online com os melhores produtos e preços. 
                                Compre com segurança e comodidade.
                            </p>
                            <div className="social-links">
                                <a href="#" className="social-link" title="Facebook">📘</a>
                                <a href="#" className="social-link" title="Instagram">📷</a>
                                <a href="#" className="social-link" title="Twitter">🐦</a>
                                <a href="#" className="social-link" title="YouTube">📺</a>
                            </div>
                        </div>

                        <div className="footer-section">
                            <h4 className="footer-subtitle">🛒 Comprar</h4>
                            <ul className="footer-links">
                                <li><a href="#/">Todos os Produtos</a></li>
                                <li><a href="#/category/eletronicos">Eletrônicos</a></li>
                                <li><a href="#/category/roupas">Roupas</a></li>
                                <li><a href="#/category/casa">Casa & Jardim</a></li>
                                <li><a href="#/cart">Meu Carrinho</a></li>
                            </ul>
                        </div>

                        <div className="footer-section">
                            <h4 className="footer-subtitle">👤 Conta</h4>
                            <ul className="footer-links">
                                <li><a href="#/login">Fazer Login</a></li>
                                <li><a href="#/register">Criar Conta</a></li>
                                <li><a href="#/profile">Meu Perfil</a></li>
                                <li><a href="#/orders">Meus Pedidos</a></li>
                                <li><a href="#/wishlist">Lista de Desejos</a></li>
                            </ul>
                        </div>

                        <div className="footer-section">
                            <h4 className="footer-subtitle">📞 Atendimento</h4>
                            <div className="contact-info">
                                <div className="contact-item">
                                    <span className="contact-icon">📱</span>
                                    <span>(51) 9999-9999</span>
                                </div>
                                <div className="contact-item">
                                    <span className="contact-icon">📧</span>
                                    <span>joaofortes@sou.faccat.br</span>
                                </div>
                                <div className="contact-item">
                                    <span className="contact-icon">🕐</span>
                                    <span>Seg-Sex: 8h30 às 18h</span>
                                </div>
                                <div className="contact-item">
                                    <span className="contact-icon">📍</span>
                                    <span>Taquara, RS</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    

                    
                </div>

                {/* Rodapé inferior */}
                <div className="footer-bottom">
                    <div className="footer-bottom-content">
                        <div className="copyright">
                            <p>&copy; {currentYear} E-commerce. Todos os direitos reservados.</p>
                            <p className="academic-note">
                                💡 Projeto acadêmico desenvolvido para fins educacionais
                            </p>
                        </div>
                        
                    </div>

                    {/* Informações técnicas */}
                    <div className="tech-info">
                        <p>
                            Desenvolvido com ⚛️ React + Node.js + SQLite
                        </p>
                        <p className="build-info">
                            Build: v1.0.0 | Última atualização: {new Date().toLocaleDateString('pt-BR')}
                        </p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .footer {
                    background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
                    color: white;
                    margin-top: auto;
                }

                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 1rem;
                }

                .footer-content {
                    padding: 3rem 0 2rem;
                }

                /* Seção principal */
                .footer-main {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 2rem;
                    margin-bottom: 2rem;
                }

                .footer-section {
                    display: flex;
                    flex-direction: column;
                }

                .footer-title {
                    font-size: 1.5rem;
                    margin-bottom: 1rem;
                    color: white;
                    font-weight: 700;
                }

                .footer-subtitle {
                    font-size: 1.1rem;
                    margin-bottom: 1rem;
                    color: #ecf0f1;
                    font-weight: 600;
                    border-bottom: 2px solid rgba(255, 255, 255, 0.2);
                    padding-bottom: 0.5rem;
                }

                .footer-description {
                    color: #bdc3c7;
                    line-height: 1.6;
                    margin-bottom: 1.5rem;
                    font-size: 0.95rem;
                }

                /* Links sociais */
                .social-links {
                    display: flex;
                    gap: 1rem;
                }

                .social-link {
                    width: 40px;
                    height: 40px;
                    background-color: rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-decoration: none;
                    font-size: 1.2rem;
                    transition: all 0.3s ease;
                }

                .social-link:hover {
                    background-color: rgba(255, 255, 255, 0.2);
                    transform: translateY(-2px);
                }

                /* Links do footer */
                .footer-links {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .footer-links li {
                    margin-bottom: 0.75rem;
                }

                .footer-links a {
                    color: #bdc3c7;
                    text-decoration: none;
                    font-size: 0.9rem;
                    transition: all 0.3s ease;
                    display: block;
                    padding: 0.25rem 0;
                }

                .footer-links a:hover {
                    color: white;
                    padding-left: 0.5rem;
                }

                /* Informações de contato */
                .contact-info {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .contact-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: #bdc3c7;
                    font-size: 0.9rem;
                }

                .contact-icon {
                    font-size: 1.1rem;
                    min-width: 20px;
                }

                /* Métodos de pagamento */
                .footer-payments {
                    padding: 1.5rem 0;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    text-align: center;
                }

                .payments-title {
                    font-size: 1.1rem;
                    margin-bottom: 1rem;
                    color: #ecf0f1;
                }

                .payment-methods {
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .payment-method {
                    background-color: rgba(255, 255, 255, 0.1);
                    padding: 0.75rem;
                    border-radius: 8px;
                    font-size: 1.5rem;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }

                .payment-method:hover {
                    background-color: rgba(255, 255, 255, 0.2);
                    transform: scale(1.1);
                }

                /* Segurança */
                .footer-security {
                    padding: 1.5rem 0;
                    text-align: center;
                }

                .security-title {
                    font-size: 1.1rem;
                    margin-bottom: 1rem;
                    color: #ecf0f1;
                }

                .security-badges {
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .security-badge {
                    background-color: rgba(46, 204, 113, 0.2);
                    color: #2ecc71;
                    padding: 0.75rem;
                    border-radius: 8px;
                    font-size: 1.5rem;
                    border: 1px solid rgba(46, 204, 113, 0.3);
                    transition: all 0.3s ease;
                    cursor: pointer;
                }

                .security-badge:hover {
                    background-color: rgba(46, 204, 113, 0.3);
                    transform: scale(1.1);
                }

                /* Rodapé inferior */
                .footer-bottom {
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 2rem 0;
                }

                .footer-bottom-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .copyright {
                    flex: 1;
                    min-width: 200px;
                }

                .copyright p {
                    color: #bdc3c7;
                    margin: 0.5rem 0;
                    font-size: 0.9rem;
                }

                .academic-note {
                    font-size: 0.8rem !important;
                    color: #95a5a6 !important;
                    font-style: italic;
                }

                .legal-links {
                    display: flex;
                    gap: 2rem;
                    flex-wrap: wrap;
                }

                .legal-links a {
                    color: #bdc3c7;
                    text-decoration: none;
                    font-size: 0.9rem;
                    transition: color 0.3s ease;
                    white-space: nowrap;
                }

                .legal-links a:hover {
                    color: white;
                }

                /* Informações técnicas */
                .tech-info {
                    text-align: center;
                    padding-top: 1rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                }

                .tech-info p {
                    color: #95a5a6;
                    font-size: 0.8rem;
                    margin: 0.25rem 0;
                }

                .build-info {
                    font-family: 'Courier New', monospace;
                }

                /* Responsividade */
                @media (max-width: 768px) {
                    .footer-content {
                        padding: 2rem 0 1rem;
                    }

                    .footer-main {
                        grid-template-columns: 1fr;
                        gap: 1.5rem;
                    }

                    .footer-section {
                        text-align: center;
                    }

                    .social-links {
                        justify-content: center;
                    }

                    .contact-info {
                        align-items: center;
                    }

                    .footer-bottom-content {
                        flex-direction: column;
                        text-align: center;
                    }

                    .legal-links {
                        justify-content: center;
                        gap: 1rem;
                    }

                    .payment-methods,
                    .security-badges {
                        gap: 0.5rem;
                    }

                    .payment-method,
                    .security-badge {
                        padding: 0.5rem;
                        font-size: 1.25rem;
                    }
                }

                @media (max-width: 480px) {
                    .container {
                        padding: 0 0.5rem;
                    }

                    .footer-title {
                        font-size: 1.25rem;
                    }

                    .footer-subtitle {
                        font-size: 1rem;
                    }

                    .legal-links {
                        flex-direction: column;
                        gap: 0.5rem;
                        align-items: center;
                    }

                    .payment-methods,
                    .security-badges {
                        justify-content: center;
                    }

                    .contact-item {
                        font-size: 0.85rem;
                    }
                }

                /* Animação suave para hover effects */
                * {
                    transition: all 0.3s ease;
                }

                /* Scroll suave para links âncora */
                html {
                    scroll-behavior: smooth;
                }
            `}</style>
        </footer>
    );
};

export default Footer;