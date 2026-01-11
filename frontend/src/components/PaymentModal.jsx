import { useState } from 'react';
import PropTypes from 'prop-types';

const PaymentModal = ({ order, isOpen, onClose, onConfirm }) => {
    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('efectivo');
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const handleSubmit = async () => {
        setIsProcessing(true);
        await onConfirm(paymentMethod);
        setIsProcessing(false);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                
                {/* Background overlay */}
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                    {/* Header */}
                    <div className="bg-brand-50 px-4 py-3 border-b border-brand-100 flex justify-between items-center">
                        <h3 className="text-lg leading-6 font-bold text-brand-800" id="modal-title">
                            {step === 1 && 'Resumen de Orden'}
                            {step === 2 && 'Método de Pago'}
                            {step === 3 && 'Confirmar Pago'}
                        </h3>
                         <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                            <span className="sr-only">Cerrar</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        {/* Step 1: Resumen */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-500">Orden #:</span>
                                        <span className="font-semibold text-gray-900">{order.id}</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-500">Total a Pagar:</span>
                                        <span className="font-bold text-2xl text-brand-700">${order.total ? order.total.toFixed(2) : '0.00'}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 text-center">
                                    Por favor verifique que los trabajos en la orden estén completados antes de proceder.
                                </p>
                            </div>
                        )}

                        {/* Step 2: Método */}
                        {step === 2 && (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600 mb-4">Seleccione cómo desea realizar el cobro:</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setPaymentMethod('efectivo')}
                                        className={`p-4 border-2 rounded-xl flex flex-col items-center justify-center transition-all ${paymentMethod === 'efectivo' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 hover:border-brand-200'}`}
                                    >
                                        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                        <span className="font-medium">Efectivo</span>
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('tarjeta')}
                                        className={`p-4 border-2 rounded-xl flex flex-col items-center justify-center transition-all ${paymentMethod === 'tarjeta' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 hover:border-brand-200'}`}
                                    >
                                        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                        <span className="font-medium">Tarjeta</span>
                                    </button>
                                     <button
                                        onClick={() => setPaymentMethod('transferencia')}
                                        className={`p-4 border-2 rounded-xl flex flex-col items-center justify-center transition-all ${paymentMethod === 'transferencia' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 hover:border-brand-200'}`}
                                    >
                                        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
                                        <span className="font-medium">Transferencia</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Confirmación Final (Opcional si Step 2 basta, pero hagamos confirmación) */}
                         {/* Actually, user said 1,2,3 pngs. Step 3 might be "Processing" or "Success". Let's optimize. */}
                    </div>

                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                         {step === 2 ? (
                            <button
                                type="button"
                                disabled={isProcessing}
                                onClick={handleSubmit}
                                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-600 text-base font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 sm:ml-3 sm:w-auto sm:text-sm ${isProcessing ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {isProcessing ? 'Procesando...' : 'Confirmar y Facturar'}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-600 text-base font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                                Siguiente
                            </button>
                        )}

                        {step > 1 && (
                            <button
                                type="button"
                                disabled={isProcessing}
                                onClick={handleBack}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                                Atrás
                            </button>
                        )}
                         {step === 1 && (
                             <button
                                type="button"
                                onClick={onClose}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                                Cancelar
                            </button>
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
};

PaymentModal.propTypes = {
    order: PropTypes.object.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired
};

export default PaymentModal;
