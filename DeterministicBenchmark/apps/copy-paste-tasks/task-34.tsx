import React, { useState, useEffect } from 'react';

interface Configuration {
  productReference: string;
  customerName: string;
  baseModel: string;
  processor: string;
  memory: string;
  storage: string;
  graphics: string;
  display: string;
  material: string;
  finish: string;
}

interface ConfigurationRecord extends Configuration {
  rulesSatisfied: number;
  price: number;
  timestamp: string;
}

// 5 Validation Rules
const validateRules = (config: Configuration): { valid: boolean[]; messages: string[] } => {
  const valid: boolean[] = [];
  const messages: string[] = [];

  // Rule 1: Processor-Memory Tiers
  let rule1Valid = true;
  if (config.processor === 'Entry' || config.processor === 'Standard') {
    rule1Valid = config.memory === '8GB' || config.memory === '16GB';
    if (!rule1Valid) messages.push('Rule 1 violated');
  } else if (config.processor === 'Performance') {
    rule1Valid = config.memory === '16GB' || config.memory === '32GB';
    if (!rule1Valid) messages.push('Rule 1 violated');
  } else if (config.processor === 'Extreme') {
    rule1Valid = config.memory === '32GB' || config.memory === '64GB';
    if (!rule1Valid) messages.push('Rule 1 violated');
  }
  valid.push(rule1Valid);

  // Rule 2: Graphics-Base Model Pairing (STRICT)
  let rule2Valid = true;
  if (config.graphics === 'Integrated') {
    rule2Valid = config.baseModel === 'Standard';
    if (!rule2Valid) messages.push('Rule 2 violated');
  } else if (config.graphics === 'Dedicated Standard') {
    rule2Valid = config.baseModel === 'Professional';
    if (!rule2Valid) messages.push('Rule 2 violated');
  } else if (config.graphics === 'Dedicated High') {
    rule2Valid = config.baseModel === 'Premium';
    if (!rule2Valid) messages.push('Rule 2 violated');
  }
  valid.push(rule2Valid);

  // Rule 3: Display-Processor Requirements
  let rule3Valid = true;
  if (config.display === 'QHD') {
    rule3Valid = config.processor !== 'Entry';
    if (!rule3Valid) messages.push('Rule 3 violated');
  } else if (config.display === '4K') {
    rule3Valid = config.processor === 'Performance' || config.processor === 'Extreme';
    if (!rule3Valid) messages.push('Rule 3 violated');
  }
  valid.push(rule3Valid);

  // Rule 4: Material-Finish Compatibility
  let rule4Valid = true;
  if (config.material === 'Aluminum') {
    rule4Valid = config.finish === 'Matte' || config.finish === 'Satin' || config.finish === 'Brushed';
    if (!rule4Valid) messages.push('Rule 4 violated');
  } else if (config.material === 'Carbon Fiber') {
    rule4Valid = config.finish === 'Matte' || config.finish === 'Satin';
    if (!rule4Valid) messages.push('Rule 4 violated');
  }
  valid.push(rule4Valid);

  // Rule 5: Storage-Memory Minimum
  let rule5Valid = true;
  if (config.storage === '2TB') {
    rule5Valid = config.memory === '16GB' || config.memory === '32GB' || config.memory === '64GB';
    if (!rule5Valid) messages.push('Rule 5 violated');
  }
  valid.push(rule5Valid);

  return { valid, messages };
};

