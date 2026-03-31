import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMinistryStore } from '../store/ministryStore';
import api from '../services/api';

export default function Ministries() {
  const { ministerios, loading, fetchMinisterios, createMinisterio, updateMinisterio, deleteMinisterio } = useMinistryStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMinistry, setEditingMinistry] = useState(null);
  const [meta, setMeta] = useState({ estados: [], congregaciones: [], miembros: [] });
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    fetchMinisterios();
    fetchMeta();
  }, []);

  const fetchMeta = async () => {
    try {
      const response = await api.get('/ministerios/meta');
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
      id_lider: data.id_lider ? parseInt(data.id_lider) : null
    };

    let result;
    if (editingMinistry) {
      result = await updateMinisterio(editingMinistry.id_ministerio, payload);
    } else {
      result = await createMinisterio(payload);
    }
    
    if (result.success) {
      setIsModalOpen(false);
      setEditingMinistry(null);
      reset();
    }
  };

  const handleEdit = (ministry) => {
    setEditingMinistry(ministry);
    Object.keys(ministry).forEach(key => {
      if (key !== 'congregacion' && key !== 'estado') {
        setValue(key, ministry[key]);
      }
    });
    setValue('id_estado', ministry.id_estado);
    setValue('id_congregacion', ministry.id_congregacion);
    setValue('id_lider', ministry.id_lider || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar este ministerio?')) {
      await deleteMinisterio(id);
    }
  };

  const openCreateModal = () => {
    setEditingMinistry(null);
    reset({
      id_estado: '',
      id_congregacion: '',
      id_lider: ''
    });
    setIsModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ministerios</h1>
        <button
          onClick={openCreateModal}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Agregar Ministerio
        </button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : ministerios.length === 0 ? (
        <p className="text-gray-500">No hay ministerios registrados</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Congregación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ministerios.map((ministry) => (
                <tr key={ministry.id_ministerio}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{ministry.nombre}</td>
                  <td className="px-6 py-4">{ministry.descripcion || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{ministry.congregacion?.nombre || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      ministry.estado?.nombre === 'Ministerio activo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {ministry.estado?.nombre || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(ministry)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(ministry.id_ministerio)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">
              {editingMinistry ? 'Editar Ministerio' : 'Nuevo Ministerio'}
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
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  {...register('descripcion')}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

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
                <label className="block text-sm font-medium text-gray-700">Líder</label>
                <select
                  {...register('id_lider')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Sin líder asignado</option>
                  {meta.miembros.map(miembro => (
                    <option key={miembro.id_miembro} value={miembro.id_miembro}>
                      {miembro.nombres} {miembro.apellidos}
                    </option>
                  ))}
                </select>
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

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
                >
                  {editingMinistry ? 'Actualizar' : 'Crear'}
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