import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMemberStore } from '../store/memberStore';

export default function Members() {
  const { members, loading, fetchMembers, createMember, updateMember, deleteMember } = useMemberStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchMembers();
  }, []);

  const onSubmit = async (data) => {
    let result;
    if (editingMember) {
      result = await updateMember(editingMember.id, data);
    } else {
      result = await createMember(data);
    }
    
    if (result.success) {
      setIsModalOpen(false);
      setEditingMember(null);
      reset();
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    reset(member);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar este miembro?')) {
      await deleteMember(id);
    }
  };

  const openCreateModal = () => {
    setEditingMember(null);
    reset();
    setIsModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Miembros</h1>
        <button
          onClick={openCreateModal}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Agregar Miembro
        </button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{member.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{member.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{member.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(member)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingMember ? 'Editar Miembro' : 'Nuevo Miembro'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  {...register('name', { required: 'Nombre requerido' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  {...register('email', { required: 'Email requerido' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <input
                  {...register('phone')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
                >
                  {editingMember ? 'Actualizar' : 'Crear'}
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
