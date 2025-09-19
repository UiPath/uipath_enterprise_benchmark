import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

// Generate 25 customer records for processing
const generateCustomerRecords = () => {
  const names = [
    'John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson',
    'Jessica Miller', 'Christopher Moore', 'Ashley Taylor', 'Matthew Anderson', 'Amanda Thomas',
    'Joshua Jackson', 'Melissa White', 'Andrew Harris', 'Stephanie Martin', 'Daniel Thompson',
    'Nicole Garcia', 'Ryan Martinez', 'Jennifer Robinson', 'Kevin Clark', 'Lisa Rodriguez',
    'Brandon Lewis', 'Michelle Lee', 'Jason Walker', 'Kimberly Hall', 'Justin Allen'
  ];
  
  const companies = [
    'Apple Inc.', 'Microsoft Corporation', 'Amazon.com Inc.', 'Alphabet Inc.', 'Tesla Inc.',
    'Meta Platforms Inc.', 'Netflix Inc.', 'NVIDIA Corporation', 'PayPal Holdings', 'Adobe Inc.',
    'Salesforce Inc.', 'Intel Corporation', 'Cisco Systems', 'Oracle Corporation', 'IBM',
    'Dell Technologies', 'HP Inc.', 'VMware Inc.', 'ServiceNow Inc.', 'Workday Inc.',
    'Zoom Video Communications', 'Slack Technologies', 'Dropbox Inc.', 'Box Inc.', 'Twilio Inc.'
  ];
  
  return names.map((name, index) => ({
    id: index + 1,
    name,
    email: `${name.toLowerCase().replace(' ', '.')}@${companies[index].toLowerCase().replace(/[^a-zA-Z]/g, '')}.com`,
    phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    company: companies[index],
    status: 'pending' as const
  }));
};

