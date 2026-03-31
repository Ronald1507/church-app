import { Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Layout({ children }) {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
                <Link to="/dashboard" className="hover:bg-indigo-700 px-3 py-2 rounded">
                  Dashboard
                </Link>
                <Link to="/members" className="hover:bg-indigo-700 px-3 py-2 rounded">
                  Miembros
                </Link>
                <Link to="/finances" className="hover:bg-indigo-700 px-3 py-2 rounded">
                  Finanzas
                </Link>
                <Link to="/events" className="hover:bg-indigo-700 px-3 py-2 rounded">
                  Eventos
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <span className="mr-4">{user?.name || user?.email}</span>
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
