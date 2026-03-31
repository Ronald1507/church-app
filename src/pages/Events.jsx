import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useEventStore } from '../store/eventStore';
import api from '../services/api';

export default function Events() {
  const { eventos, loading, fetchEventos, createEvento, updateEvento, deleteEvento } = useEventStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [meta, setMeta] = useState({ estados: [], congregaciones: [] });
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    fetchEventos();
    fetchMeta();
  }, []);

  const fetchMeta = async () => {
    try {
      const response = await api.get('/eventos/meta');
      setMeta(response.data);
    } catch (error) {
      console.error('Error fetching meta:', error);
    }
  };

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      id_estado: parseInt(data.id_estado),
      id_congregacion: parseInt(data.id_congregacion),
      capacidad_max: data.capacidad_max ? parseInt(data.capacidad_max) : null
    };

    let result;
    if (editingEvent) {
      result = await updateEvento(editingEvent.id_evento, payload);
    } else {
      result = await createEvento(payload);
    }
    
    if (result.success) {
      setIsModalOpen(false);
      setEditingEvent(null);
      reset();
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    Object.keys(event).forEach(key => {
      if (key !== 'congregacion' && key !== 'estado') {
        setValue(key, event[key] || '');
      }
    });
    setValue('id_estado', event.id_estado);
    setValue('id_congregacion', event.id_congregacion);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar este evento?')) {
      await deleteEvento(id);
    }
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    reset({ id_estado: '', id_congregacion: '' });
    setIsModalOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('es-CL');
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Eventos</h1>
        <button
          onClick={openCreateModal}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 w-full sm:w-auto"
        >
          Agregar Evento
        </button>
      </div>

      {loading ? (
        <p className="text-center py-8">Cargando...</p>
      ) : eventos.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No hay eventos registrados</p>
      ) : (
        <div className="space-y-4">
          {eventos.map((event) => (
            <div key={event.id_evento} className="bg-white p-4 rounded-lg shadow border-l-4 border-indigo-500">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{event.nombre}</h3>
                  <p className="text-sm text-gray-500">{formatDate(event.fecha_inicio)}</p>
                  <p className="text-sm text-gray-500">{event.lugar || 'Sin lugar'}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {event.tipo || '-'}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                      {event.congregacion?.nombre || '-'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 ml-4">
                  <button
                    onClick={() => handleEdit(event)}
                    className="text-indigo-600 hover:text-indigo-900 text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(event.id_evento)}
                    className="text-red-600 hover:text-red-900 text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 md:p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg md:text-xl font-bold mb-4">
              {editingEvent ? 'Editar Evento' : 'Nuevo Evento'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                <input
                  {...register('nombre', { required: 'Nombre requerido' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                {errors.nombre && <span className="text-red-500 text-sm">{errors.nombre.message}</span>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo</label>
                  <select
                    {...register('tipo')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Seleccionar</option>
                    <option value="culto">Culto</option>
                    <option value="escuela">Escuela Dominical</option>
                    <option value="juvenil">Juvenil</option>
                    <option value="niños">Niños</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Capacidad Máxima</label>
                  <input
                    type="number"
                    {...register('capacidad_max')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Sin límite"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  {...register('descripcion')}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha Inicio *</label>
                  <input
                    type="datetime-local"
                    {...register('fecha_inicio', { required: 'Fecha requerida' })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  {errors.fecha_inicio && <span className="text-red-500 text-sm">{errors.fecha_inicio.message}</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha Fin</label>
                  <input
                    type="datetime-local"
                    {...register('fecha_fin')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Lugar</label>
                <input
                  {...register('lugar')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Congregación *</label>
                  <select
                    {...register('id_congregacion', { required: 'Congregación requerida' })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Seleccionar</option>
                    {meta.congregaciones.map(cong => (
                      <option key={cong.id_congregacion} value={cong.id_congregacion}>{cong.nombre}</option>
                    ))}
                  </select>
                  {errors.id_congregacion && <span className="text-red-500 text-sm">{errors.id_congregacion.message}</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado *</label>
                  <select
                    {...register('id_estado', { required: 'Estado requerido' })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Seleccionar</option>
                    {meta.estados.map(estado => (
                      <option key={estado.id_estado} value={estado.id_estado}>{estado.nombre}</option>
                    ))}
                  </select>
                  {errors.id_estado && <span className="text-red-500 text-sm">{errors.id_estado.message}</span>}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
                >
                  {editingEvent ? 'Actualizar' : 'Crear'}
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
    </div>
  );
}