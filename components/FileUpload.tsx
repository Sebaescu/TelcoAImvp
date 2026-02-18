import React, { useCallback, useState } from 'react';
import { readExcel } from '../services/excelService';

interface FileUploadProps {
  onDataLoaded: (data: any[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const data = await readExcel(file);
      if (data.length === 0) {
        throw new Error("El archivo parece estar vacío.");
      }
      onDataLoaded(data);
    } catch (err) {
      console.error(err);
      setError("Error al leer el archivo Excel. Asegúrate de que sea un formato válido (.xlsx, .xls).");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-gray-50">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Telconet AI</h1>
        <p className="mt-2 text-lg text-gray-600">Visualiza y edita datos con imágenes de forma rápida.</p>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          w-full max-w-xl p-12 rounded-3xl border-4 border-dashed transition-all duration-300 ease-out cursor-pointer group
          ${isDragging 
            ? 'border-primary-500 bg-primary-50 scale-105 shadow-xl' 
            : 'border-gray-300 bg-white hover:border-primary-400 hover:shadow-lg'
          }
        `}
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className={`p-4 rounded-full ${isDragging ? 'bg-primary-100' : 'bg-gray-100 group-hover:bg-primary-50'} transition-colors`}>
            <svg className={`w-12 h-12 ${isDragging ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          <div>
            <p className="text-xl font-semibold text-gray-700">
              {loading ? 'Procesando...' : 'Arrastra tu archivo Excel aquí'}
            </p>
            <p className="mt-1 text-sm text-gray-500">o haz clic para seleccionar</p>
          </div>
          
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
            disabled={loading}
          />
        </div>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}
    </div>
  );
};