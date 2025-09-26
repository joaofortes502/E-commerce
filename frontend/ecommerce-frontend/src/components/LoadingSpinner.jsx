import React from 'react';

const LoadingSpinner = ({ 
    size = 'medium', 
    message = 'Carregando...', 
    color = '#667eea',
    fullScreen = false,
    overlay = false 
}) => {
    // Define tamanhos do spinner
    const getSizeClass = () => {
        switch (size) {
            case 'small': return 'spinner-small';
            case 'large': return 'spinner-large';
            case 'xlarge': return 'spinner-xlarge';
            default: return 'spinner-medium';
        }
    };

    // Componente do spinner
    const SpinnerContent = () => (
        <div className={`loading-spinner ${getSizeClass()}`}>
            <div className="spinner-circle" style={{ borderTopColor: color }}></div>
            {message && <p className="spinner-message">{message}</p>}
        </div>
    );

    // Se for fullScreen, renderiza ocupando toda a tela
    if (fullScreen) {
        return (
            <div className="loading-fullscreen">
                <SpinnerContent />
                <style jsx>{`
                    .loading-fullscreen {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-color: ${overlay ? 'rgba(255, 255, 255, 0.9)' : 'white'};
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 9999;
                        backdrop-filter: ${overlay ? 'blur(4px)' : 'none'};
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="loading-container">
            <SpinnerContent />

            <style jsx>{`
                .loading-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    width: 100%;
                }

                .loading-spinner {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                }

                /* Tamanhos do spinner */
                .spinner-small .spinner-circle {
                    width: 20px;
                    height: 20px;
                    border-width: 2px;
                }

                .spinner-small .spinner-message {
                    font-size: 0.8rem;
                }

                .spinner-medium .spinner-circle {
                    width: 40px;
                    height: 40px;
                    border-width: 3px;
                }

                .spinner-medium .spinner-message {
                    font-size: 1rem;
                }

                .spinner-large .spinner-circle {
                    width: 60px;
                    height: 60px;
                    border-width: 4px;
                }

                .spinner-large .spinner-message {
                    font-size: 1.1rem;
                }

                .spinner-xlarge .spinner-circle {
                    width: 80px;
                    height: 80px;
                    border-width: 5px;
                }

                .spinner-xlarge .spinner-message {
                    font-size: 1.2rem;
                }

                /* Animação do spinner */
                .spinner-circle {
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid ${color};
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    display: block;
                }

                /* Mensagem do loading */
                .spinner-message {
                    color: #666;
                    margin: 0;
                    font-weight: 500;
                    text-align: center;
                    letter-spacing: 0.5px;
                }

                /* Animação de rotação */
                @keyframes spin {
                    0% { 
                        transform: rotate(0deg); 
                    }
                    100% { 
                        transform: rotate(360deg); 
                    }
                }

                /* Variações de cores pré-definidas */
                .spinner-primary .spinner-circle {
                    border-top-color: #667eea;
                }

                .spinner-success .spinner-circle {
                    border-top-color: #28a745;
                }

                .spinner-danger .spinner-circle {
                    border-top-color: #dc3545;
                }

                .spinner-warning .spinner-circle {
                    border-top-color: #ffc107;
                }

                .spinner-info .spinner-circle {
                    border-top-color: #17a2b8;
                }

                /* Efeito de pulsação adicional (opcional) */
                .loading-spinner.pulse {
                    animation: pulse 2s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.7;
                    }
                }

                /* Estados de carregamento específicos */
                .loading-dots::after {
                    content: '';
                    animation: dots 1.5s steps(4, end) infinite;
                }

                @keyframes dots {
                    0%, 20% {
                        content: '.';
                    }
                    40% {
                        content: '..';
                    }
                    60% {
                        content: '...';
                    }
                    80%, 100% {
                        content: '';
                    }
                }

                /* Responsividade */
                @media (max-width: 768px) {
                    .loading-container {
                        padding: 1.5rem;
                    }

                    .spinner-xlarge .spinner-circle {
                        width: 60px;
                        height: 60px;
                        border-width: 4px;
                    }

                    .spinner-large .spinner-circle {
                        width: 50px;
                        height: 50px;
                        border-width: 3px;
                    }

                    .spinner-message {
                        font-size: 0.9rem;
                    }
                }

                @media (max-width: 480px) {
                    .loading-container {
                        padding: 1rem;
                    }

                    .spinner-xlarge .spinner-circle {
                        width: 50px;
                        height: 50px;
                        border-width: 3px;
                    }

                    .spinner-large .spinner-circle {
                        width: 40px;
                        height: 40px;
                        border-width: 3px;
                    }

                    .spinner-medium .spinner-circle {
                        width: 35px;
                        height: 35px;
                        border-width: 3px;
                    }
                }
            `}</style>
        </div>
    );
};

// Componente de loading específico para botões
export const ButtonSpinner = ({ size = 'small', color = 'white' }) => (
    <span className="button-spinner">
        <span 
            className="button-spinner-circle" 
            style={{ 
                borderTopColor: color,
                width: size === 'small' ? '16px' : '20px',
                height: size === 'small' ? '16px' : '20px'
            }}
        ></span>
        
        <style jsx>{`
            .button-spinner {
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }

            .button-spinner-circle {
                border: 2px solid transparent;
                border-top: 2px solid ${color};
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
                display: block;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `}</style>
    </span>
);

// Componente de loading para overlays
export const OverlaySpinner = ({ message = 'Processando...', color = '#667eea' }) => (
    <div className="overlay-spinner">
        <div className="overlay-content">
            <div className="spinner-circle" style={{ borderTopColor: color }}></div>
            <p className="spinner-message">{message}</p>
        </div>
        
        <style jsx>{`
            .overlay-spinner {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(255, 255, 255, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 100;
                backdrop-filter: blur(2px);
                border-radius: inherit;
            }

            .overlay-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1rem;
                text-align: center;
            }

            .spinner-circle {
                width: 40px;
                height: 40px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid ${color};
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            .spinner-message {
                color: #666;
                margin: 0;
                font-weight: 500;
                font-size: 0.95rem;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `}</style>
    </div>
);

// Componente de loading inline para textos
export const InlineSpinner = ({ color = '#667eea' }) => (
    <span className="inline-spinner">
        <span className="inline-spinner-circle" style={{ borderTopColor: color }}></span>
        
        <style jsx>{`
            .inline-spinner {
                display: inline-flex;
                align-items: center;
                margin: 0 0.5rem;
            }

            .inline-spinner-circle {
                width: 12px;
                height: 12px;
                border: 1px solid #f3f3f3;
                border-top: 1px solid ${color};
                border-radius: 50%;
                animation: spin 1s linear infinite;
                display: block;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `}</style>
    </span>
);

export default LoadingSpinner;