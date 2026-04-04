import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useUserStore } from '../store/userStore';
import api from '../services/api';

export default function Users() {
  const { usuarios, loading, fetchUsuarios, createUsuario, updateUsuario, deleteUsuario, fetchEstados, fetchUsuariosByEstado, estados, filtroEstado } = useUserStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [meta, setMeta] = useState({ roles: [], estados: [], miembros: [] });
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    fetchUsuarios();
    fetchMeta();
    fetchEstados();
  }, []);

  const fetchMeta = async () => {
    try {
      const response = await api.get('/usuarios/meta');
      setMeta(response.data);
    } catch (error) {
      console.error('Error fetching meta:', error);
    }
  };

  const handleFiltrarPorEstado = async (idEstado) => {
    if (filtroEstado === idEstado) {
      // Si ya está seleccionado, volver a todos
      await fetchUsuarios();
    } else {
      await fetchUsuariosByEstado(idEstado);
    }
  };

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      id_rol: parseInt(data.id_rol),
      id_estado: parseInt(data.id_estado),
      id_miembro: data.id_miembro ? parseInt(data.id_miembro) : null
    };

    let result;
    if (editingUser) {
      // Solo actualizar si se proporciona nueva contraseña
      if (data.password) {
        result = await updateUsuario(editingUser.id_usuario, payload);
      } else {
        const { password, ...payloadWithoutPassword } = payload;
        result = await updateUsuario(editingUser.id_usuario, payloadWithoutPassword);
      }
    } else {
      result = await createUsuario(payload);
    }
    
    if (result.success) {
      setIsModalOpen(false);
      setEditingUser(null);
      reset();
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setValue('username', user.username);
    setValue('email', user.email);
    setValue('id_rol', user.id_rol);
    setValue('id_estado', user.id_estado);
    setValue('id_miembro', user.id_miembro || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      await deleteUsuario(id);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    reset({ id_rol: '', id_estado: '', id_miembro: '' });
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Usuarios</h1>
        <button
          onClick={openCreateModal}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 w-full sm:w-auto"
        >
          Agregar Usuario
        </button>
      </div>

      {/* Filtro dinámico por estado */}
      {estados.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por estado:</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => fetchUsuarios()}
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
      ) : usuarios.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          {filtroEstado 
            ? `No hay usuarios con el estado seleccionado` 
            : 'No hay usuarios registrados'}
        </p>
      ) : (
        <div className="space-y-4">
          {usuarios.map((user) => (
            <div key={user.id_usuario} className="bg-white p-4 rounded-lg shadow border-l-4 border-indigo-500">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{user.username}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {user.rol?.nombre || '-'}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                      {user.congregacion?.nombre || '-'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      user.estado?.nombre === 'Activo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.estado?.nombre || '-'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 ml-4">
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-indigo-600 hover:text-indigo-900 text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(user.id_usuario)}
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
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Usuario *</label>
                <input
                  {...register('username', { required: 'Usuario requerido' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={editingUser}
                />
                {errors.username && <span className="text-red-500 text-sm">{errors.username.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email *</label>
                <input
                  type="email"
                  {...register('email', { required: 'Email requerido' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {editingUser ? 'Nueva Contraseña (dejar vacío para mantener)' : 'Contraseña *'}
                </label>
                <input
                  type="password"
                  {...register('password')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder={editingUser ? '••••••••' : ''}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rol *</label>
                  <select
                    {...register('id_rol', { required: 'Rol requerido' })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Seleccionar</option>
                    {meta.roles.map(rol => (
                      <option key={rol.id_rol} value={rol.id_rol}>{rol.nombre}</option>
                    ))}
                  </select>
                  {errors.id_rol && <span className="text-red-500 text-sm">{errors.id_rol.message}</span>}
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

              <div>
                <label className="block text-sm font-medium text-gray-700">Miembro Relacionado</label>
                <select
                  {...register('id_miembro')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Sin miembro</option>
                  {meta.miembros.map(miembro => (
                    <option key={miembro.id_miembro} value={miembro.id_miembro}>
                      {miembro.nombres} {miembro.apellidos}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
                >
                  {editingUser ? 'Actualizar' : 'Crear'}
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