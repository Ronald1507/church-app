import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useFinanceStore } from '../store/financeStore';
import api from '../services/api';

export default function Finances() {
  const { cuentas, transacciones, loading, fetchCuentas, fetchTransacciones, createCuenta, createTransaccion, deleteTransaccion, deleteCuenta } = useFinanceStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('cuenta'); // 'cuenta' o 'transaccion'
  const [meta, setMeta] = useState({ estados: [], congregaciones: [] });
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchCuentas();
    fetchTransacciones();
    fetchMeta();
  }, []);

  const fetchMeta = async () => {
    try {
      const response = await api.get('/finanzas/meta');
      setMeta(response.data);
    } catch (error) {
      console.error('Error fetching meta:', error);
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
    reset({ id_estado: '', id_congregacion: '' });
  };

  const onSubmit = async (data) => {
    let result;
    if (modalType === 'cuenta') {
      result = await createCuenta({
        ...data,
        id_estado: parseInt(data.id_estado),
        id_congregacion: parseInt(data.id_congregacion)
      });
    } else {
      result = await createTransaccion({
        ...data,
        id_cuenta: parseInt(data.id_cuenta),
        monto: parseFloat(data.monto),
        id_estado: parseInt(data.id_estado),
        id_registrado_por: 1 // Por ahora hardcodeado
      });
    }
    
    if (result.success) {
      setIsModalOpen(false);
      reset();
      if (modalType === 'cuenta') fetchCuentas();
      else fetchTransacciones();
    }
  };

  const handleDeleteTransaccion = async (id) => {
    if (confirm('¿Estás seguro de eliminar esta transacción?')) {
      await deleteTransaccion(id);
    }
  };

  const handleDeleteCuenta = async (id) => {
    if (confirm('¿Estás seguro de eliminar esta cuenta? Se eliminarán todas las transacciones relacionadas.')) {
      await deleteCuenta(id);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  // Calcular totales
  const totalIngresos = transacciones
    .filter(t => t.tipo === 'ingreso')
    .reduce((sum, t) => sum + parseFloat(t.monto), 0);
  
  const totalEgresos = transacciones
    .filter(t => t.tipo === 'egreso')
    .reduce((sum, t) => sum + parseFloat(t.monto), 0);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Finanzas</h1>
        <div className="space-x-2">
          <button
            onClick={() => openModal('cuenta')}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Nueva Cuenta
          </button>
          <button
            onClick={() => openModal('transaccion')}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Nueva Transacción
          </button>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Ingresos</h3>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIngresos)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Egresos</h3>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalEgresos)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Balance</h3>
          <p className={`text-2xl font-bold ${totalIngresos - totalEgresos >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(totalIngresos - totalEgresos)}
          </p>
        </div>
      </div>

      {/* Cuentas */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Cuentas</h2>
        {loading ? (
          <p>Cargando...</p>
        ) : cuentas.length === 0 ? (
          <p className="text-gray-500">No hay cuentas registradas</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cuentas.map((cuenta) => (
              <div key={cuenta.id_cuenta} className="bg-white p-4 rounded-lg shadow border-l-4 border-indigo-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{cuenta.nombre}</h3>
                    <p className="text-sm text-gray-500">{cuenta.tipo}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteCuenta(cuenta.id_cuenta)}
                    className="text-red-600 hover:text-red-900 text-sm"
                  >
                    Eliminar
                  </button>
                </div>
                <p className={`text-2xl font-bold mt-2 ${parseFloat(cuenta.saldo_actual) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(cuenta.saldo_actual)}
                </p>
                <p className="text-sm text-gray-500 mt-1">{cuenta.congregacion?.nombre}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transacciones */}
      <div>
        <h2 className="text-xl font-bold mb-4">Transacciones Recientes</h2>
        {loading ? (
          <p>Cargando...</p>
        ) : transacciones.length === 0 ? (
          <p className="text-gray-500">No hay transacciones registradas</p>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Concepto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cuenta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transacciones.map((trans) => (
                  <tr key={trans.id_transaccion}>
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(trans.fecha)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-sm ${
                        trans.tipo === 'ingreso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {trans.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}
                      </span>
                    </td>
                    <td className="px-6 py-4">{trans.concepto}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{trans.cuenta?.nombre || '-'}</td>
                    <td className={`px-6 py-4 whitespace-nowrap font-medium ${
                      trans.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {trans.tipo === 'ingreso' ? '+' : '-'}{formatCurrency(trans.monto)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteTransaccion(trans.id_transaccion)}
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
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {modalType === 'cuenta' ? 'Nueva Cuenta' : 'Nueva Transacción'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {modalType === 'cuenta' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                    <input
                      {...register('nombre', { required: 'Nombre requerido' })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    {errors.nombre && <span className="text-red-500 text-sm">{errors.nombre.message}</span>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo *</label>
                    <select
                      {...register('tipo', { required: 'Tipo requerido' })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Seleccionar</option>
                      <option value="corriente">Cuenta Corriente</option>
                      <option value="ahorro">Ahorro</option>
                      <option value="efectivo">Efectivo</option>
                    </select>
                    {errors.tipo && <span className="text-red-500 text-sm">{errors.tipo.message}</span>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                    <textarea
                      {...register('descripcion')}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={2}
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
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cuenta *</label>
                    <select
                      {...register('id_cuenta', { required: 'Cuenta requerida' })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Seleccionar</option>
                      {cuentas.map(cuenta => (
                        <option key={cuenta.id_cuenta} value={cuenta.id_cuenta}>{cuenta.nombre}</option>
                      ))}
                    </select>
                    {errors.id_cuenta && <span className="text-red-500 text-sm">{errors.id_cuenta.message}</span>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo *</label>
                    <select
                      {...register('tipo', { required: 'Tipo requerido' })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Seleccionar</option>
                      <option value="ingreso">Ingreso</option>
                      <option value="egreso">Egreso</option>
                    </select>
                    {errors.tipo && <span className="text-red-500 text-sm">{errors.tipo.message}</span>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Concepto *</label>
                    <input
                      {...register('concepto', { required: 'Concepto requerido' })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    {errors.concepto && <span className="text-red-500 text-sm">{errors.concepto.message}</span>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Monto *</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('monto', { required: 'Monto requerido' })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    {errors.monto && <span className="text-red-500 text-sm">{errors.monto.message}</span>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha</label>
                    <input
                      type="date"
                      {...register('fecha')}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Método de Pago</label>
                    <select
                      {...register('metodo_pago')}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Seleccionar</option>
                      <option value="efectivo">Efectivo</option>
                      <option value="transferencia">Transferencia</option>
                      <option value="cheque">Cheque</option>
                      <option value="otro">Otro</option>
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
                </>
              )}

              <div className="flex gap-4 pt-4">
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
    </div>
  );
}