import { useState, useEffect } from 'react';
import { Sidebar } from './presentation/components/Sidebar';
import { Navbar } from './presentation/components/Navbar';
import { Login } from './presentation/pages/Login';
import { Register } from './presentation/pages/Register';
import { Dashboard } from './presentation/pages/Dashboard';
import { Appointments } from './presentation/pages/Appointments';
import { Records } from './presentation/pages/Records';
import { Settings } from './presentation/pages/Settings';
import { adminService, DepartmentDoctor } from './infrastructure/services/adminService';

type Page = 'dashboard' | 'appointments' | 'records' | 'settings';
type AuthPage = 'login' | 'register';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [authPage, setAuthPage] = useState<AuthPage>('login');
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    setIsAuthenticated(adminService.isAuthenticated());
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const data: DepartmentDoctor = await adminService.getDepartments();
      setDepartments(data.departments);
    } catch {
      setDepartments([]);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setAuthPage('login');
  };

  const handleRegisterSuccess = () => {
    setIsAuthenticated(true);
    setAuthPage('login');
  };

  const handleLogout = () => {
    adminService.logout();
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
    setAuthPage('login');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  if (!isAuthenticated) {
    if (authPage === 'register') {
      return (
        <Register
          onRegisterSuccess={handleRegisterSuccess}
          onBackToLogin={() => setAuthPage('login')}
          departments={departments}
        />
      );
    }
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onGoToRegister={() => setAuthPage('register')}
      />
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'appointments':
        return <Appointments />;
      case 'records':
        return <Records />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
      <div className="ml-64">
        <Navbar />
        <main className="pt-16 p-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
