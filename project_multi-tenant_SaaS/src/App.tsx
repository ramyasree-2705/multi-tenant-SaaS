import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Header from './components/Layout/Header';
import LoginPage from './components/Auth/LoginPage';
import SignupPage from './components/Auth/SignupPage';
import ProductsPage from './components/Products/ProductsPage';
import CartPage from './components/Cart/CartPage';

function App() {
  const [currentPage, setCurrentPage] = useState('products');

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onNavigate={setCurrentPage} />;
      case 'signup':
        return <SignupPage onNavigate={setCurrentPage} />;
      case 'cart':
        return <CartPage onNavigate={setCurrentPage} />;
      case 'products':
      default:
        return <ProductsPage />;
    }
  };

  const showHeader = !['login', 'signup'].includes(currentPage);

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-gray-50">
          {showHeader && (
            <Header currentPage={currentPage} onNavigate={setCurrentPage} />
          )}
          {renderPage()}
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;