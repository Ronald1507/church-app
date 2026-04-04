import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCongregationStore } from '../store/congregationStore';
import api from '../services/api';

export default function Congregations() {
  const { congregaciones, loading, fetchCongregaciones, createCongregacion, updateCongregacion, deleteCongregacion, fetchEstados, fetchCongregacionesByEstado, estados, filtroEstado } = useCongregationStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCongregation, setEditingCongregation] = useState(null);
  const [meta, setMeta] = useState({ estados: [] });
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    fetchCongregaciones();
    fetchMeta();
    fetchEstados();
  }, []);

  const fetchMeta = async () => {
    try {
      const response = await api.get('/congregaciones/meta');
      setMeta(response.data);
    } catch (error) {
      console.error('Error fetching meta:', error);
    }
  };

  const handleFiltrarPorEstado = async (idEstado) => {
    if (filtroEstado === idEstado) {
      // Si ya está seleccionado, volver a todos
      await fetchCongregaciones();
    } else {
      await fetchCongregacionesByEstado(idEstado);
    }
  };

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      id_estado: parseInt(data.id_estado),
      id_pastor: data.id_pastor ? parseInt(data.id_pastor) : null
    };

    let result;
    if (editingCongregation) {
      result = await updateCongregacion(editingCongregation.id_congregacion, payload);
    } else {
      result = await createCongregacion(payload);
    }
    
    if (result.success) {
      setIsModalOpen(false);
      setEditingCongregation(null);
      reset();
    }
  };

  const handleEdit = (cong) => {
    setEditingCongregation(cong);
    Object.keys(cong).forEach(key => {
      if (key !== 'estado') {
        setValue(key, cong[key] || '');
      }
    });
    setValue('id_estado', cong.id_estado);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar esta congregación?')) {
      await deleteCongregacion(id);
    }
  };

  const openCreateModal = () => {
    setEditingCongregation(null);
    reset({ id_estado: '' });
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Congregaciones</h1>
        <button
          onClick={openCreateModal}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 w-full sm:w-auto"
        >
          Agregar Congregación
        </button>
      </div>

      {/* Filtro dinámico por estado */}
      {estados.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por estado:</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => fetchCongregaciones()}
              className={`px-3 py-1.5 rounded text-sm ${
                filtroEstado === null
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todos
            </button>
            {estados.map((estado) => (
              <button
                key={estado.id_estado}
                onClick={() => handleFiltrarPorEstado(estado.id_estado)}
                className={`px-3 py-1.5 rounded text-sm ${
                  filtroEstado === estado.id_estado
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {estado.nombre}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-center py-8">Cargando...</p>
      ) : congregaciones.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          {filtroEstado 
            ? `No hay congregaciones con el estado seleccionado` 
            : 'No hay congregaciones registradas'}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {congregaciones.map((cong) => (
            <div key={cong.id_congregacion} className="bg-white p-4 rounded-lg shadow border-l-4 border-indigo-500">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{cong.nombre}</h3>
                  <p className="text-sm text-gray-500">{cong.direccion || 'Sin dirección'}</p>
                  <p className="text-sm text-gray-500">{cong.pastor?.nombres} {cong.pastor?.apellidos}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleEdit(cong)}
                    className="text-indigo-600 hover:text-indigo-900 text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(cong.id_congregacion)}
                    className="text-red-600 hover:text-red-900 text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              <div className="mt-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  cong.estado?.nombre === 'Activo' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {cong.estado?.nombre || '-'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingCongregation ? 'Editar Congregación' : 'Nueva Congregación'}
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

              <div>
                <label className="block text-sm font-medium text-gray-700">Dirección</label>
                <input
                  {...register('direccion')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ciudad</label>
                  <input
                    {...register('ciudad')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Región</label>
                  <input
                    {...register('region')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <input
                    {...register('telefono')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    {...register('email')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
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

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
                >
                  {editingCongregation ? 'Actualizar' : 'Crear'}
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