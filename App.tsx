
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import Calculator from './components/Calculator';
import OrdersList from './components/OrdersList';
import Settings from './components/Settings';
import CustomAlert from './components/CustomAlert';

type View = 'calculator' | 'orders' | 'settings';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('calculator');
  const [alertState, setAlertState] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: '',
  });

  const showAlert = useCallback((message: string) => {
    setAlertState({ isOpen: true, message });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState({ isOpen: false, message: '' });
  }, []);
  
  const renderView = () => {
    switch (currentView) {
      case 'calculator':
        return <Calculator showAlert={showAlert} switchView={setCurrentView} />;
      case 'orders':
        return <OrdersList showAlert={showAlert} />;
      case 'settings':
        return <Settings showAlert={showAlert} />;
      default:
        return <Calculator showAlert={showAlert} switchView={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <main className="p-4 sm:p-6 lg:p-8">
        {renderView()}
      </main>
      <CustomAlert
        isOpen={alertState.isOpen}
        message={alertState.message}
        onClose={hideAlert}
      />
    </div>
  );
};

export default App;
