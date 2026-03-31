import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useEventStore } from '../store/eventStore';

export default function Events() {
  const { events, loading, fetchEvents, createEvent, getAttendance } = useEventStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchEvents();
  }, []);

  const onSubmit = async (data) => {
    const result = await createEvent({
      ...data,
      date: new Date(data.date).toISOString(),
    });
    
    if (result.success) {
      setIsModalOpen(false);
      reset();
    }
  };

  const handleViewAttendance = async (eventId) => {
    const result = await getAttendance(eventId);
    if (result.success) {
      setAttendance(result.data);
      setSelectedEvent(eventId);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Eventos</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Nuevo Evento
        </button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-2">{event.title}</h3>
              <p className="text-gray-600 mb-2">{event.description}</p>
              <div className="text-sm text-gray-500 mb-4">
                <p>📅 {new Date(event.date).toLocaleDateString()}</p>
                <p>📍 {event.location}</p>
              </div>
              <button
                onClick={() => handleViewAttendance(event.id)}
                className="text-indigo-600 hover:text-indigo-900 text-sm"
              >
                Ver Asistencia
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal - Crear Evento */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nuevo Evento</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Título</label>
                <input
                  {...register('title', { required: 'Título requerido' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                {errors.title && <span className="text-red-500 text-sm">{errors.title.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  {...register('description')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha</label>
                <input
                  type="datetime-local"
                  {...register('date', { required: 'Fecha requerida' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                {errors.date && <span className="text-red-500 text-sm">{errors.date.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Ubicación</label>
                <input
                  {...register('location')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
                >
                  Crear
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Ver Asistencia */}
      {selectedEvent && attendance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Asistencia</h2>
            <p className="mb-4">Total: {attendance.length} personas</p>
            <ul className="space-y-2 mb-4">
              {attendance.map((person) => (
                <li key={person.id} className="border-b pb-2">
                  {person.name}
                </li>
              ))}
            </ul>
            <button
              onClick={() => {
                setSelectedEvent(null);
                setAttendance(null);
              }}
              className="w-full bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
