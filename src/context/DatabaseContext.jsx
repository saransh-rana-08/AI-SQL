import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialDatabaseConfig, mockTables, mockSampleQueries } from '../data/mockDatabase';
import { synthesizeSQLFromPrompt, AI_GENERATION_STEPS } from '../services/sqlGenerator';

const DatabaseContext = createContext();

export function DatabaseProvider({ children }) {
  const [currentView, setCurrentView] = useState('dashboard');
  const [dbConfig, setDbConfig] = useState(initialDatabaseConfig);
  const [tables, setTables] = useState(mockTables);
  const [historyList, setHistoryList] = useState(mockSampleQueries);

  // Active query state
  const [queryPrompt, setQueryPrompt] = useState('Show the top 5 students by CGPA');
  const [activeQuery, setActiveQuery] = useState(mockSampleQueries[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);

  // Modals & UI states
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Toast notification helper
  const addToast = (title, message = '', type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Navigation helper
  const navigate = (view, extraState = {}) => {
    setCurrentView(view);
    if (extraState.prompt !== undefined) {
      setQueryPrompt(extraState.prompt);
    }
    if (extraState.runImmediately && extraState.prompt) {
      executeAiGeneration(extraState.prompt);
    }
  };

  // Simulated AI query generation with realistic stepped feedback
  const executeAiGeneration = (promptToRun) => {
    if (!dbConfig.connected) {
      addToast('No Database Connected', 'Please connect a database before asking queries.', 'error');
      setIsConnectionModalOpen(true);
      return;
    }

    const trimmed = (promptToRun || queryPrompt).trim();
    if (!trimmed) return;

    setIsGenerating(true);
    setGenerationStep(0);

    // Step 1
    const step1Timer = setTimeout(() => {
      setGenerationStep(1);
    }, 450);

    // Step 2
    const step2Timer = setTimeout(() => {
      setGenerationStep(2);
    }, 900);

    // Completion
    const step3Timer = setTimeout(() => {
      const generated = synthesizeSQLFromPrompt(trimmed);
      const newQueryItem = {
        id: 'q-' + Date.now(),
        prompt: trimmed,
        sql: generated.sql,
        executionTime: generated.executionTime,
        rowCount: generated.rowCount,
        status: generated.status,
        errorMessage: generated.errorMessage,
        columns: generated.columns,
        rows: generated.rows,
        timestamp: 'Just now'
      };

      setActiveQuery(newQueryItem);
      setHistoryList(prev => [newQueryItem, ...prev]);
      setIsGenerating(false);

      if (generated.status === 'Success') {
        addToast('SQL Generated & Executed', `${generated.rowCount} rows returned in ${generated.executionTime}`, 'success');
      } else {
        addToast('Execution Warning', generated.errorMessage || 'Query failed', 'error');
      }
    }, 1400);

    return () => {
      clearTimeout(step1Timer);
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
    };
  };

  // Re-run an edited SQL statement
  const reRunSQL = (sqlText) => {
    if (!dbConfig.connected) {
      addToast('Error', 'Database disconnected', 'error');
      return;
    }
    const executionLatency = Math.floor(Math.random() * 80 + 40) + ' ms';
    setActiveQuery(prev => ({
      ...prev,
      sql: sqlText || prev.sql,
      executionTime: executionLatency,
      timestamp: 'Just now'
    }));
    addToast('Query Executed', `Finished in ${executionLatency}`, 'success');
  };

  // Reset / clear query workspace
  const clearQuery = () => {
    setQueryPrompt('');
    setActiveQuery(null);
  };

  // Connect database
  const connectDatabase = (newConfig) => {
    setDbConfig(prev => ({
      ...prev,
      ...newConfig,
      connected: true,
      connectedAt: 'Just now'
    }));
    setIsConnectionModalOpen(false);
    addToast('Connected Successfully', `${newConfig.name || 'college_db'} is ready to query.`, 'success');
  };

  // Disconnect database
  const disconnectDatabase = () => {
    setDbConfig(prev => ({
      ...prev,
      connected: false
    }));
    setIsConnectionModalOpen(false);
    addToast('Database Disconnected', 'Connection closed.', 'info');
  };

  return (
    <DatabaseContext.Provider
      value={{
        currentView,
        setCurrentView,
        navigate,
        dbConfig,
        setDbConfig,
        tables,
        historyList,
        queryPrompt,
        setQueryPrompt,
        activeQuery,
        setActiveQuery,
        isGenerating,
        generationStep,
        generationSteps: AI_GENERATION_STEPS,
        executeAiGeneration,
        reRunSQL,
        clearQuery,
        isConnectionModalOpen,
        setIsConnectionModalOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        toasts,
        addToast,
        removeToast,
        connectDatabase,
        disconnectDatabase,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}
