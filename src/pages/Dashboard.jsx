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
      const [membersRes, transactionsRes, eventsRes] = await Promise.all([
        api.get('/members'),
        api.get('/transactions/month'),
        api.get('/events/upcoming'),
      ]);

      const totalMembers = membersRes.data.length;
      const monthlyIncome = transactionsRes.data
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      setStats({
        totalMembers,
        monthlyIncome,
        upcomingEvents: eventsRes.data,
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Miembros</h3>
          <p className="text-3xl font-bold text-indigo-600">{stats.totalMembers}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Ingresos del Mes</h3>
          <p className="text-3xl font-bold text-green-600">
            ${stats.monthlyIncome.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Próximos Eventos</h3>
          <p className="text-3xl font-bold text-indigo-600">{stats.upcomingEvents.length}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Próximos Eventos</h2>
        {stats.upcomingEvents.length === 0 ? (
          <p className="text-gray-500">No hay eventos próximos</p>
        ) : (
          <ul className="space-y-3">
            {stats.upcomingEvents.map((event) => (
              <li key={event.id} className="border-b pb-2">
                <p className="font-medium">{event.title}</p>
                <p className="text-sm text-gray-500">
                  {new Date(event.date).toLocaleDateString()} - {event.location}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
