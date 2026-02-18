import React, { useState, useEffect } from 'react';
import { ColumnConfig, DataType, Permission } from '../types';

interface ColumnConfiguratorProps {
  initialHeaders: string[];
  onConfirm: (config: ColumnConfig[]) => void;
  onBack: () => void;
}

export const ColumnConfigurator: React.FC<ColumnConfiguratorProps> = ({ initialHeaders, onConfirm, onBack }) => {
  const [configs, setConfigs] = useState<ColumnConfig[]>([]);
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    // Initialize config based on headers
    const initialConfig: ColumnConfig[] = initialHeaders.map((header) => {
      // Auto-detect potential image column
      const isLikelyUrl = ['image', 'imagen', 'foto', 'photo', 'url', 'link'].some(k => header.toLowerCase().includes(k));
      
      return {
        originalHeader: header,
        displayName: header,
        dataType: isLikelyUrl ? 'url' : 'text',
        permission: 'readwrite',
        options: [] // Initialize empty options
      };
    });

    // Ensure only one URL column is auto-selected initially to prevent conflicts
    let urlCount = 0;
    initialConfig.forEach(c => {
        if (c.dataType === 'url') {
            urlCount++;
            if (urlCount > 1) c.dataType = 'text'; // Revert subsequent URLs to text
        }
    });

    setConfigs(initialConfig);
  }, [initialHeaders]);

  const updateConfig = (index: number, field: keyof ColumnConfig, value: any) => {
    const newConfigs = [...configs];
    // @ts-ignore - dynamic assignment
    newConfigs[index][field] = value;
    
    // Ensure options array exists if switching to select, but keep it empty (User request)
    if (field === 'dataType' && value === 'select' && !newConfigs[index].options) {
        newConfigs[index].options = [];
    }
    
    setConfigs(newConfigs);
  };

  const addOption = (index: number, optionValue: string) => {
    if (!optionValue.trim()) return;
    const newConfigs = [...configs];
    if (!newConfigs[index].options) newConfigs[index].options = [];
    
    if (!newConfigs[index].options!.includes(optionValue.trim())) {
        newConfigs[index].options!.push(optionValue.trim());
    }
    setConfigs(newConfigs);
  };

  const removeOption = (configIndex: number, optionIndex: number) => {
    const newConfigs = [...configs];
    if (newConfigs[configIndex].options) {
        newConfigs[configIndex].options!.splice(optionIndex, 1);
    }
    setConfigs(newConfigs);
  };

  const handleDeleteColumn = (index: number) => {
    // Removed confirmation dialog to allow fast cleanup of unwanted columns
    const newConfigs = [...configs];
    newConfigs.splice(index, 1);
    setConfigs(newConfigs);
  };

  const handleAddColumn = () => {
    const newConfigs = [...configs];
    // Create a unique key for the new column
    const tempId = `custom_col_${Date.now()}`;
    
    newConfigs.push({
        originalHeader: tempId,
        displayName: 'Nueva Columna',
        dataType: 'text',
        permission: 'readwrite',
        options: []
    });
    setConfigs(newConfigs);
  };

  const handleConfirm = () => {
    const urlColumns = configs.filter(c => c.dataType === 'url');
    
    if (urlColumns.length > 1) {
      alert(`Error: Tienes ${urlColumns.length} columnas configuradas como 'URL'. Por favor selecciona solo una columna que contenga la imagen principal.`);
      return;
    }

    // Validate select options
    const invalidSelects = configs.filter(c => c.dataType === 'select' && (!c.options || c.options.length === 0));
    if (invalidSelects.length > 0) {
        alert(`Error: La columna "${invalidSelects[0].displayName}" es de tipo Selector pero no tiene opciones definidas.`);
        return;
    }
    
    if (configs.length === 0) {
        alert("Error: Debes tener al menos una columna configurada.");
        return;
    }

    onConfirm(configs);
  };

  const handleBackClick = () => {
      setShowExitModal(true);
  };

  const confirmExit = () => {
      setShowExitModal(false);
      onBack();
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden relative">
      
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
                     <h3 className="text-xl font-bold text-gray-800">¿Cambiar de archivo?</h3>
                </div>
                
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    Si vuelves a la pantalla de carga, la configuración actual de las columnas se perderá y tendrás que empezar de nuevo.
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
                        Sí, cambiar archivo
                    </button>
                </div>
            </div>
        </div>
      )}

      <div className="flex-none p-6 bg-white border-b shadow-sm z-10 flex justify-between items-center">
        <div className="flex items-center gap-4">
             <button 
                type="button"
                onClick={handleBackClick} 
                className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors px-3 py-1.5 rounded-md hover:bg-gray-100 active:bg-gray-200"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                <span className="font-medium">Cambiar Archivo</span>
            </button>
            <div className="h-8 w-px bg-gray-300"></div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Configuración de Columnas</h2>
              <p className="text-sm text-gray-500">Define tipos de datos y permisos. <span className="text-primary-600 font-medium">Opcional: Define una columna URL para ver imágenes.</span></p>
            </div>
        </div>
        <button
          onClick={handleConfirm}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg shadow-md transition-all font-medium flex items-center gap-2"
        >
          <span>Confirmar y Comenzar</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-[20%]">Columna Excel (ID)</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-[25%]">Nombre Visual</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-[35%]">Tipo & Configuración</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-[15%]">Permisos</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-[5%]">Acción</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {configs.map((conf, idx) => (
                <tr key={conf.originalHeader} className={`hover:bg-gray-50 transition-colors ${conf.dataType === 'url' ? 'bg-blue-50/50' : ''}`}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 break-words align-top">
                    <span title={conf.originalHeader} className={conf.originalHeader.startsWith('custom_col_') ? 'text-gray-400 italic' : ''}>
                        {conf.originalHeader.startsWith('custom_col_') ? '(Nueva)' : conf.originalHeader}
                    </span>
                    {conf.dataType === 'url' && (
                        <div className="mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800">
                            Imagen Principal
                            </span>
                        </div>
                    )}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <input
                      type="text"
                      value={conf.displayName}
                      onChange={(e) => updateConfig(idx, 'displayName', e.target.value)}
                      className="bg-white text-gray-900 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm px-3 py-2 border"
                    />
                  </td>
                  <td className="px-6 py-4 space-y-2 align-top">
                    <select
                      value={conf.dataType}
                      onChange={(e) => updateConfig(idx, 'dataType', e.target.value as DataType)}
                      className={`block w-full pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md border ${conf.dataType === 'url' ? 'border-blue-300 bg-white text-blue-700 font-semibold' : 'border-gray-300 bg-white text-gray-900'}`}
                    >
                      <option value="text">Texto</option>
                      <option value="number">Número</option>
                      <option value="select">Selector (Lista de Opciones)</option>
                      <option value="date">Fecha</option>
                      <option value="url">URL (Imagen)</option>
                    </select>

                    {conf.dataType === 'select' && (
                        <div className="mt-2 bg-gray-50 p-2 rounded border border-gray-200">
                            <label className="block text-xs font-semibold text-gray-500 mb-2">Opciones disponibles:</label>
                            
                            <div className="flex flex-wrap gap-2 mb-2">
                                {conf.options?.map((opt, optIdx) => (
                                    <span key={optIdx} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-white border border-gray-300 text-gray-700 shadow-sm">
                                        {opt}
                                        <button
                                            type="button"
                                            onClick={() => removeOption(idx, optIdx)}
                                            className="ml-1.5 text-gray-400 hover:text-red-500 focus:outline-none"
                                            title="Eliminar opción"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                            
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Nueva opción + Enter"
                                    className="flex-1 text-xs border border-gray-300 rounded px-2 py-1.5 bg-white text-gray-900 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addOption(idx, e.currentTarget.value);
                                            e.currentTarget.value = '';
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-600 px-3 py-1 rounded text-xs font-bold transition-colors"
                                    onClick={(e) => {
                                         const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                         addOption(idx, input.value);
                                         input.value = '';
                                    }}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    )}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <select
                      value={conf.permission}
                      onChange={(e) => updateConfig(idx, 'permission', e.target.value as Permission)}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md border"
                    >
                      <option value="readonly">Solo Lectura</option>
                      <option value="readwrite">Lectura/Escritura</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 align-middle text-center">
                      <button 
                        onClick={() => handleDeleteColumn(idx)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                        title="Eliminar columna"
                      >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex justify-center pb-8">
            <button
                onClick={handleAddColumn}
                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-bold hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all shadow-sm"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                Agregar Nueva Columna
            </button>
        </div>
      </div>
    </div>
  );
};