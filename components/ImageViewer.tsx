import React, { useMemo } from 'react';

interface ImageViewerProps {
  url: string;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ url }) => {
  
  const processedUrl = useMemo(() => {
    if (!url) return '';
    
    // Handle Google Drive Links
    // Pattern: https://drive.google.com/file/d/[ID]/view...
    const driveRegex = /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
    const match = url.match(driveRegex);
    
    if (match && match[1]) {
      // Using the thumbnail API for better performance and direct access
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
    }
    
    return url;
  }, [url]);

  const [hasError, setHasError] = React.useState(false);

  // Reset error state when URL changes
  React.useEffect(() => {
    setHasError(false);
  }, [processedUrl]);

  if (!url) {
     return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl border border-gray-200 p-8">
            <div className="text-center text-gray-400">
                <svg className="mx-auto h-20 w-20 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-4 text-lg font-medium">Sin imagen seleccionada</p>
                <p className="text-sm opacity-75">Selecciona un registro con URL válida.</p>
            </div>
        </div>
     )
  }

  if (hasError) {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-8">
            <div className="text-center max-w-md">
                <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100 mb-6">
                    <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-2">No se pudo cargar la imagen</h3>
                <p className="text-gray-500 mb-6 leading-relaxed">
                    El enlace parece estar roto, no es una imagen directa o requiere permisos de acceso.
                </p>

                <div className="bg-white p-3 rounded border border-gray-200 mb-6 text-left shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">URL de origen:</p>
                    <p className="text-xs text-gray-600 font-mono break-all line-clamp-3">{url}</p>
                </div>

                <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:text-primary-600 hover:border-primary-300 transition-all shadow-sm"
                >
                    <span>Abrir enlace original</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
            </div>
        </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-xl overflow-hidden shadow-inner relative group">
      <img
        src={processedUrl}
        alt="Visualización del registro"
        className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
        onError={() => setHasError(true)}
      />
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
          <a href={processedUrl} target="_blank" rel="noreferrer" className="text-white text-xs bg-white/20 hover:bg-white/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 flex items-center gap-2 transition-colors">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
              Ver tamaño completo
          </a>
      </div>
    </div>
  );
};