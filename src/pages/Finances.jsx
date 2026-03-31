import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useFinanceStore } from '../store/financeStore';

export default function Finances() {
  const { transactions, loading, fetchTransactions, createTransaction } = useFinanceStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const onSubmit = async (data) => {
    const result = await createTransaction({
      ...data,
      amount: parseFloat(data.amount),
    });
    
    if (result.success) {
      setIsModalOpen(false);
      reset();
    }
  };

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Finanzas</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Nueva Transacción
        </button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Ingresos Totales</h3>
          <p className="text-3xl font-bold text-green-600">${totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Egresos Totales</h3>
          <p className="text-3xl font-bold text-red-600">${totalExpense.toLocaleString()}</p>
        </div>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        transaction.type === 'income'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {transaction.type === 'income' ? 'Ingreso' : 'Egreso'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{transaction.description}</td>
                  <td className={`px-6 py-4 whitespace-nowrap font-medium ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
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
            <h2 className="text-xl font-bold mb-4">Nueva Transacción</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo</label>
                <select
                  {...register('type', { required: 'Tipo requerido' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="income">Ingreso</option>
                  <option value="expense">Egreso</option>
                </select>
                {errors.type && <span className="text-red-500 text-sm">{errors.type.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Monto</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('amount', { required: 'Monto requerido' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                {errors.amount && <span className="text-red-500 text-sm">{errors.amount.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  {...register('description', { required: 'Descripción requerida' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
                {errors.description && <span className="text-red-500 text-sm">{errors.description.message}</span>}
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
    </div>
  );
}
