import React, { createContext, useContext, useState, useEffect } from 'react';

// Criamos o contexto que vai armazenar informações de autenticação
const AuthContext = createContext();

// Hook personalizado para usar o contexto de autenticação em qualquer componente
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de AuthProvider');
    }
    return context;
};

// mantém o estado de autenticação e fornece funções para login, logout, etc.
export const AuthProvider = ({ children }) => {
    // Estados para gerenciar informações do usuário
    const [user, setUser] = useState(null); // Dados do usuário logado
    const [token, setToken] = useState(null); // Token JWT para autenticação
    const [loading, setLoading] = useState(true); // Loading inicial enquanto verifica se há usuário salvo
    const [sessionId, setSessionId] = useState(null); // ID de sessão para usuários anônimos

    // Verifica se há um usuário logado salvo no localStorage
    useEffect(() => {
        checkExistingAuth();
    }, []);

    // chamada quando a aplicação é carregada para restaurar sessões ativas
    const checkExistingAuth = async () => {
        try {
            const savedToken = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');
            
            if (savedToken && savedUser) {
                try {
                    // Verificamos se os dados salvos são válidos
                    const parsedUser = JSON.parse(savedUser);
                    
                    // Definimos os estados com os dados recuperados
                    setToken(savedToken);
                    setUser(parsedUser);
                    //tinha q verifica com o servidor....
                    
                } catch (parseError) {
                    console.error('Erro ao recuperar dados salvos:', parseError);
                    // Se os dados salvos estão corrompidos, limpamos tudo
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            } else {
                // Se não há usuário logado, geramos um sessionId para carrinho anônimo
                generateSessionId();
            }
        } catch (error) {
            console.error('Erro ao verificar autenticação existente:', error);
        } finally {
            setLoading(false);
        }
    };

    // gerar um ID de sessão único para usuários anônimos
    const generateSessionId = () => {
        let existingSessionId = localStorage.getItem('sessionId');
        
        if (!existingSessionId) {
            // Criamos um ID único baseado em timestamp e números aleatórios
            existingSessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
            localStorage.setItem('sessionId', existingSessionId);
        }
        
        setSessionId(existingSessionId);
    };

    // realizar login
    const login = async (email, password) => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro no login');
            }

            // Se login foi bem-sucedido, salvamos os dados
            const { user: userData, token: userToken } = data;
            
            setUser(userData);
            setToken(userToken);

            // Persistimos os dados no localStorage para manter login entre sessões
            localStorage.setItem('token', userToken);
            localStorage.setItem('user', JSON.stringify(userData));

            // Se havia um carrinho de sessão anônima, vamos migrá-lo
            if (sessionId) {
                await migrateAnonymousCart(userToken);
            }

            // Limpamos o sessionId já que agora o usuário está logado
            setSessionId(null);
            localStorage.removeItem('sessionId');

            return data;

        } catch (error) {
            console.error('Erro no login:', error);
            throw error; // Re-lança o erro para que o componente possa tratá-lo
        }
    };

    // registrar novo usuário
    const register = async (name, email, password, type = 'client') => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password, type })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro no registro');
            }

            // Após registro bem-sucedido, automaticamente fazemos login
            const { user: userData, token: userToken } = data;
            
            setUser(userData);
            setToken(userToken);

            localStorage.setItem('token', userToken);
            localStorage.setItem('user', JSON.stringify(userData));

            // Migramos carrinho anônimo se existir
            if (sessionId) {
                await migrateAnonymousCart(userToken);
            }

            setSessionId(null);
            localStorage.removeItem('sessionId');

            return data;

        } catch (error) {
            console.error('Erro no registro:', error);
            throw error;
        }
    };

    // migrar carrinho de sessão anônima para usuário logado
    const migrateAnonymousCart = async (authToken) => {
        try {
            if (!sessionId) return;

            const response = await fetch('http://localhost:5000/api/cart/migrate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ session_id: sessionId })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Carrinho migrado com sucesso:', data.migrated_items, 'itens');
            }
        } catch (error) {
            // Migração de carrinho falhou, mas não é crítico
            console.warn('Erro ao migrar carrinho:', error);
        }
    };

    // Função para fazer logout
    const logout = () => {
        // Limpamos todos os estados relacionados ao usuário
        setUser(null);
        setToken(null);

        // Removemos dados persistidos
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Geramos novo sessionId para continuar como usuário anônimo
        generateSessionId();
    };

    // Função para atualizar dados do usuário (após editar perfil, por exemplo)
    const updateUser = (updatedUserData) => {
        setUser(updatedUserData);
        localStorage.setItem('user', JSON.stringify(updatedUserData));
    };

    // Função utilitária para verificar se usuário é administrador
    const isAdmin = () => {
        return user && user.type === 'admin';
    };

    // Função utilitária para verificar se usuário está logado
    const isAuthenticated = () => {
        return user && token;
    };

    // Função para obter headers de autenticação para requisições HTTP
    const getAuthHeaders = () => {
        const headers = { 'Content-Type': 'application/json' };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        } else if (sessionId) {
            headers['X-Session-Id'] = sessionId;
        }
        
        return headers;
    };

    // Valor que será fornecido a todos os componentes que usarem este contexto
    const value = {
        // Estados
        user,
        token,
        loading,
        sessionId,
        
        // Funções de autenticação
        login,
        register,
        logout,
        updateUser,
        
        // Funções utilitárias
        isAdmin,
        isAuthenticated,
        getAuthHeaders,
        
        // Função para forçar re-verificação de autenticação
        refreshAuth: checkExistingAuth
    };


    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};