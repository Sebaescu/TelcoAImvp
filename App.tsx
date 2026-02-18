import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { FileUpload } from './components/FileUpload';
import { ColumnConfigurator } from './components/ColumnConfigurator';
import { Editor } from './components/Editor';
import { AppState, ColumnConfig, RowData } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    step: 'upload',
    rawData: [],
    columns: [],
    data: [],
  });

  const handleDataLoaded = (data: any[]) => {
    if (data.length === 0) return;
    
    // Get headers from first row
    const headers = Object.keys(data[0]);
    
    setAppState(prev => ({
      ...prev,
      rawData: data,
      // Initialize data immediately, though it might be re-mapped later
      data: data,
      step: 'config'
    }));
  };

  const handleConfigConfirmed = (configs: ColumnConfig[]) => {
    setAppState(prev => ({
      ...prev,
      columns: configs,
      step: 'editor'
    }));
  };

  const handleDataUpdate = (newData: RowData[]) => {
    setAppState(prev => ({
      ...prev,
      data: newData
    }));
  };

  const handleBackToConfig = () => {
    // Logic moved to Editor.tsx to ensure confirmation happens at the UI level
    // This function now simply executes the state change
    setAppState(prev => ({
        ...prev,
        step: 'config'
    }));
  };

  const handleBackToUpload = () => {
      // Reset state completely to allow choosing a new file
      setAppState({
        step: 'upload',
        rawData: [],
        columns: [],
        data: [],
      });
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50 text-gray-900 font-sans">
      {appState.step === 'upload' && (
        <FileUpload onDataLoaded={handleDataLoaded} />
      )}

      {appState.step === 'config' && (
        <ColumnConfigurator 
            initialHeaders={Object.keys(appState.rawData[0] || {})} 
            onConfirm={handleConfigConfirmed}
            onBack={handleBackToUpload}
        />
      )}

      {appState.step === 'editor' && (
        <Editor 
            state={appState} 
            onUpdateData={handleDataUpdate}
            onBack={handleBackToConfig}
        />
      )}
    </div>
  );
};

export default App;