import { Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Layout() {
  const { logout, user, nivel, allowedTabs } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const canAccess = (tab) => allowedTabs.includes(tab);
  const canManageUsers = nivel === 'SUPERADMIN' || nivel === 'ADMIN';
  const canManageCongregations = nivel === 'SUPERADMIN';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="font-bold text-xl">
                Iglesia
              </Link>
              <div className="ml-10 flex space-x-4">
                {canAccess('dashboard') && (
                  <Link to="/dashboard" className="hover:bg-indigo-700 px-3 py-2 rounded">
                    Dashboard
                  </Link>
                )}
                {canAccess('members') && (
                  <Link to="/members" className="hover:bg-indigo-700 px-3 py-2 rounded">
                    Miembros
                  </Link>
                )}
                {canAccess('institutions') && (
                  <Link to="/institutions" className="hover:bg-indigo-700 px-3 py-2 rounded">
                    Instituciones
                  </Link>
                )}
                {canAccess('congregations') && canManageCongregations && (
                  <Link to="/congregations" className="hover:bg-indigo-700 px-3 py-2 rounded">
                    Congregaciones
                  </Link>
                )}
                {canAccess('finances') && (
                  <Link to="/finances" className="hover:bg-indigo-700 px-3 py-2 rounded">
                    Finanzas
                  </Link>
                )}
                {canAccess('events') && (
                  <Link to="/events" className="hover:bg-indigo-700 px-3 py-2 rounded">
                    Eventos
                  </Link>
                )}
                {canAccess('users') && canManageUsers && (
                  <Link to="/users" className="hover:bg-indigo-700 px-3 py-2 rounded">
                    Usuarios
                  </Link>
                )}
                {canAccess('inventory') && (
                  <Link to="/inventory" className="hover:bg-indigo-700 px-3 py-2 rounded">
                    Inventario
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <span className="mr-4">
                {user?.username} 
                <span className="ml-2 text-xs bg-indigo-800 px-2 py-0.5 rounded">
                  {nivel}
                </span>
                {user?.congregacion?.nombre && (
                  <span className="ml-2 text-xs bg-gray-600 px-2 py-0.5 rounded">
                    {user.congregacion.nombre}
                  </span>
                )}
              </span>
              <button
                onClick={handleLogout}
                className="bg-indigo-700 hover:bg-indigo-800 px-3 py-2 rounded"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto py-6">
        <Outlet />
      </main>
    </div>
  );
}
