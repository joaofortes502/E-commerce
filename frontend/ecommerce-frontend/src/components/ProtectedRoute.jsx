import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    // Enquanto verifica autenticação, mostra um loading
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                fontSize: '1.5rem'
            }}>
                <div style={{
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        border: '4px solid #f3f3f3',
                        borderTop: '4px solid #667eea',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }}></div>
                    <p>Verificando autenticação...</p>
                </div>
            </div>
        );
    }

    // Se não está autenticado, redireciona para login
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    // Se a rota requer admin mas usuário não é admin
    if (adminOnly && !isAdmin()) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                padding: '2rem'
            }}>
                <div style={{
                    textAlign: 'center',
                    maxWidth: '500px'
                }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</h1>
                    <h2 style={{ marginBottom: '1rem', color: '#333' }}>Acesso Negado</h2>
                    <p style={{ color: '#666', marginBottom: '2rem' }}>
                        Você não tem permissão para acessar esta página. 
                        Esta área é restrita apenas para administradores.
                    </p>
                    <a 
                        href="/"
                        style={{
                            display: 'inline-block',
                            padding: '0.75rem 2rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            fontWeight: '600'
                        }}
                    >
                        Voltar para Home
                    </a>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;