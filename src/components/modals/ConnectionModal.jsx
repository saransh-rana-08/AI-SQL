import React, { useState } from 'react';
import { 
  X, 
  Database, 
  CheckCircle2, 
  Loader2, 
  Server, 
  Lock, 
  User, 
  FolderGit2, 
  AlertCircle,
  Unplug
} from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';

export default function ConnectionModal() {
  const { 
    isConnectionModalOpen, 
    setIsConnectionModalOpen, 
    dbConfig, 
    connectDatabase, 
    disconnectDatabase 
  } = useDatabase();

  const [dbType, setDbType] = useState(dbConfig.type || 'MySQL');
  const [host, setHost] = useState(dbConfig.host || 'localhost');
  const [port, setPort] = useState(dbConfig.port || '3306');
  const [dbName, setDbName] = useState(dbConfig.name || 'college_db');
  const [username, setUsername] = useState(dbConfig.user || 'root');
  const [password, setPassword] = useState('••••••••••');

  // Test connection simulation states: 'idle' | 'testing' | 'success' | 'failed'
  const [testStatus, setTestStatus] = useState('idle');
  const [testStepMessage, setTestStepMessage] = useState('');

  if (!isConnectionModalOpen) return null;

  const handleDbTypeChange = (type) => {
    setDbType(type);
    if (type === 'MySQL') setPort('3306');
    else if (type === 'PostgreSQL') setPort('5432');
    else if (type === 'SQLite') setPort('N/A (File)');
    setTestStatus('idle');
  };

  const runTestConnection = () => {
    setTestStatus('testing');
    setTestStepMessage('Connecting to host ' + host + (port !== 'N/A (File)' ? ':' + port : '') + '...');

    setTimeout(() => {
      setTestStepMessage('Checking credentials for user \'' + username + '\'...');
    }, 600);

    setTimeout(() => {
      setTestStepMessage('Fetching schema catalog & table definitions...');
    }, 1200);

    setTimeout(() => {
      setTestStatus('success');
      setTestStepMessage('Connection established successfully');
    }, 1800);
  };

  const handleSaveConnection = (e) => {
    e.preventDefault();
    connectDatabase({
      name: dbName,
      type: dbType,
      host,
      port,
      user: username,
      version: dbType === 'MySQL' ? '8.0.36' : dbType === 'PostgreSQL' ? '16.2' : '3.45',
      totalTables: 12,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-dark-900 border border-dark-700 rounded-2xl shadow-elevated overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700/80 bg-dark-850/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Database className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-dark-100">Connect a Database</h2>
              <p className="text-xs text-dark-400">Configure connection credentials for QueryAI</p>
            </div>
          </div>
          <button
            onClick={() => setIsConnectionModalOpen(false)}
            className="p-1.5 text-dark-400 hover:text-dark-200 rounded-lg hover:bg-dark-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveConnection} className="p-6 space-y-5">
          {/* Database Type Selectors */}
          <div>
            <label className="block text-xs font-medium text-dark-300 mb-2">
              Database Type
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {['MySQL', 'PostgreSQL', 'SQLite'].map(type => (
                <button
                  type="button"
                  key={type}
                  onClick={() => handleDbTypeChange(type)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border text-center transition-all ${
                    dbType === type
                      ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-sm'
                      : 'bg-dark-850 border-dark-700 text-dark-400 hover:text-dark-200 hover:bg-dark-800'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Host & Port */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-dark-300 mb-1.5">
                Host
              </label>
              <div className="relative flex items-center">
                <Server className="w-3.5 h-3.5 text-dark-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={host}
                  onChange={(e) => { setHost(e.target.value); setTestStatus('idle'); }}
                  className="w-full pl-9 pr-3 py-2 bg-dark-850 border border-dark-700 rounded-lg text-xs text-dark-100 placeholder-dark-400 outline-none focus:border-indigo-500 transition-colors font-mono"
                  placeholder="localhost"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1.5">
                Port
              </label>
              <input
                type="text"
                value={port}
                onChange={(e) => { setPort(e.target.value); setTestStatus('idle'); }}
                className="w-full px-3 py-2 bg-dark-850 border border-dark-700 rounded-lg text-xs text-dark-100 placeholder-dark-400 outline-none focus:border-indigo-500 transition-colors font-mono"
                placeholder="3306"
              />
            </div>
          </div>

          {/* Database Name */}
          <div>
            <label className="block text-xs font-medium text-dark-300 mb-1.5">
              Database Name
            </label>
            <div className="relative flex items-center">
              <FolderGit2 className="w-3.5 h-3.5 text-dark-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={dbName}
                onChange={(e) => { setDbName(e.target.value); setTestStatus('idle'); }}
                className="w-full pl-9 pr-3 py-2 bg-dark-850 border border-dark-700 rounded-lg text-xs text-dark-100 placeholder-dark-400 outline-none focus:border-indigo-500 transition-colors font-mono"
                placeholder="college_db"
                required
              />
            </div>
          </div>

          {/* Credentials: User & Password */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1.5">
                Username
              </label>
              <div className="relative flex items-center">
                <User className="w-3.5 h-3.5 text-dark-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setTestStatus('idle'); }}
                  className="w-full pl-9 pr-3 py-2 bg-dark-850 border border-dark-700 rounded-lg text-xs text-dark-100 placeholder-dark-400 outline-none focus:border-indigo-500 transition-colors font-mono"
                  placeholder="root"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1.5">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-3.5 h-3.5 text-dark-400 absolute left-3 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setTestStatus('idle'); }}
                  className="w-full pl-9 pr-3 py-2 bg-dark-850 border border-dark-700 rounded-lg text-xs text-dark-100 placeholder-dark-400 outline-none focus:border-indigo-500 transition-colors font-mono"
                  placeholder="Password"
                />
              </div>
            </div>
          </div>

          {/* Test Status Banner / Feedback */}
          {testStatus === 'testing' && (
            <div className="p-3.5 rounded-lg bg-dark-850 border border-indigo-500/30 flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
              <div className="text-xs">
                <p className="font-medium text-dark-100">{testStepMessage}</p>
                <p className="text-[11px] text-dark-400">Verifying network handshake and catalog permissions</p>
              </div>
            </div>
          )}

          {testStatus === 'success' && (
            <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-medium text-emerald-400">Connection successful</p>
                <p className="text-dark-300 text-[11px] mt-0.5">
                  {dbType} 8.0 · <span className="font-mono text-dark-200">{dbName}</span> · 12 tables detected
                </p>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-3 border-t border-dark-700/80 flex items-center justify-between gap-3">
            {dbConfig.connected ? (
              <button
                type="button"
                onClick={disconnectDatabase}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
              >
                <Unplug className="w-3.5 h-3.5" />
                Disconnect
              </button>
            ) : (
              <span className="text-xs text-dark-400">Not connected</span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={runTestConnection}
                disabled={testStatus === 'testing'}
                className="px-3 py-2 rounded-lg bg-dark-800 hover:bg-dark-750 border border-dark-700 text-xs font-medium text-dark-200 hover:text-white transition-colors disabled:opacity-50"
              >
                {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
              </button>

              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition-all shadow-sm active:scale-[0.98]"
              >
                {dbConfig.connected ? 'Save Changes' : 'Connect Database'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
