import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useInstitutionStore } from '../store/institutionStore';
import api from '../services/api';

export default function Institutions() {
  const { instituciones, loading, fetchInstituciones, createInstitucion, updateInstitucion, deleteInstitucion } = useInstitutionStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState(null);
  const [meta, setMeta] = useState({ estados: [], congregaciones: [] });
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    fetchInstituciones();
    fetchMeta();
  }, []);

  const fetchMeta = async () => {
    try {
      const response = await api.get('/instituciones/meta');
      setMeta(response.data);
    } catch (error) {
      console.error('Error fetching meta:', error);
    }
  };

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      id_estado: parseInt(data.id_estado),
      id_congregacion: parseInt(data.id_congregacion)
    };

    let result;
    if (editingInstitution) {
      result = await updateInstitucion(editingInstitution.id_institucion, payload);
    } else {
      result = await createInstitucion(payload);
    }
    
    if (result.success) {
      setIsModalOpen(false);
      setEditingInstitution(null);
      reset();
    }
  };

  const handleEdit = (institution) => {
    setEditingInstitution(institution);
    Object.keys(institution).forEach(key => {
      if (key !== 'congregacion' && key !== 'estado') {
        setValue(key, institution[key] || '');
      }
    });
    setValue('id_estado', institution.id_estado);
    setValue('id_congregacion', institution.id_congregacion);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar esta institución?')) {
      await deleteInstitucion(id);
    }
  };

  const openCreateModal = () => {
    setEditingInstitution(null);
    reset({ id_estado: '', id_congregacion: '' });
    setIsModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Instituciones</h1>
        <button
          onClick={openCreateModal}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Agregar Institución
        </button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : instituciones.length === 0 ? (
        <p className="text-gray-500">No hay instituciones registradas</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Congregación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {instituciones.map((inst) => (
                <tr key={inst.id_institucion}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{inst.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {inst.tipo || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{inst.descripcion || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{inst.congregacion?.nombre || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      inst.estado?.nombre === 'Activo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {inst.estado?.nombre || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(inst)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(inst.id_institucion)}
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
              {editingInstitution ? 'Editar Institución' : 'Nueva Institución'}
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
                <label className="block text-sm font-medium text-gray-700">Tipo</label>
                <select
                  {...register('tipo')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Seleccionar</option>
                  <option value="escuela">Escuela</option>
                  <option value="hospital">Hospital</option>
                  <option value="centro">Centro Comunitario</option>
                  <option value="otro">Otro</option>
                </select>
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
                  {editingInstitution ? 'Actualizar' : 'Crear'}
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