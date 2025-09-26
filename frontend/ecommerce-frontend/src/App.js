import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';

// Componente principal que estrutura toda nossa aplicação
function App() {
  return (
    // BrowserRouter permite navegação baseada na URL do navegador
    <Router>
      {/* AuthProvider deve envolver toda a aplicação para fornecer contexto de autenticação */}
      <AuthProvider>
        {/* CartProvider deve estar dentro do AuthProvider para ter acesso às funções de auth */}
        <CartProvider>
          {/* Estrutura principal da aplicação */}
          <div className="App">
            {/* Navbar sempre visível no topo */}
            <Navbar />
            
            {/* Área principal onde o conteúdo das páginas será renderizado */}
            <main className="main-content">
              {/* Sistema de roteamento - define qual componente renderizar para cada URL */}
              <Routes>
                {/* Rotas públicas - acessíveis a qualquer pessoa */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/products/:id" element={<ProductPage />} />
                <Route path="/cart" element={<CartPage />} />
                
                {/* Rotas protegidas - requerem autenticação */}
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/orders" 
                  element={
                    <ProtectedRoute>
                      <OrdersPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Rota administrativa - requer ser admin */}
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Rota de fallback - redireciona URLs não encontradas para home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            
            {/* Footer sempre visível na parte inferior */}
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;