// Calculate price based on selections
const calculatePrice = (config: Configuration): number => {
  let price = 0;
  
  // Base Model pricing
  if (config.baseModel === 'Standard') price += 1000;
  else if (config.baseModel === 'Professional') price += 1500;
  else if (config.baseModel === 'Premium') price += 2000;
  
  // Processor pricing
  if (config.processor === 'Entry') price += 200;
  else if (config.processor === 'Standard') price += 400;
  else if (config.processor === 'Performance') price += 800;
  else if (config.processor === 'Extreme') price += 1200;
  
  // Memory pricing
  if (config.memory === '8GB') price += 100;
  else if (config.memory === '16GB') price += 200;
  else if (config.memory === '32GB') price += 400;
  else if (config.memory === '64GB') price += 800;
  
  // Storage pricing
  if (config.storage === '256GB') price += 100;
  else if (config.storage === '512GB') price += 200;
  else if (config.storage === '1TB') price += 400;
  else if (config.storage === '2TB') price += 800;
  
  // Graphics pricing
  if (config.graphics === 'Integrated') price += 0;
  else if (config.graphics === 'Dedicated Standard') price += 300;
  else if (config.graphics === 'Dedicated High') price += 600;
  
  // Display pricing
  if (config.display === 'FHD') price += 100;
  else if (config.display === 'QHD') price += 200;
  else if (config.display === '4K') price += 400;
  
  // Material pricing
  if (config.material === 'Composite') price += 50;
  else if (config.material === 'Aluminum') price += 150;
  else if (config.material === 'Carbon Fiber') price += 300;
  
  // Finish pricing
  if (config.finish === 'Matte') price += 0;
  else if (config.finish === 'Satin') price += 50;
  else if (config.finish === 'Glossy') price += 100;
  else if (config.finish === 'Brushed') price += 75;
  
  return price;
};