const Task1: React.FC = () => {
  const [customerRecords] = useState(() => generateCustomerRecords());
  const [processedRecords, setProcessedRecords] = useState<any[]>([]);
  const [currentRecordIndex, setCurrentRecordIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('connected');
  const [errorCount, setErrorCount] = useState(0);
  const [lastProcessedId, setLastProcessedId] = useState(0);
  const [timeoutOccurred, setTimeoutOccurred] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [processingSpeed] = useState(2000); // 2-3 seconds per record
  const [timeoutCount, setTimeoutCount] = useState(0);
  const [timeoutRecords, setTimeoutRecords] = useState<number[]>([]);
  const [failedRecords, setFailedRecords] = useState<number[]>([]);
  const [retryingRecord, setRetryingRecord] = useState<number | null>(null);

  // Expose app state for testing
  useEffect(() => {
    (window as any).app_state = {
      processedRecords,
      totalRecords: customerRecords.length,
      connectionStatus,
      lastProcessedId,
      errorCount,
      timeoutOccurred,
      currentRecordIndex,
      isProcessing,
      isPaused,
      timeoutCount,
      timeoutRecords,
      failedRecords
    };
  }, [processedRecords, customerRecords.length, connectionStatus, lastProcessedId, errorCount, timeoutOccurred, currentRecordIndex, isProcessing, isPaused, timeoutCount, timeoutRecords, failedRecords]);

  const processRecord = async (recordIndex: number) => {
    const record = customerRecords[recordIndex];
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, processingSpeed));
    
    // Simulate timeouts at records 8, 15, and 22 (indices 7, 14, 21) - 2-3 incidents
    const timeoutIndices = [7, 14, 21];
    if (timeoutIndices.includes(recordIndex) && !timeoutRecords.includes(recordIndex)) {
      setConnectionStatus('disconnected');
      setErrorCount(prev => prev + 1);
      setTimeoutCount(prev => prev + 1);
      setTimeoutRecords(prev => [...prev, recordIndex]);
      setFailedRecords(prev => [...prev, recordIndex]);
      setTimeoutOccurred(true);
      setShowTimeoutModal(true);
      setIsProcessing(false);
      return;
    }
    
    // Process the record
    const processedRecord = {
      ...record,
      status: 'success' as const,
      processedAt: new Date().toISOString(),
      processingTime: processingSpeed
    };
    
    setProcessedRecords(prev => [...prev, processedRecord]);
    setLastProcessedId(record.id);
    setCurrentRecordIndex(recordIndex + 1);
    
    // Remove from failed records if it was there
    setFailedRecords(prev => prev.filter(idx => idx !== recordIndex));
  };

  const retryRecord = async (recordIndex: number) => {
    setRetryingRecord(recordIndex);
    setConnectionStatus('connected');
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, processingSpeed));
    
    // Process the record successfully on retry
    const record = customerRecords[recordIndex];
    const processedRecord = {
      ...record,
      status: 'success' as const,
      processedAt: new Date().toISOString(),
      processingTime: processingSpeed
    };
    
    setProcessedRecords(prev => {
      const newRecords = [...prev, processedRecord];
      // Update lastProcessedId to the highest processed record ID
      const maxId = Math.max(...newRecords.map(r => r.id));
      setLastProcessedId(maxId);
      return newRecords;
    });
    
    setFailedRecords(prev => prev.filter(idx => idx !== recordIndex));
    setRetryingRecord(null);
  };

  const startProcessing = () => {
    setIsProcessing(true);
    setIsPaused(false);
    setConnectionStatus('connected');
  };

  const pauseProcessing = () => {
    setIsPaused(true);
    setIsProcessing(false);
  };

  const resumeProcessing = () => {
    setIsPaused(false);
    setIsProcessing(true);
  };

  const reconnect = () => {
    setConnectionStatus('reconnecting');
    setTimeout(() => {
      setConnectionStatus('connected');
      setShowTimeoutModal(false);
      // Resume from the next record after the timeout
      setCurrentRecordIndex(prev => prev + 1);
      setIsProcessing(true);
    }, 1000);
  };


  const resetProcessing = () => {
    setProcessedRecords([]);
    setCurrentRecordIndex(0);
    setIsProcessing(false);
    setIsPaused(false);
    setConnectionStatus('connected');
    setErrorCount(0);
    setLastProcessedId(0);
    setTimeoutOccurred(false);
    setShowTimeoutModal(false);
    setTimeoutCount(0);
    setTimeoutRecords([]);
    setFailedRecords([]);
    setRetryingRecord(null);
  };

  // Auto-process records when processing is active
  useEffect(() => {
    if (isProcessing && !isPaused && currentRecordIndex < customerRecords.length) {
      const timer = setTimeout(() => {
        processRecord(currentRecordIndex);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isProcessing, isPaused, currentRecordIndex, customerRecords.length]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <div className="h-4 w-4 border border-gray-300 rounded" />;
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-600 bg-green-100';
      case 'disconnected':
        return 'text-red-600 bg-red-100';
      case 'reconnecting':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="mb-16 flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <h1 className="text-2xl font-bold text-gray-800">Batch Processing Dashboard</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Processing Controls */}
        <div className="w-1/3 bg-white border-r p-6">
          <div className="space-y-6">
            {/* Progress Overview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Processing Progress</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Records Processed:</span>
                  <span className="font-medium">{processedRecords.length} / 25</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Current Record:</span>
                  <span className="font-medium">{currentRecordIndex + 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Errors:</span>
                  <span className="font-medium text-red-600">{errorCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Failed Records:</span>
                  <span className="font-medium text-red-600">{failedRecords.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(processedRecords.length / 25) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Connection Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Connection Status</h3>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConnectionStatusColor()}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  connectionStatus === 'connected' ? 'bg-green-500' : 
                  connectionStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
                }`} />
                {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
              </div>
            </div>

            {/* Control Buttons */}
            <div className="space-y-3">
              {!isProcessing && !isPaused && (
                <button
                  onClick={startProcessing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  <Play className="h-4 w-4" />
                  Start Processing
                </button>
              )}
              
              {isProcessing && !isPaused && (
                <button
                  onClick={pauseProcessing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium"
                >
                  <Pause className="h-4 w-4" />
                  Pause Processing
                </button>
              )}
              
              {isPaused && (
                <button
                  onClick={resumeProcessing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  <Play className="h-4 w-4" />
                  Resume Processing
                </button>
              )}
              
            </div>

            {/* Reconnect Button (only shown when disconnected) */}
            {connectionStatus === 'disconnected' && (
              <button
                onClick={reconnect}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                <RotateCcw className="h-4 w-4" />
                Reconnect & Resume
              </button>
            )}
          </div>
        </div>

        {/* Right Panel - Progress Table */}
        <div className="flex-1 p-6">
          <h3 className="text-lg font-semibold mb-4">Processing Results</h3>
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Record #</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Company</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Processed At</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customerRecords.map((record, index) => {
                    const processedRecord = processedRecords.find(p => p.id === record.id);
                    const isCurrent = index === currentRecordIndex;
                    const isProcessed = processedRecord !== undefined;
                    const isFailed = failedRecords.includes(index);
                    const isRetrying = retryingRecord === index;
                    
                    return (
                      <tr 
                        key={record.id} 
                        className={`${
                          isCurrent ? 'bg-blue-50 border-l-4 border-blue-500' : 
                          isProcessed ? 'bg-green-50' : 
                          isFailed ? 'bg-red-50 border-l-4 border-red-500' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-4 py-3 font-medium">
                          {record.id}
                          {isCurrent && <span className="ml-2 text-blue-600 text-xs">(Current)</span>}
                        </td>
                        <td className="px-4 py-3">{record.name}</td>
                        <td className="px-4 py-3">{record.company}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(processedRecord?.status || (isFailed ? 'error' : 'pending'))}
                            <span className="text-sm">
                              {isRetrying ? 'Retrying...' :
                               isCurrent && isProcessing ? 'Processing...' : 
                               isFailed ? 'Failed' :
                               processedRecord?.status || 'Pending'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {processedRecord?.processedAt ? 
                            new Date(processedRecord.processedAt).toLocaleTimeString() : 
                            '-'
                          }
                        </td>
                        <td className="px-4 py-3">
                          {isFailed && !isRetrying && (
                            <button
                              onClick={() => retryRecord(index)}
                              className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 font-medium"
                            >
                              <RefreshCw className="h-3 w-3" />
                              Retry
                            </button>
                          )}
                          {isRetrying && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <div className="h-3 w-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                              Retrying...
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
          </div>
        </div>
      </div>

      {/* Timeout Modal */}
      {showTimeoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-800">Connection Lost</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Connection lost at Record {currentRecordIndex + 1}. Click "Reconnect & Resume" to continue from Record {currentRecordIndex + 2}.
            </p>
            <div className="flex gap-3">
              <button
                onClick={reconnect}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium"
              >
                Reconnect & Resume
              </button>
              <button
                onClick={() => setShowTimeoutModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Task1;