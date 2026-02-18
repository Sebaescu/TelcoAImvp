import React, { useState, useEffect, useCallback, useLayoutEffect, useRef } from 'react';
import { AppState, RowData, ColumnConfig } from '../types';
import { ImageViewer } from './ImageViewer';

interface EditorProps {
  state: AppState;
  onUpdateData: (newData: RowData[]) => void;
  onBack: () => void;
}

// Internal component for auto-resizing textarea
const AutoResizingTextarea = ({ 
    value, 
    onChange, 
    className, 
    placeholder,
    autoFocus 
}: { 
    value: string, 
    onChange: (val: string) => void, 
    className: string, 
    placeholder?: string,
    autoFocus?: boolean
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useLayoutEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            // Reset height to auto to correctly calculate scrollHeight for shrinking content
            textarea.style.height = 'auto';
            // Set new height based on scrollHeight
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [value]);

    return (
        <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`${className} overflow-hidden resize-none transition-height duration-100 ease-out`}
            placeholder={placeholder}
            rows={1}
            autoFocus={autoFocus}
            style={{ minHeight: '42px' }} // Match standard input height roughly
        />
    );
};

export const Editor: React.FC<EditorProps> = ({ state, onUpdateData, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [workingData, setWorkingData] = useState<RowData[]>(state.data);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  const currentItem = workingData[currentIndex];
  const totalItems = workingData.length;
  
  // Identify the URL column based on dataType
  const imageColumnKey = state.columns.find(c => c.dataType === 'url')?.originalHeader || '';

  const handleNext = useCallback(() => {
    if (currentIndex < totalItems - 1) setCurrentIndex(prev => prev + 1);
  }, [currentIndex, totalItems]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  }, [currentIndex]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return; 
    }
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'ArrowLeft') handlePrev();
  }, [handleNext, handlePrev]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleFieldChange = (key: string, value: any) => {
    const newData = [...workingData];
    newData[currentIndex] = { ...newData[currentIndex], [key]: value };
    setWorkingData(newData);
    if (validationError) setValidationError(null); // Clear error on change
  };

  const validateData = (): boolean => {
      // Validate URLs in all records
      const urlColumns = state.columns.filter(c => c.dataType === 'url');
      
      for (let i = 0; i < workingData.length; i++) {
          const row = workingData[i];
          for (const col of urlColumns) {
              const val = row[col.originalHeader];
              if (val && typeof val === 'string' && val.trim() !== '') {
                  const isValid = /^(http|https):\/\/[^ "]+$/.test(val);
                  if (!isValid) {
                      setValidationError(`Error en registro #${i + 1}: La columna "${col.displayName}" contiene una URL inválida.`);
                      setCurrentIndex(i); // Jump to error
                      return false;
                  }
              }
          }
      }
      return true;
  };

  const saveChanges = () => {
    if (!validateData()) return;
    onUpdateData(workingData);
    
    // Show Toast
    setShowToast(true);
    setTimeout(() => {
        setShowToast(false);
    }, 3000);
  };

  const handleBackClick = () => {
      setShowExitModal(true);
  };

  const confirmExit = () => {
      setShowExitModal(false);
      onBack();
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 overflow-hidden font-sans relative">
      
      {/* Success Toast Notification */}
      <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] transition-all duration-500 ease-in-out ${showToast ? 'translate-y-0 opacity-100' : '-translate-y-16 opacity-0 pointer-events-none'}`}>
          <div className="bg-green-600 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 border border-green-500/50 backdrop-blur-sm">
              <div className="bg-white/20 p-1 rounded-full">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-bold text-sm tracking-wide">Cambios guardados exitosamente</span>
          </div>
      </div>

      {/* Custom Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 transform transition-all scale-100">
                <div className="flex items-center gap-4 mb-4 text-amber-600">
                     <div className="p-3 bg-amber-50 rounded-full">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                     </div>
                     <h3 className="text-xl font-bold text-gray-800">¿Estás seguro de volver?</h3>
                </div>
                
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    Si vuelves a la configuración de columnas sin guardar, podrías perder los cambios realizados en esta sesión de edición.
                    <br/><br/>
                    <strong>Tip:</strong> Usa el botón "Guardar Progreso" antes de salir.
                </p>

                <div className="flex items-center justify-end gap-3">
                    <button 
                        onClick={() => setShowExitModal(false)}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={confirmExit}
                        className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-bold shadow-md hover:shadow-lg transition-all"
                    >
                        Sí, volver
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Header */}
      <header className="flex-none bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-4">
            <button 
                type="button"
                onClick={handleBackClick} 
                className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors px-3 py-1.5 rounded-md hover:bg-gray-100 active:bg-gray-200"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                <span className="font-medium">Volver</span>
            </button>
            <div className="h-6 w-px bg-gray-300 mx-2"></div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">Editor de Datos</h1>
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                Registro {currentIndex + 1} de {totalItems}
            </span>
        </div>
        <div className="flex items-center gap-3">
             {validationError && (
                 <span className="text-red-600 text-sm font-medium animate-pulse mr-4 bg-red-50 px-3 py-1 rounded border border-red-200">
                     ⚠️ {validationError}
                 </span>
             )}
            <button 
                onClick={saveChanges}
                className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg shadow-md hover:shadow-lg text-sm font-bold flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
                Guardar Progreso
            </button>
        </div>
      </header>

      {/* Main Content Split - 50/50 Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left: Image Viewer (50%) */}
        <div className="w-1/2 flex-none bg-gray-900 flex flex-col relative border-r border-gray-800">
           <div className="flex-1 relative overflow-hidden bg-[#0f1115] flex items-center justify-center p-4">
                <ImageViewer url={currentItem?.[imageColumnKey]} />
           </div>
           
           {/* Navigation Bar */}
           <div className="h-20 bg-gray-800 border-t border-gray-700 flex items-center justify-between px-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)] z-10">
               <button 
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="flex items-center gap-3 px-6 py-2.5 rounded-full bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium border border-gray-600 hover:border-gray-500 shadow-lg"
               >
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                   Anterior
               </button>
               
               <div className="text-gray-400 text-sm font-mono flex gap-2">
                   <kbd className="bg-gray-700 px-2 py-1 rounded border border-gray-600 text-gray-300">←</kbd> 
                   o 
                   <kbd className="bg-gray-700 px-2 py-1 rounded border border-gray-600 text-gray-300">→</kbd>
                   para navegar
               </div>

               <button 
                onClick={handleNext}
                disabled={currentIndex === totalItems - 1}
                className="flex items-center gap-3 px-6 py-2.5 rounded-full bg-primary-600 hover:bg-primary-500 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium border border-primary-500 hover:border-primary-400 shadow-lg shadow-primary-900/50"
               >
                   Siguiente
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
               </button>
           </div>
        </div>

        {/* Right: Data Form (50%) with 2-Column Grid */}
        <div className="w-1/2 flex-none bg-gray-50 overflow-y-auto custom-scrollbar">
            <div className="p-6 pb-32"> 
                <div className="mb-6 flex items-baseline justify-between border-b border-gray-200 pb-2">
                    <h2 className="text-xl font-bold text-gray-800">Detalles del Registro</h2>
                </div>
                
                {/* Strict 2 Column Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {state.columns.map((col, idx) => {
                        const value = currentItem?.[col.originalHeader] ?? '';
                        const isReadOnly = col.permission === 'readonly';
                        
                        // Smart width calculation: 
                        // If it's a URL or the text is significantly long (> 70 chars), use full width.
                        const isVeryLong = (col.dataType === 'url') || (col.dataType === 'text' && String(value).length > 70);
                        const isFullWidth = isVeryLong; 

                        return (
                            <div key={idx} className={`group bg-white p-4 rounded-xl border shadow-sm transition-all hover:shadow-md ${isFullWidth ? 'col-span-2' : ''} ${isReadOnly ? 'border-gray-200 bg-gray-50/50' : 'border-gray-300 ring-1 ring-transparent focus-within:ring-primary-500 focus-within:border-primary-500'}`}>
                                <label 
                                    className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 break-words whitespace-normal leading-snug" 
                                    title={col.displayName}
                                >
                                    {col.displayName} 
                                    {col.dataType === 'url' && <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded align-middle">URL</span>}
                                </label>
                                
                                {isReadOnly ? (
                                    <div className="p-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 text-sm break-words leading-relaxed max-h-32 overflow-y-auto">
                                        {col.dataType === 'select' 
                                            ? String(value)
                                            : (String(value) || <span className="text-gray-400 italic">Vacío</span>)
                                        }
                                    </div>
                                ) : (
                                    renderInput(col, value, (val) => handleFieldChange(col.originalHeader, val))
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

// Helper to render specific inputs based on type
const renderInput = (col: ColumnConfig, value: any, onChange: (val: any) => void) => {
    // Explicit bg-white and text-gray-900 to ensure high contrast
    const baseClass = "block w-full rounded-lg border-gray-300 bg-white text-gray-900 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2.5 border leading-relaxed";

    switch (col.dataType) {
        case 'select':
            return (
                <div className="relative">
                    <select
                        value={String(value)}
                        onChange={(e) => onChange(e.target.value)}
                        className={`${baseClass} appearance-none cursor-pointer hover:bg-gray-50`}
                    >
                        <option value="">Seleccionar opción...</option>
                        {col.options?.map((opt, idx) => (
                            <option key={idx} value={opt}>{opt}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>
            );
        case 'number':
            return (
                <input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
                    className={baseClass}
                    placeholder="#"
                />
            );
        case 'date':
            return (
                <input
                    type="date"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={baseClass}
                />
            );
        case 'url':
             return (
                 <AutoResizingTextarea 
                    value={String(value)}
                    onChange={onChange}
                    className={`${baseClass} text-blue-600 underline text-xs break-all`}
                    placeholder="https://..."
                 />
             )
        case 'text':
        default:
            return (
                <AutoResizingTextarea
                    value={String(value)}
                    onChange={onChange}
                    className={baseClass}
                    placeholder="Escriba aquí..."
                />
            );
    }
}