export default function Task34() {
  const [currentConfiguration, setCurrentConfiguration] = useState<Configuration>({
    productReference: '',
    customerName: '',
    baseModel: '',
    processor: '',
    memory: '',
    storage: '',
    graphics: '',
    display: '',
    material: '',
    finish: '',
  });

  const [submittedConfigurations, setSubmittedConfigurations] = useState<ConfigurationRecord[]>([]);

  // Validate current configuration
  const { valid: ruleValidation, messages: conflictMessages } = validateRules(currentConfiguration);
  const conflictCount = ruleValidation.filter(v => !v).length;
  const totalRules = 5;
  const allRulesSatisfied = conflictCount === 0;

  // Check if all fields are filled
  const allFieldsFilled = currentConfiguration.productReference.trim() !== '' &&
    currentConfiguration.customerName.trim() !== '' &&
    currentConfiguration.baseModel !== '' &&
    currentConfiguration.processor !== '' &&
    currentConfiguration.memory !== '' &&
    currentConfiguration.storage !== '' &&
    currentConfiguration.graphics !== '' &&
    currentConfiguration.display !== '' &&
    currentConfiguration.material !== '' &&
    currentConfiguration.finish !== '';

  const canSubmit = allFieldsFilled && allRulesSatisfied;

  const estimatedPrice = calculatePrice(currentConfiguration);

  const handleSubmit = () => {
    if (canSubmit) {
      const newConfig: ConfigurationRecord = {
        ...currentConfiguration,
        rulesSatisfied: 5,
        price: estimatedPrice,
        timestamp: new Date().toISOString(),
      };
      setSubmittedConfigurations([...submittedConfigurations, newConfig]);
      
      // Reset form
      setCurrentConfiguration({
        productReference: '',
        customerName: '',
        baseModel: '',
        processor: '',
        memory: '',
        storage: '',
        graphics: '',
        display: '',
        material: '',
        finish: '',
      });
    }
  };

  const handleReset = () => {
    setCurrentConfiguration({
      productReference: '',
      customerName: '',
      baseModel: '',
      processor: '',
      memory: '',
      storage: '',
      graphics: '',
      display: '',
      material: '',
      finish: '',
    });
  };

  // Expose state for testing
  useEffect(() => {
    (window as any).app_state = {
      currentConfiguration,
      ruleValidation,
      conflictCount,
      submittedConfigurations,
    };
  }, [currentConfiguration, ruleValidation, conflictCount, submittedConfigurations]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Product Configuration Validator</h1>

      {/* Configuration Form */}
      <div className="bg-white border-2 border-gray-300 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Configuration Form</h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Product Reference</label>
            <input
              type="text"
              placeholder="CONF-2024-XXX"
              className="w-full px-3 py-2 border border-gray-300 rounded font-mono"
              value={currentConfiguration.productReference}
              onChange={(e) => setCurrentConfiguration({ ...currentConfiguration, productReference: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Customer Name</label>
            <input
              type="text"
              placeholder="Customer name"
              className="w-full px-3 py-2 border border-gray-300 rounded"
              value={currentConfiguration.customerName}
              onChange={(e) => setCurrentConfiguration({ ...currentConfiguration, customerName: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Base Model */}
          <div>
            <label className="block text-sm font-medium mb-1">Base Model</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded"
              value={currentConfiguration.baseModel}
              onChange={(e) => setCurrentConfiguration({ ...currentConfiguration, baseModel: e.target.value })}
            >
              <option value="">Select...</option>
              <option value="Standard">Standard</option>
              <option value="Professional">Professional</option>
              <option value="Premium">Premium</option>
            </select>
          </div>

          {/* Processor */}
          <div>
            <label className="block text-sm font-medium mb-1">Processor</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded"
              value={currentConfiguration.processor}
              onChange={(e) => setCurrentConfiguration({ ...currentConfiguration, processor: e.target.value })}
            >
              <option value="">Select...</option>
              <option value="Entry">Entry</option>
              <option value="Standard">Standard</option>
              <option value="Performance">Performance</option>
              <option value="Extreme">Extreme</option>
            </select>
          </div>

          {/* Memory */}
          <div>
            <label className="block text-sm font-medium mb-1">Memory</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded"
              value={currentConfiguration.memory}
              onChange={(e) => setCurrentConfiguration({ ...currentConfiguration, memory: e.target.value })}
            >
              <option value="">Select...</option>
              <option value="8GB">8GB</option>
              <option value="16GB">16GB</option>
              <option value="32GB">32GB</option>
              <option value="64GB">64GB</option>
            </select>
          </div>

          {/* Storage */}
          <div>
            <label className="block text-sm font-medium mb-1">Storage</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded"
              value={currentConfiguration.storage}
              onChange={(e) => setCurrentConfiguration({ ...currentConfiguration, storage: e.target.value })}
            >
              <option value="">Select...</option>
              <option value="256GB">256GB</option>
              <option value="512GB">512GB</option>
              <option value="1TB">1TB</option>
              <option value="2TB">2TB</option>
            </select>
          </div>

          {/* Graphics */}
          <div>
            <label className="block text-sm font-medium mb-1">Graphics</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded"
              value={currentConfiguration.graphics}
              onChange={(e) => setCurrentConfiguration({ ...currentConfiguration, graphics: e.target.value })}
            >
              <option value="">Select...</option>
              <option value="Integrated">Integrated</option>
              <option value="Dedicated Standard">Dedicated Standard</option>
              <option value="Dedicated High">Dedicated High</option>
            </select>
          </div>

          {/* Display */}
          <div>
            <label className="block text-sm font-medium mb-1">Display</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded"
              value={currentConfiguration.display}
              onChange={(e) => setCurrentConfiguration({ ...currentConfiguration, display: e.target.value })}
            >
              <option value="">Select...</option>
              <option value="FHD">FHD</option>
              <option value="QHD">QHD</option>
              <option value="4K">4K</option>
            </select>
          </div>

          {/* Material */}
          <div>
            <label className="block text-sm font-medium mb-1">Material</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded"
              value={currentConfiguration.material}
              onChange={(e) => setCurrentConfiguration({ ...currentConfiguration, material: e.target.value })}
            >
              <option value="">Select...</option>
              <option value="Composite">Composite</option>
              <option value="Aluminum">Aluminum</option>
              <option value="Carbon Fiber">Carbon Fiber</option>
            </select>
          </div>

          {/* Finish */}
          <div>
            <label className="block text-sm font-medium mb-1">Finish</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded"
              value={currentConfiguration.finish}
              onChange={(e) => setCurrentConfiguration({ ...currentConfiguration, finish: e.target.value })}
            >
              <option value="">Select...</option>
              <option value="Matte">Matte</option>
              <option value="Satin">Satin</option>
              <option value="Glossy">Glossy</option>
              <option value="Brushed">Brushed</option>
            </select>
          </div>
        </div>

        {/* Conflict Visualization */}
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Validation Status</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Rules Satisfied:</span>
              {allFieldsFilled ? (
                <span className={`text-lg font-bold ${conflictCount === 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalRules - conflictCount}/{totalRules}
                </span>
              ) : (
                <span className="text-lg font-bold text-gray-400">
                  -/{totalRules} <span className="text-xs font-normal">(Fill all fields)</span>
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
            <div
              className={`h-4 rounded-full transition-all ${
                !allFieldsFilled ? 'bg-gray-400' : 
                conflictCount === 0 ? 'bg-green-500' : conflictCount <= 4 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${allFieldsFilled ? ((totalRules - conflictCount) / totalRules) * 100 : 0}%` }}
            ></div>
          </div>

          {/* Conflict Messages */}
          {conflictMessages.length > 0 && (
            <div className="space-y-1">
              {conflictMessages.map((msg, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-red-600">
                  <span className="text-red-500 font-bold">⚠</span>
                  <span>{msg}</span>
                </div>
              ))}
            </div>
          )}

          {allRulesSatisfied && allFieldsFilled && (
            <div className="text-green-600 font-medium">✓ Configuration Valid - All rules satisfied!</div>
          )}
        </div>

        {/* Configuration Summary */}
        {allFieldsFilled && (
          <div className="mt-4 p-4 bg-blue-50 rounded">
            <h3 className="font-semibold mb-2">Configuration Summary</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="font-medium">Base Model:</span> {currentConfiguration.baseModel}</div>
              <div><span className="font-medium">Processor:</span> {currentConfiguration.processor}</div>
              <div><span className="font-medium">Memory:</span> {currentConfiguration.memory}</div>
              <div><span className="font-medium">Storage:</span> {currentConfiguration.storage}</div>
              <div><span className="font-medium">Graphics:</span> {currentConfiguration.graphics}</div>
              <div><span className="font-medium">Display:</span> {currentConfiguration.display}</div>
              <div><span className="font-medium">Material:</span> {currentConfiguration.material}</div>
              <div><span className="font-medium">Finish:</span> {currentConfiguration.finish}</div>
            </div>
            <div className="mt-2 pt-2 border-t border-blue-200">
              <span className="font-semibold text-lg">Estimated Price: ${estimatedPrice.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`px-6 py-2 rounded font-medium ${
              canSubmit
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            ✓ Submit Configuration
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-gray-600 text-white rounded font-medium hover:bg-gray-700"
          >
            Reset Form
          </button>
        </div>
      </div>

      {/* Submitted Configurations */}
      {submittedConfigurations.length > 0 && (
        <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Submitted Configurations ({submittedConfigurations.length})</h2>
          <div className="space-y-4">
            {submittedConfigurations.map((config, idx) => (
              <div key={idx} className="border border-gray-300 rounded p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-mono font-bold">{config.productReference}</div>
                    <div className="text-sm text-gray-600">{config.customerName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-600 font-semibold">✓ {config.rulesSatisfied}/5 Rules</div>
                    <div className="text-lg font-bold">${config.price.toLocaleString()}</div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-sm mt-3">
                  <div><span className="font-medium">Base:</span> {config.baseModel}</div>
                  <div><span className="font-medium">CPU:</span> {config.processor}</div>
                  <div><span className="font-medium">RAM:</span> {config.memory}</div>
                  <div><span className="font-medium">Storage:</span> {config.storage}</div>
                  <div><span className="font-medium">GPU:</span> {config.graphics}</div>
                  <div><span className="font-medium">Display:</span> {config.display}</div>
                  <div><span className="font-medium">Material:</span> {config.material}</div>
                  <div><span className="font-medium">Finish:</span> {config.finish}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

