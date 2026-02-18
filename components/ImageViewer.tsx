import React, { useMemo } from 'react';

interface ImageViewerProps {
  url: string;
}

function extractDriveId(url: string): string | null {
  const match = url.match(/https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

function getDriveUrlCandidates(id: string): string[] {
  return [
    // thumbnail API - works for publicly shared images, no redirect loops
    `https://drive.google.com/thumbnail?id=${id}&sz=w1600`,
    `https://drive.google.com/thumbnail?id=${id}&sz=w800`,
    // uc export - last resort, may redirect to virus-scan page for large files
    `https://drive.google.com/uc?export=view&id=${id}`,
  ];
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ url }) => {
  const driveId = useMemo(() => (url ? extractDriveId(url) : null), [url]);
  const candidates = useMemo(() => (driveId ? getDriveUrlCandidates(driveId) : [url]), [driveId, url]);

  const [attemptIndex, setAttemptIndex] = React.useState(0);

  React.useEffect(() => {
    setAttemptIndex(0);
  }, [url]);

  const currentSrc = candidates[attemptIndex] ?? '';
  const allFailed = attemptIndex >= candidates.length;

  const handleError = () => {
    if (attemptIndex + 1 < candidates.length) {
      setAttemptIndex(i => i + 1);
    } else {
      setAttemptIndex(candidates.length);
    }
  };

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
    );
  }

  if (allFailed) {
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

  // For Google Drive links use an iframe with /preview — the browser carries the
  // user's Google session cookies so private (shared-with-account) files work.
  if (driveId) {
    const previewUrl = `https://drive.google.com/file/d/${driveId}/preview`;
    return (
      <div className="w-full h-full flex flex-col bg-gray-900 rounded-xl overflow-hidden shadow-inner relative group">
        <iframe
          key={previewUrl}
          src={previewUrl}
          className="w-full h-full border-0"
          allow="autoplay"
          title="Visualización del registro"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
          <a href={url} target="_blank" rel="noreferrer" className="text-white text-xs bg-white/20 hover:bg-white/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 flex items-center gap-2 transition-colors">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
            Ver tamaño completo
          </a>
        </div>
      </div>
    );
  }

  // For non-Drive URLs fall back to a plain img tag
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-xl overflow-hidden shadow-inner relative group">
      <img
        key={currentSrc}
        src={currentSrc}
        alt="Visualización del registro"
        className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
        onError={handleError}
      />
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
        <a href={currentSrc} target="_blank" rel="noreferrer" className="text-white text-xs bg-white/20 hover:bg-white/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 flex items-center gap-2 transition-colors">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
          Ver tamaño completo
        </a>
      </div>
    </div>
  );
};