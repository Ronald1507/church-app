import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    monthlyIncome: 0,
    upcomingEvents: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [membersRes, transaccionesRes, eventsRes] = await Promise.all([
        api.get('/miembros'),
        api.get('/finanzas/transacciones'),
        api.get('/eventos'),
      ]);

      // Obtener solo transacciones del mes actual
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const transaccionesMes = transaccionesRes.data.filter(t => 
        new Date(t.fecha) >= startOfMonth
      );
      
      const totalMembers = membersRes.data.length;
      const monthlyIncome = transaccionesMes
        .filter((t) => t.tipo === 'ingreso')
        .reduce((sum, t) => sum + parseFloat(t.monto), 0);

      // Obtener próximos eventos (futuros)
      const upcomingEvents = eventsRes.data
        .filter(e => new Date(e.fecha_inicio) >= now)
        .slice(0, 5);

      setStats({
        totalMembers,
        monthlyIncome,
        upcomingEvents,
      });
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Cargando...</div>;
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Miembros</h3>
          <p className="text-2xl md:text-3xl font-bold text-indigo-600">{stats.totalMembers}</p>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Ingresos del Mes</h3>
          <p className="text-2xl md:text-3xl font-bold text-green-600">
            ${stats.monthlyIncome.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Próximos Eventos</h3>
          <p className="text-2xl md:text-3xl font-bold text-indigo-600">{stats.upcomingEvents.length}</p>
        </div>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-lg shadow">
        <h2 className="text-lg md:text-xl font-bold mb-4">Próximos Eventos</h2>
        {stats.upcomingEvents.length === 0 ? (
          <p className="text-gray-500">No hay eventos próximos</p>
        ) : (
          <ul className="space-y-3">
            {stats.upcomingEvents.map((event) => (
              <li key={event.id_evento} className="border-b pb-2">
                <p className="font-medium">{event.nombre}</p>
                <p className="text-sm text-gray-500">
                  {new Date(event.fecha_inicio).toLocaleDateString('es-CL')} - {event.lugar || 'Sin lugar'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
