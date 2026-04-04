import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMemberStore } from '../store/memberStore';
import api from '../services/api';

export default function Members() {
  const { members, loading, fetchMembers, createMember, updateMember, deleteMember, fetchEstados, fetchMembersByEstado, estados, filtroEstado } = useMemberStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [meta, setMeta] = useState({ estados: [], congregaciones: [], tipos: [], instituciones: [] });
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    fetchMembers();
    fetchMeta();
    fetchEstados();
  }, []);

  const fetchMeta = async () => {
    try {
      const response = await api.get('/miembros/opciones');
      setMeta(response.data);
    } catch (error) {
      console.error('Error fetching meta:', error);
    }
  };

  const handleFiltrarPorEstado = async (idEstado) => {
    if (filtroEstado === idEstado) {
      // Si ya está seleccionado, volver a todos
      await fetchMembers();
    } else {
      await fetchMembersByEstado(idEstado);
    }
  };

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      id_estado: parseInt(data.id_estado),
      id_congregacion: parseInt(data.id_congregacion),
      id_tipo_miembro: parseInt(data.id_tipo_miembro)
    };

    let result;
    if (editingMember) {
      result = await updateMember(editingMember.id_miembro, payload);
    } else {
      result = await createMember(payload);
    }
    
    if (result.success) {
      setIsModalOpen(false);
      setEditingMember(null);
      reset();
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    Object.keys(member).forEach(key => {
      if (key !== 'estado' && key !== 'congregacion' && key !== 'tipoMiembro' && key !== 'miembroInstitucions') {
        setValue(key, member[key]);
      }
    });
    setValue('id_estado', member.id_estado);
    setValue('id_congregacion', member.id_congregacion);
    setValue('id_tipo_miembro', member.id_tipo_miembro);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar este miembro?')) {
      await deleteMember(id);
    }
  };

  const openCreateModal = () => {
    setEditingMember(null);
    reset({
      id_estado: '',
      id_congregacion: '',
      id_tipo_miembro: ''
    });
    setIsModalOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Miembros</h1>
        <button
          onClick={openCreateModal}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 w-full sm:w-auto"
        >
          Agregar Miembro
        </button>
      </div>

      {/* Filtro dinámico por estado */}
      {estados.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por estado:</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => fetchMembers()}
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
      ) : members.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          {filtroEstado 
            ? `No hay miembros con el estado seleccionado` 
            : 'No hay miembros registrados'}
        </p>
      ) : (
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.id_miembro} className="bg-white p-4 rounded-lg shadow border-l-4 border-indigo-500">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{member.nombres} {member.apellidos}</h3>
                  <p className="text-sm text-gray-500">{member.email || '-'}</p>
                  <p className="text-sm text-gray-500">{member.telefono || '-'}</p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Congregación:</span> {member.congregacion?.nombre || '-'}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {member.tipoMiembro?.nombre || '-'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      member.estado?.nombre === 'Activo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {member.estado?.nombre || '-'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 ml-4">
                  <button
                    onClick={() => handleEdit(member)}
                    className="text-indigo-600 hover:text-indigo-900 text-sm"
                  >
                    Editar
                  </button>
                  {member.id_estado === 6 ? (
                    <button
                      onClick={async () => {
                        if (confirm('¿Activar este miembro?')) {
                          await toggleMemberStatus(member.id_miembro);
                        }
                      }}
                      className="text-green-600 hover:text-green-900 text-sm"
                    >
                      Activar
                    </button>
                  ) : member.id_estado !== 21 && (
                    <button
                      onClick={async () => {
                        if (confirm('¿Inactivar este miembro?')) {
                          await toggleMemberStatus(member.id_miembro);
                        }
                      }}
                      className="text-orange-600 hover:text-orange-900 text-sm"
                    >
                      Inactivar
                    </button>
                  )}
                  {member.id_estado !== 21 && (
                    <button
                      onClick={async () => {
                        if (confirm('¿Estás seguro de ELIMINAR este miembro? Esta acción no se puede deshacer.')) {
                          await deleteMember(member.id_miembro);
                        }
                      }}
                      className="text-red-600 hover:text-red-900 text-sm"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 md:p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg md:text-xl font-bold mb-4">
              {editingMember ? 'Editar Miembro' : 'Nuevo Miembro'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombres *</label>
                  <input
                    {...register('nombres', { required: 'Nombres requeridos' })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  {errors.nombres && <span className="text-red-500 text-sm">{errors.nombres.message}</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Apellidos *</label>
                  <input
                    {...register('apellidos', { required: 'Apellidos requeridos' })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  {errors.apellidos && <span className="text-red-500 text-sm">{errors.apellidos.message}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">RUT</label>
                  <input
                    {...register('rut')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="12345678-9"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    {...register('fecha_nacimiento')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Género</label>
                  <select
                    {...register('genero')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Seleccionar</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado Civil</label>
                  <select
                    {...register('estado_civil')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Seleccionar</option>
                    <option value="soltero">Soltero</option>
                    <option value="casado">Casado</option>
                    <option value="divorciado">Divorciado</option>
                    <option value="viudo">Viudo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  {...register('email')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
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
                  <label className="block text-sm font-medium text-gray-700">Dirección</label>
                  <input
                    {...register('direccion')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Miembro *</label>
                  <select
                    {...register('id_tipo_miembro', { required: 'Tipo requerido' })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Seleccionar</option>
                    {meta.tipos.map(tipo => (
                      <option key={tipo.id_tipo} value={tipo.id_tipo}>{tipo.nombre}</option>
                    ))}
                  </select>
                  {errors.id_tipo_miembro && <span className="text-red-500 text-sm">{errors.id_tipo_miembro.message}</span>}
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
                <label className="block text-sm font-medium text-gray-700">Institución (opcional)</label>
                <select
                  {...register('id_institucion')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Sin institución</option>
                  {meta.instituciones.map(inst => (
                    <option key={inst.id_institucion} value={inst.id_institucion}>{inst.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
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