import { useState } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Layout() {
  const { logout, user, nivel, allowedTabs } = useAuthStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const canAccess = (tab) => allowedTabs.includes(tab);
  const canManageUsers = nivel === 'SUPERADMIN' || nivel === 'ADMIN';
  const canManageCongregations = nivel === 'SUPERADMIN';

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', path: '/dashboard' },
    { key: 'members', label: 'Miembros', path: '/members' },
    { key: 'institutions', label: 'Instituciones', path: '/institutions' },
    { key: 'congregations', label: 'Congregaciones', path: '/congregations', condition: canManageCongregations },
    { key: 'finances', label: 'Finanzas', path: '/finances' },
    { key: 'events', label: 'Eventos', path: '/events' },
    { key: 'users', label: 'Usuarios', path: '/users', condition: canManageUsers },
    { key: 'inventory', label: 'Inventario', path: '/inventory' },
  ];

  const visibleNavItems = navItems.filter(item => canAccess(item.key) && (item.condition !== false));

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            {/* Logo & Desktop Menu */}
            <div className="flex items-center">
              <Link to="/dashboard" className="font-bold text-xl">
                Iglesia
              </Link>
              {/* Desktop Menu - hidden on mobile */}
              <div className="hidden md:ml-10 md:flex md:space-x-2 lg:space-x-4">
                {visibleNavItems.map((item) => (
                  <Link
                    key={item.key}
                    to={item.path}
                    className="hover:bg-indigo-700 px-2 lg:px-3 py-2 rounded text-sm lg:text-base"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* User Info & Logout - Desktop */}
            <div className="hidden md:flex items-center">
              <span className="mr-2 lg:mr-4 text-sm">
                {user?.username}
                <span className="ml-2 text-xs bg-indigo-800 px-2 py-0.5 rounded">
                  {nivel}
                </span>
                {user?.congregacion?.nombre && (
                  <span className="ml-2 text-xs bg-gray-600 px-2 py-0.5 rounded hidden lg:inline">
                    {user.congregacion.nombre}
                  </span>
                )}
              </span>
              <button
                onClick={handleLogout}
                className="bg-indigo-700 hover:bg-indigo-800 px-3 py-2 rounded text-sm"
              >
                Cerrar
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded hover:bg-indigo-700 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-indigo-500">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {visibleNavItems.map((item) => (
                <Link
                  key={item.key}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded hover:bg-indigo-700 text-base"
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-indigo-500 pt-3 mt-2">
                <div className="px-3 py-2 text-sm text-indigo-200">
                  <div>{user?.username}</div>
                  <div className="text-xs">
                    {nivel}
                    {user?.congregacion?.nombre && ` - ${user.congregacion.nombre}`}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-left px-3 py-2 rounded hover:bg-indigo-700 text-base"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        <Outlet />
      </main>
    </div>
  );
}