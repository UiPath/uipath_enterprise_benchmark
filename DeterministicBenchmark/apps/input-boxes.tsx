import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Check, Plus, Minus, Star, Eye, EyeOff, ArrowRight, Copy } from 'lucide-react';
import TaskWrapper from '../src/TaskWrapper';


// 1. Multi-Step Registration Wizard
const MultiStepRegistrationWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    company: '',
    role: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (formData.email !== 'john@company.com') newErrors.email = 'Must be: john@company.com';
      if (formData.password !== 'secure123') newErrors.password = 'Must be: secure123';
    } else if (step === 2) {
      if (formData.firstName !== 'John') newErrors.firstName = 'Must be: John';
      if (formData.lastName !== 'Smith') newErrors.lastName = 'Must be: Smith';
    } else if (step === 3) {
      if (formData.company !== 'Tech Corp') newErrors.company = 'Must be: Tech Corp';
      if (formData.role !== 'Developer') newErrors.role = 'Must be: Developer';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Expose state to window.app_state
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      currentStep,
      formData,
      errors
    };
  }, [currentStep, formData, errors]);

  return (
    <div>
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className={`flex items-center ${step < 4 ? 'flex-1' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step <= currentStep ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step < currentStep ? <Check className="h-4 w-4" /> : step}
              </div>
              {step < 4 && (
                <div className={`flex-1 h-1 mx-2 ${
                  step < currentStep ? 'bg-blue-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-sm text-gray-600">
          Step {currentStep} of 4: {
            currentStep === 1 ? 'Account' : 
            currentStep === 2 ? 'Personal' :
            currentStep === 3 ? 'Work' : 'Complete'
          }
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[200px]">
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={`w-full px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className={`w-full px-3 py-2 border rounded-md ${errors.password ? 'border-red-500' : ''}`}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className={`w-full px-3 py-2 border rounded-md ${errors.firstName ? 'border-red-500' : ''}`}
              />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <input
                type="text"
                placeholder="Last name"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className={`w-full px-3 py-2 border rounded-md ${errors.lastName ? 'border-red-500' : ''}`}
              />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Company name"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                className={`w-full px-3 py-2 border rounded-md ${errors.company ? 'border-red-500' : ''}`}
              />
              {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company}</p>}
            </div>
            <div>
              <input
                type="text"
                placeholder="Job role"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className={`w-full px-3 py-2 border rounded-md ${errors.role ? 'border-red-500' : ''}`}
              />
              {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="text-center py-8">
            <div className="text-green-600 text-4xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold mb-2">Account Created!</h3>
            <p className="text-gray-600">Welcome to our platform, {formData.firstName}!</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="px-4 py-2 border rounded-md disabled:opacity-50"
        >
          Previous
        </button>
        {currentStep < 4 && (
          <button
            onClick={nextStep}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

// 2. Smart Calculator with Memory Functions
const SmartCalculatorMemoryFunctions = () => {
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState(0);
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case '+': return firstValue + secondValue;
      case '-': return firstValue - secondValue;
      case '×': return firstValue * secondValue;
      case ':': return firstValue / secondValue;
      case '=': return secondValue;
      default: return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const memoryStore = () => setMemory(parseFloat(display));
  const memoryRecall = () => setDisplay(String(memory));
  const memoryClear = () => setMemory(0);
  const memoryAdd = () => setMemory(memory + parseFloat(display));

  // Expose state to window.app_state
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      display,
      memory,
      previousValue,
      operation,
      waitingForOperand
    };
  }, [display, memory, previousValue, operation, waitingForOperand]);

  const Button = ({ onClick, className = '', children }: { 
    onClick: () => void; 
    className?: string; 
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className={`px-4 py-3 text-lg font-semibold border rounded-md hover:bg-gray-50 active:bg-gray-100 ${className}`}
    >
      {children}
    </button>
  );

  return (
    <div>
      <div className="max-w-xs mx-auto bg-gray-100 p-4 rounded-lg">
        {/* Display */}
        <div className="mb-4 p-3 bg-black text-white text-right text-2xl font-mono rounded">
          {display}
        </div>
        
        {/* Memory indicator */}
        <div className="mb-2 text-xs text-gray-600 text-center">
          Memory: {memory !== 0 ? memory : 'Empty'}
        </div>

        {/* Memory buttons */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          <Button onClick={memoryClear} className="bg-red-100 text-red-700">MC</Button>
          <Button onClick={memoryRecall} className="bg-blue-100 text-blue-700">MR</Button>
          <Button onClick={memoryStore} className="bg-green-100 text-green-700">MS</Button>
          <Button onClick={memoryAdd} className="bg-purple-100 text-purple-700">M+</Button>
        </div>

        {/* Main buttons */}
        <div className="grid grid-cols-4 gap-2">
          <Button onClick={clear} className="bg-gray-200">C</Button>
          <Button onClick={() => inputOperation(':')} className="bg-orange-100">:</Button>
          <Button onClick={() => inputOperation('×')} className="bg-orange-100">×</Button>
          <Button onClick={() => inputOperation('-')} className="bg-orange-100">-</Button>
          
          <Button onClick={() => inputNumber('7')}>7</Button>
          <Button onClick={() => inputNumber('8')}>8</Button>
          <Button onClick={() => inputNumber('9')}>9</Button>
          <Button onClick={() => inputOperation('+')} className="bg-orange-100 row-span-2">+</Button>
          
          <Button onClick={() => inputNumber('4')}>4</Button>
          <Button onClick={() => inputNumber('5')}>5</Button>
          <Button onClick={() => inputNumber('6')}>6</Button>
          
          <Button onClick={() => inputNumber('1')}>1</Button>
          <Button onClick={() => inputNumber('2')}>2</Button>
          <Button onClick={() => inputNumber('3')}>3</Button>
          <Button onClick={performCalculation} className="bg-blue-500 text-white row-span-2">=</Button>
          
          <Button onClick={() => inputNumber('0')} className="col-span-2">0</Button>
          <Button onClick={() => inputNumber('.')}>.</Button>
        </div>
      </div>
    </div>
  );
};

// 3. Image Gallery Builder with Drag Sorting
const ImageGalleryDragSorting = () => {
  const [images, setImages] = useState([
    { id: 1, name: 'sunset.jpg', url: '🌅' },
    { id: 2, name: 'mountain.jpg', url: '🏔️' },
    { id: 3, name: 'ocean.jpg', url: '🌊' },
    { id: 4, name: 'forest.jpg', url: '🌲' },
    { id: 5, name: 'city.jpg', url: '🏙️' }
  ]);
  
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  // Expose state to window.app_state
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      images,
      draggedIndex
    };
  }, [images, draggedIndex]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);
    
    setImages(newImages);
    setDraggedIndex(null);
  };

  return (
    <div>
      <div className="grid grid-cols-5 gap-3">
        {images.map((image, index) => (
          <div
            key={image.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            className={`border-2 border-dashed border-gray-300 rounded-lg p-3 text-center cursor-move hover:border-blue-400 transition-colors ${
              draggedIndex === index ? 'opacity-50' : ''
            }`}
          >
            <div className="text-2xl mb-2">{image.url}</div>
            <div className="text-xs text-gray-600">{image.name}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-sm text-gray-500">
        Current order: {images.map(img => img.name).join(' → ')}
      </div>
    </div>
  );
};

// 4. Credit Card Form with Real-Time Validation
const CreditCardFormValidation = () => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const validateCardNumber = (number: string) => {
    const digits = number.replace(/\s/g, '');
    if (digits.length !== 16) return false;
    
    // Simple Luhn algorithm
    let sum = 0;
    let isEven = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i]);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  };

  const validateExpiry = (expiry: string) => {
    const [month, year] = expiry.split('/');
    if (!month || !year) return false;
    const m = parseInt(month);
    const y = parseInt('20' + year);
    const now = new Date();
    const expDate = new Date(y, m - 1);
    return m >= 1 && m <= 12 && expDate > now;
  };

  const isValidCard = validateCardNumber(cardNumber);
  const isValidExpiry = validateExpiry(expiryDate);
  const isValidCvv = cvv.length === 3;
  const isValidHolder = cardHolder.trim().length > 0;

  // Expose state to window.app_state
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      cardNumber,
      expiryDate,
      cvv,
      cardHolder,
      isValidCard,
      isValidExpiry,
      isValidCvv,
      isValidHolder
    };
  }, [cardNumber, expiryDate, cvv, cardHolder, isValidCard, isValidExpiry, isValidCvv, isValidHolder]);

  return (
    <div>
      <div className="space-y-4 max-w-md">
        <div>
          <input
            type="text"
            placeholder="Card number"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            maxLength={19}
            className={`w-full px-3 py-2 border rounded-md font-mono ${
              cardNumber && (isValidCard ? 'border-green-500' : 'border-red-500')
            }`}
          />
          {cardNumber && (
            <div className={`text-sm mt-1 ${isValidCard ? 'text-green-600' : 'text-red-600'}`}>
              {isValidCard ? '✓ Valid card number' : '✗ Invalid card number'}
            </div>
          )}
        </div>
        
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="MM/YY"
              value={expiryDate}
              onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
              maxLength={5}
              className={`w-full px-3 py-2 border rounded-md ${
                expiryDate && (isValidExpiry ? 'border-green-500' : 'border-red-500')
              }`}
            />
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="CVV"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
              maxLength={3}
              className={`w-full px-3 py-2 border rounded-md ${
                cvv && (isValidCvv ? 'border-green-500' : 'border-red-500')
              }`}
            />
          </div>
        </div>
        
        <div>
          <input
            type="text"
            placeholder="Cardholder name"
            value={cardHolder}
            onChange={(e) => setCardHolder(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              cardHolder && (isValidHolder ? 'border-green-500' : 'border-red-500')
            }`}
          />
        </div>
      </div>
    </div>
  );
};

// 5. Password Strength Meter
const PasswordStrengthMeter = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    const checks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
      symbol: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    };
    
    Object.values(checks).forEach(check => {
      if (check) score++;
    });
    
    return { score, checks };
  };

  const { score, checks } = getPasswordStrength(password);
  const strength = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][score];
  const strengthColor = ['red', 'orange', 'yellow', 'blue', 'green'][score];
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  
  // Expose state to window.app_state
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      password,
      confirmPassword,
      score,
      checks,
      strength,
      passwordsMatch
    };
  }, [password, confirmPassword, score, checks, strength, passwordsMatch]);

  return (
    <div>
      <div className="space-y-4 max-w-md">
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {password && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full bg-${strengthColor}-500 transition-all`}
                  style={{ width: `${(score / 5) * 100}%` }}
                />
              </div>
              <span className={`text-sm font-semibold text-${strengthColor}-600`}>
                {strength}
              </span>
            </div>
            
            <div className="space-y-1 text-sm">
              {Object.entries(checks).map(([key, passed]) => (
                <div key={key} className={`flex items-center gap-2 ${passed ? 'text-green-600' : 'text-gray-500'}`}>
                  <span>{passed ? '✓' : '○'}</span>
                  <span>
                    {key === 'length' && '8+ characters'}
                    {key === 'uppercase' && 'Uppercase letter'}
                    {key === 'lowercase' && 'Lowercase letter'}
                    {key === 'number' && 'Number'}
                    {key === 'symbol' && 'Special character'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              confirmPassword && (passwordsMatch ? 'border-green-500' : 'border-red-500')
            }`}
          />
          {confirmPassword && (
            <div className={`text-sm mt-1 ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
              {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 6. Address Builder with Component Fields
const AddressBuilderComponentFields = () => {
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };
    
    if (field === 'zipCode') {
      if (!/^\d{5}(-\d{4})?$/.test(value) && value) {
        newErrors.zipCode = 'Invalid ZIP code format';
      } else {
        delete newErrors.zipCode;
      }
    }
    
    if (field === 'state' && value && value.length !== 2) {
      newErrors.state = 'Use 2-letter state code';
    } else if (field === 'state') {
      delete newErrors.state;
    }
    
    setErrors(newErrors);
  };

  const updateAddress = (field: string, value: string) => {
    setAddress({ ...address, [field]: value });
    validateField(field, value);
  };

  // Expose state to window.app_state
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      address,
      errors
    };
  }, [address, errors]);

  return (
    <div>
      <div className="space-y-3 max-w-md">
        <input
          type="text"
          placeholder="Street address"
          value={address.street}
          onChange={(e) => updateAddress('street', e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        />
        
        <input
          type="text"
          placeholder="City"
          value={address.city}
          onChange={(e) => updateAddress('city', e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        />
        
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="State"
            value={address.state}
            onChange={(e) => updateAddress('state', e.target.value.toUpperCase())}
            maxLength={2}
            className={`flex-1 px-3 py-2 border rounded-md ${errors.state ? 'border-red-500' : ''}`}
          />
          <input
            type="text"
            placeholder="ZIP code"
            value={address.zipCode}
            onChange={(e) => updateAddress('zipCode', e.target.value)}
            className={`flex-1 px-3 py-2 border rounded-md ${errors.zipCode ? 'border-red-500' : ''}`}
          />
        </div>
        
        {Object.entries(errors).map(([field, error]) => (
          <p key={field} className="text-red-500 text-sm">{error}</p>
        ))}
      </div>
    </div>
  );
};

// 7. Color Picker Multi-Format
const ColorPickerMultiFormat = () => {
  const [color, setColor] = useState('#3B82F6');
  
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const hexToHsl = (hex: string) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;
    
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const [copied, setCopied] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const rgb = hexToRgb(color);
  const hsl = hexToHsl(color);

  // Reset copied state when color changes
  useEffect(() => {
    setCopied(false);
  }, [color]);

  // Expose state to window.app_state
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      color,
      copied,
      copySuccess,
      rgb,
      hsl
    };
    // Debug logging for task 7
    if (color?.toUpperCase() === '#FF6B35') {
      console.log('Color Picker Task 7 Debug:', {
        color,
        copied,
        copySuccess,
        rgb: rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : null
      });
    }
  }, [color, copied, copySuccess, rgb, hsl]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setCopySuccess(text);
      // Clear success message after 2 seconds
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      // Fallback for older browsers or when clipboard API fails
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setCopySuccess(text);
      setTimeout(() => setCopySuccess(null), 2000);
    }
  };

  return (
    <div>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-16 h-16 border-2 border-gray-300 rounded-lg cursor-pointer"
          />
          <div className="flex-1">
            <div className="text-lg font-semibold" style={{ color }}>
              Selected Color
            </div>
            <div className="text-sm text-gray-600">
              Click the color square to change
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <div>
              <div className="font-mono text-sm">{color}</div>
              <div className="text-xs text-gray-500">HEX</div>
            </div>
            <button
              onClick={() => copyToClipboard(color)}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
            >
              <Copy className="h-3 w-3 inline mr-1" />
              Copy
            </button>
          </div>

          {rgb && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <div className="font-mono text-sm">rgb({rgb.r}, {rgb.g}, {rgb.b})</div>
                <div className="text-xs text-gray-500">RGB</div>
              </div>
              <button
                onClick={() => copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
              >
                <Copy className="h-3 w-3 inline mr-1" />
                Copy
              </button>
            </div>
          )}

          {hsl && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <div className="font-mono text-sm">hsl({hsl.h}, {hsl.s}%, {hsl.l}%)</div>
                <div className="text-xs text-gray-500">HSL</div>
              </div>
              <button
                onClick={() => copyToClipboard(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
              >
                <Copy className="h-3 w-3 inline mr-1" />
                Copy
              </button>
            </div>
          )}
        </div>
        
        {copySuccess && (
          <div className="mt-4 p-2 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
            ✓ Copied "{copySuccess}" to clipboard
          </div>
        )}
      </div>
    </div>
  );
};

// 8. Dual-Handle Range Slider
const DualHandleRangeSlider = () => {
  const [minValue, setMinValue] = useState(1);
  const [maxValue, setMaxValue] = useState(30);
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; value: number } | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const min = 1;
  const max = 30;

  // Expose state to window.app_state
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      minValue,
      maxValue,
      isDragging,
      dragStart
    };
  }, [minValue, maxValue, isDragging, dragStart]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.round(Math.min(Number(e.target.value), maxValue));
    setMinValue(value);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.round(Math.max(Number(e.target.value), minValue));
    setMaxValue(value);
  };

  const getValueFromPosition = (clientX: number) => {
    if (!sliderRef.current) return 0;
    const rect = sliderRef.current.getBoundingClientRect();
    const position = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(min + position * (max - min));
  };

  const handleMouseDown = (e: React.MouseEvent, handle: 'min' | 'max') => {
    e.preventDefault();
    setIsDragging(handle);
    setDragStart({
      x: e.clientX,
      value: handle === 'min' ? minValue : maxValue
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !dragStart) return;
    
    const newValue = getValueFromPosition(e.clientX);
    
    if (isDragging === 'min') {
      setMinValue(Math.max(min, Math.min(newValue, maxValue)));
    } else {
      setMaxValue(Math.min(max, Math.max(newValue, minValue)));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
    setDragStart(null);
  };

  const handleSliderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return; // Don't handle clicks while dragging
    
    const clickValue = getValueFromPosition(e.clientX);
    
    // Determine which handle is closer to the click
    const distanceToMin = Math.abs(clickValue - minValue);
    const distanceToMax = Math.abs(clickValue - maxValue);
    
    if (distanceToMin < distanceToMax) {
      setMinValue(Math.max(min, Math.min(clickValue, maxValue)));
    } else {
      setMaxValue(Math.min(max, Math.max(clickValue, minValue)));
    }
  };

  // Handle mouse events globally
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, minValue, maxValue]);

  return (
    <div>
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {minValue} - {maxValue}
          </div>
          <div className="text-sm text-gray-500">Selected range</div>
        </div>

        <div className="relative px-4">
          <div 
            ref={sliderRef}
            className="relative h-2 bg-gray-200 rounded-full cursor-pointer select-none"
            onClick={handleSliderClick}
          >
            {/* Active range bar */}
            <div 
              className="absolute h-2 bg-blue-500 rounded-full"
              style={{
                left: `${(minValue / max) * 100}%`,
                width: `${((maxValue - minValue) / max) * 100}%`
              }}
            />
            
            {/* Min handle */}
            <div 
              className={`absolute w-4 h-4 rounded-full border-2 border-white shadow-md cursor-grab transition-colors ${
                isDragging === 'min' ? 'bg-blue-700 cursor-grabbing' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            style={{ 
              left: `calc(${(minValue / max) * 100}% - 8px)`,
                top: '-6px',
                zIndex: isDragging === 'min' ? 10 : 5
            }}
              onMouseDown={(e) => handleMouseDown(e, 'min')}
          />
          
            {/* Max handle */}
          <div 
              className={`absolute w-4 h-4 rounded-full border-2 border-white shadow-md cursor-grab transition-colors ${
                isDragging === 'max' ? 'bg-blue-700 cursor-grabbing' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            style={{ 
              left: `calc(${(maxValue / max) * 100}% - 8px)`,
                top: '-6px',
                zIndex: isDragging === 'max' ? 10 : 5
            }}
              onMouseDown={(e) => handleMouseDown(e, 'max')}
          />
          </div>
        </div>

        <div className="flex justify-between text-sm text-gray-500">
          <span>{min}</span>
          <span>{max}</span>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm">Min:</label>
            <input
              type="number"
              min={min}
              max={maxValue}
              value={minValue}
              onChange={handleMinChange}
              className="w-20 px-2 py-1 border rounded text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">Max:</label>
            <input
              type="number"
              min={minValue}
              max={max}
              value={maxValue}
              onChange={handleMaxChange}
              className="w-20 px-2 py-1 border rounded text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// 9. Tag Input with Validation Rules
const TagInputValidationRules = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const forbiddenWords = ['spam', 'test', 'dummy'];
  const maxTags = 5;
  const maxLength = 20;

  const validateTag = (tag: string): string | null => {
    if (tag.length > maxLength) return `Tag too long (max ${maxLength} chars)`;
    if (forbiddenWords.includes(tag.toLowerCase())) return 'Forbidden word';
    if (tags.includes(tag)) return 'Duplicate tag';
    if (tags.length >= maxTags) return `Maximum ${maxTags} tags allowed`;
    return null;
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (!trimmedTag) return;

    const validationError = validateTag(trimmedTag);
    if (validationError) {
      setError(validationError);
      return;
    }

    setTags([...tags, trimmedTag]);
    setInput('');
    setError('');
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
    setError('');
  };

  // Expose state to window.app_state
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      tags,
      input,
      error
    };
  }, [tags, input, error]);

  return (
    <div>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-[50px] bg-white">
          {tags.map((tag, index) => (
            <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {tag}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-blue-900"
                onClick={() => removeTag(index)}
              />
            </span>
          ))}
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                addTag(input);
              }
            }}
            className="flex-1 min-w-[150px] outline-none text-sm"
            placeholder={tags.length === 0 ? "Add tags..." : ""}
            disabled={tags.length >= maxTags}
          />
        </div>
        
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        
        <div className="text-sm text-gray-500">
          <div>Tags: {tags.length}/{maxTags}</div>
          <div>Forbidden words: {forbiddenWords.join(', ')}</div>
          <div>Max length per tag: {maxLength} characters</div>
        </div>
      </div>
    </div>
  );
};

// 10. International Phone Number Input
const InternationalPhoneNumberInput = () => {
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const countries = [
    { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', format: '(XXX) XXX-XXXX' },
    { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', format: 'XXXX XXX XXXX' },
    { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', format: 'XXX XXXXXXX' },
    { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', format: 'XX XX XX XX XX' },
    { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵', format: 'XX-XXXX-XXXX' }
  ];

  const currentCountry = countries.find(c => c.code === selectedCountry) || countries[0];

  const formatPhoneNumber = (value: string, countryCode: string) => {
    const digits = value.replace(/\D/g, '');
    
    if (countryCode === 'US') {
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
    
    // Simple formatting for other countries
    return digits.replace(/(.{2})/g, '$1 ').trim();
  };

  const validatePhoneNumber = (number: string, countryCode: string) => {
    const digits = number.replace(/\D/g, '');
    const expectedLengths = {
      'US': 10,
      'GB': 10,
      'DE': 11,
      'FR': 10,
      'JP': 11
    };
    return digits.length === expectedLengths[countryCode as keyof typeof expectedLengths];
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value, selectedCountry);
    setPhoneNumber(formatted);
  };

  const isValid = validatePhoneNumber(phoneNumber, selectedCountry);

  // Expose state to window.app_state
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      selectedCountry,
      phoneNumber,
      showCountryDropdown,
      isValid
    };
  }, [selectedCountry, phoneNumber, showCountryDropdown, isValid]);

  return (
    <div>
      <div className="space-y-3 max-w-md">
        <div className="relative">
          <button
            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
            className="flex items-center gap-2 px-3 py-2 border rounded-md bg-white hover:bg-gray-50 w-full"
          >
            <span className="text-lg">{currentCountry.flag}</span>
            <span className="text-sm">{currentCountry.dialCode}</span>
            <span className="flex-1 text-left text-sm">{currentCountry.name}</span>
            <ChevronDown className="h-4 w-4" />
          </button>
          
          {showCountryDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
              {countries.map((country) => (
                <div
                  key={country.code}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelectedCountry(country.code);
                    setPhoneNumber('');
                    setShowCountryDropdown(false);
                  }}
                >
                  <span className="text-lg">{country.flag}</span>
                  <span className="text-sm w-12">{country.dialCode}</span>
                  <span className="flex-1 text-sm">{country.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <div className="flex items-center px-3 py-2 border rounded-md bg-gray-50 text-gray-600 text-sm">
            {currentCountry.flag} {currentCountry.dialCode}
          </div>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder={currentCountry.format}
            className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              phoneNumber && (isValid ? 'border-green-500' : 'border-red-500')
            }`}
          />
        </div>

        {phoneNumber && (
          <div className={`text-sm ${isValid ? 'text-green-600' : 'text-red-600'}`}>
            {isValid ? '✓ Valid phone number' : '✗ Invalid phone number format'}
          </div>
        )}
      </div>
    </div>
  );
};

// 11. Pin Code Entry with Security
const PinCodeEntryWithSecurity = () => {
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [attempts, setAttempts] = useState(3);
  const [isLocked, setIsLocked] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const correctPin = '123456';
  const enteredPin = pin.join('');

  // Expose state to window.app_state
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      pin,
      enteredPin,
      attempts,
      isLocked,
      showPin
    };
  }, [pin, enteredPin, attempts, isLocked, showPin]);

  const handlePinChange = (index: number, value: string) => {
    if (isLocked) return;
    
    if (value.length > 1) {
      // Handle paste
      const digits = value.slice(0, 6).split('');
      const newPin = [...pin];
      digits.forEach((digit, i) => {
        if (index + i < 6) newPin[index + i] = digit;
      });
      setPin(newPin);
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check pin when complete
    if (newPin.every(digit => digit) && newPin.join('') !== correctPin) {
      setTimeout(() => {
        const newAttempts = attempts - 1;
        setAttempts(newAttempts);
        
        if (newAttempts === 0) {
          setIsLocked(true);
        } else {
          setPin(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        }
      }, 500);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div>
      <div className="space-y-4 max-w-md mx-auto text-center">
        <div className="text-lg font-semibold">
          {isLocked ? '🔒 Account Locked' : '🔐 Enter Security PIN'}
        </div>
        
        <div className="flex gap-2 justify-center">
          {pin.map((digit, index) => (
            <input
              key={index}
              ref={(el) => inputRefs.current[index] = el}
              type={showPin ? 'text' : 'password'}
              value={digit}
              onChange={(e) => handlePinChange(index, e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={isLocked}
              maxLength={6}
              className={`w-12 h-12 text-center text-xl border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isLocked ? 'bg-gray-100 border-gray-300' : 
                enteredPin.length === 6 && enteredPin !== correctPin ? 'border-red-500 bg-red-50' :
                'border-gray-300'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setShowPin(!showPin)}
            className="text-sm text-blue-600 hover:underline"
            disabled={isLocked}
          >
            {showPin ? <EyeOff className="h-4 w-4 inline" /> : <Eye className="h-4 w-4 inline" />}
            {showPin ? ' Hide' : ' Show'} PIN
          </button>
        </div>

        <div className={`text-sm ${attempts === 1 ? 'text-red-600' : 'text-gray-600'}`}>
          {isLocked ? 'Account locked due to too many failed attempts' : 
           `${attempts} attempt${attempts !== 1 ? 's' : ''} remaining`}
        </div>

        {enteredPin.length === 6 && enteredPin !== correctPin && attempts > 0 && (
          <div className="text-red-600 text-sm animate-pulse">
            ✗ Incorrect PIN
          </div>
        )}
      </div>
    </div>
  );
};

// 12. Survey Form with Conditional Logic
const SurveyFormConditionalLogic = () => {
  const [responses, setResponses] = useState<Record<string, any>>({});
  
  const updateResponse = (question: string, value: any) => {
    setResponses({ ...responses, [question]: value });
  };

  const showFollowUp = responses.satisfaction === 'unsatisfied';
  const showRecommendation = responses.satisfaction === 'satisfied' || responses.satisfaction === 'very-satisfied';

  // Expose state to window.app_state
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      responses,
      showFollowUp,
      showRecommendation
    };
  }, [responses, showFollowUp, showRecommendation]);

  return (
    <div>
      <div className="space-y-6 max-w-2xl">
        {/* Question 1: Satisfaction */}
        <div>
          <div className="font-semibold mb-3">How satisfied are you with our product?</div>
          <div className="space-y-2">
            {[
              { value: 'very-satisfied', label: 'Very Satisfied' },
              { value: 'satisfied', label: 'Satisfied' },
              { value: 'neutral', label: 'Neutral' },
              { value: 'unsatisfied', label: 'Unsatisfied' },
              { value: 'very-unsatisfied', label: 'Very Unsatisfied' }
            ].map((option) => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="satisfaction"
                  value={option.value}
                  checked={responses.satisfaction === option.value}
                  onChange={(e) => updateResponse('satisfaction', e.target.value)}
                  className="text-blue-600"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Conditional Question 2: Follow-up for unsatisfied */}
        {showFollowUp && (
          <div className="animate-in slide-in-from-top-5">
            <div className="font-semibold mb-3">What could we improve?</div>
            <div className="space-y-2">
              {['Performance', 'Features', 'Support', 'Pricing', 'Other'].map((option) => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={responses.improvements?.includes(option) || false}
                    onChange={(e) => {
                      const current = responses.improvements || [];
                      const updated = e.target.checked 
                        ? [...current, option]
                        : current.filter((item: string) => item !== option);
                      updateResponse('improvements', updated);
                    }}
                    className="text-blue-600"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Conditional Question 3: Recommendation */}
        {showRecommendation && (
          <div className="animate-in slide-in-from-top-5">
            <div className="font-semibold mb-3">Would you recommend our product to others?</div>
            <div className="space-y-2">
              {[
                { value: 'yes', label: 'Yes, definitely' },
                { value: 'maybe', label: 'Maybe' },
                { value: 'no', label: 'No' }
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="recommend"
                    value={option.value}
                    checked={responses.recommend === option.value}
                    onChange={(e) => updateResponse('recommend', e.target.value)}
                    className="text-blue-600"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Conditional Question 4: Features */}
        {responses.recommend === 'yes' && (
          <div className="animate-in slide-in-from-top-5">
            <div className="font-semibold mb-3">Which features do you value most?</div>
            <div className="space-y-2">
              {[
                { value: 'performance', label: 'Performance' },
                { value: 'ui', label: 'UI/Design' },
                { value: 'reliability', label: 'Reliability' },
                { value: 'support', label: 'Customer Support' }
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={responses.features?.includes(option.value) || false}
                    onChange={(e) => {
                      const current = responses.features || [];
                      const updated = e.target.checked 
                        ? [...current, option.value]
                        : current.filter((item: string) => item !== option.value);
                      updateResponse('features', updated);
                    }}
                    className="text-blue-600"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Progress indicator */}
        <div className="text-sm text-gray-500">
          Questions answered: {Object.keys(responses).length}
        </div>
      </div>
    </div>
  );
};

// 13. Quantity Stepper with Stock Limits
const QuantityStepperStockLimits = () => {
  const [quantity, setQuantity] = useState(1);
  const [stock] = useState(15);
  const minQuantity = 1;
  const bulkDiscountThreshold = 10;
  
  const basePrice = 29.99;
  const bulkDiscount = 0.1; // 10% discount
  const unitPrice = quantity >= bulkDiscountThreshold ? basePrice * (1 - bulkDiscount) : basePrice;
  const totalPrice = unitPrice * quantity;

  // Expose state to window.app_state
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      quantity,
      stock,
      unitPrice,
      totalPrice
    };
  }, [quantity, stock, unitPrice, totalPrice]);

  const updateQuantity = (newQuantity: number) => {
    const validQuantity = Math.max(minQuantity, Math.min(newQuantity, stock));
    setQuantity(validQuantity);
  };

  const increment = () => updateQuantity(quantity + 1);
  const decrement = () => updateQuantity(quantity - 1);

  return (
    <div>
      <div className="space-y-4 max-w-md">
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Premium Widget</h3>
              <div className="text-sm text-gray-600">{stock} in stock</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">${unitPrice.toFixed(2)}</div>
              {quantity >= bulkDiscountThreshold && (
                <div className="text-xs text-green-600">Bulk discount applied!</div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={decrement}
                disabled={quantity <= minQuantity}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                <Minus className="h-4 w-4" />
              </button>
              
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={minQuantity}
                  max={stock}
                  value={quantity}
                  onChange={(e) => updateQuantity(parseInt(e.target.value) || minQuantity)}
                  className="w-16 text-center border rounded px-2 py-1"
                />
                <span className="text-sm text-gray-500">/ {stock}</span>
              </div>
              
              <button
                onClick={increment}
                disabled={quantity >= stock}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="text-right">
              <div className="font-semibold">${totalPrice.toFixed(2)}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>

          {quantity >= bulkDiscountThreshold && (
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
              🎉 Bulk discount: Save ${((basePrice - unitPrice) * quantity).toFixed(2)}
            </div>
          )}

          <div className="mt-3 text-xs text-gray-500">
            • Bulk discount: 10% off for orders of {bulkDiscountThreshold}+
            • Maximum quantity: {stock} units
          </div>
        </div>
      </div>
    </div>
  );
};

// 14. Faceted Search Interface
const FacetedSearchInterface = () => {
  const [filters, setFilters] = useState<Record<string, string[]>>({
    category: [],
    brand: [],
    priceRange: []
  });
  const [searchTerm, setSearchTerm] = useState('');

  const products = [
    { id: 1, name: 'iPhone 14', category: 'Electronics', brand: 'Apple', price: 999 },
    { id: 2, name: 'MacBook Pro', category: 'Electronics', brand: 'Apple', price: 1999 },
    { id: 3, name: 'Apple Watch Band', category: 'Clothing', brand: 'Apple', price: 49 },
    { id: 4, name: 'Apple Backpack', category: 'Clothing', brand: 'Apple', price: 199 },
    { id: 5, name: 'Samsung TV', category: 'Electronics', brand: 'Samsung', price: 799 },
    { id: 6, name: 'Nike Shoes', category: 'Clothing', brand: 'Nike', price: 129 },
    { id: 7, name: 'Adidas Jacket', category: 'Clothing', brand: 'Adidas', price: 89 },
    { id: 8, name: 'Sony Headphones', category: 'Electronics', brand: 'Sony', price: 199 }
  ];

  const facets = {
    category: ['Electronics', 'Clothing'],
    brand: ['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony'],
    priceRange: ['Under $100', '$100-$500', '$500-$1000', 'Over $1000']
  };

  const toggleFilter = (facet: string, value: string) => {
    const currentFilters = filters[facet] || [];
    const updated = currentFilters.includes(value)
      ? currentFilters.filter(item => item !== value)
      : [...currentFilters, value];
    
    setFilters({ ...filters, [facet]: updated });
  };

  const clearAllFilters = () => {
    setFilters({ category: [], brand: [], priceRange: [] });
    setSearchTerm('');
  };

  const getFilteredProducts = () => {
    return products.filter(product => {
      // Search term filter
      if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Category filter
      if (filters.category.length > 0 && !filters.category.includes(product.category)) {
        return false;
      }
      
      // Brand filter
      if (filters.brand.length > 0 && !filters.brand.includes(product.brand)) {
        return false;
      }
      
      // Price range filter
      if (filters.priceRange.length > 0) {
        const matchesPriceRange = filters.priceRange.some(range => {
          switch (range) {
            case 'Under $100': return product.price < 100;
            case '$100-$500': return product.price >= 100 && product.price <= 500;
            case '$500-$1000': return product.price > 500 && product.price <= 1000;
            case 'Over $1000': return product.price > 1000;
            default: return false;
          }
        });
        if (!matchesPriceRange) return false;
      }
      
      return true;
    });
  };

  const filteredProducts = getFilteredProducts();

  // Expose state to window.app_state
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      filters,
      searchTerm,
      filteredProducts
    };
  }, [filters, searchTerm, filteredProducts]);

  return (
    <div>
      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <div className="w-64 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Filters</h3>
            <button
              onClick={clearAllFilters}
              className="text-sm text-blue-600 hover:underline"
            >
              Clear all
            </button>
          </div>

          <div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>

          {Object.entries(facets).map(([facetName, values]) => (
            <div key={facetName}>
              <h4 className="font-medium mb-2 capitalize">{facetName.replace('Range', ' Range')}</h4>
              <div className="space-y-1">
                {values.map((value) => {
                  const count = products.filter(product => {
                    if (facetName === 'category') return product.category === value;
                    if (facetName === 'brand') return product.brand === value;
                    if (facetName === 'priceRange') {
                      switch (value) {
                        case 'Under $100': return product.price < 100;
                        case '$100-$500': return product.price >= 100 && product.price <= 500;
                        case '$500-$1000': return product.price > 500 && product.price <= 1000;
                        case 'Over $1000': return product.price > 1000;
                        default: return false;
                      }
                    }
                    return false;
                  }).length;

                  return (
                    <label key={value} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters[facetName]?.includes(value) || false}
                        onChange={() => toggleFilter(facetName, value)}
                        className="text-blue-600"
                      />
                      <span>{value}</span>
                      <span className="text-gray-500">({count})</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Results */}
        <div className="flex-1">
          <div className="mb-4">
            <h3 className="font-semibold">
              Products ({filteredProducts.length} results)
            </h3>
          </div>
          
          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <div key={product.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{product.name}</h4>
                    <div className="text-sm text-gray-600">
                      {product.brand} • {product.category}
                    </div>
                  </div>
                  <div className="font-semibold text-lg">
                    ${product.price}
                  </div>
                </div>
              </div>
            ))}
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No products match your filters
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 15. Code Input with Syntax Validation
const CodeInputSyntaxValidation = () => {
  const [code, setCode] = useState(`{
  "name": "Invalid JSON
  "version": "1.0.0"
  "missing": "quote"
}`);
  const [errors, setErrors] = useState<string[]>([]);

  const validateJSON = (jsonString: string) => {
    try {
      JSON.parse(jsonString);
      return [];
    } catch (error) {
      const errorMessage = (error as Error).message;
      const match = errorMessage.match(/at position (\d+)/);
      if (match) {
        const position = parseInt(match[1]);
        const lines = jsonString.substring(0, position).split('\n');
        const lineNumber = lines.length;
        const columnNumber = lines[lines.length - 1].length + 1;
        return [`Line ${lineNumber}, Column ${columnNumber}: ${errorMessage}`];
      }
      return [errorMessage];
    }
  };

  useEffect(() => {
    setErrors(validateJSON(code));
  }, [code]);

  const isValid = errors.length === 0;

  // Expose state to window.app_state
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      code,
      errors,
      isValid
    };
  }, [code, errors, isValid]);

  const handleCodeChange = (value: string) => {
    setCode(value);
  };

  return (
    <div>
      <div className="space-y-3">
        <div className="relative">
          <textarea
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            className={`w-full h-48 px-3 py-2 border rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 ${
              isValid ? 'focus:ring-green-500 border-green-500' : 'focus:ring-red-500 border-red-500'
            }`}
            style={{ 
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
              tabSize: 2
            }}
          />
          
          <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${
            isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isValid ? '✓ Valid JSON' : '✗ Invalid JSON'}
          </div>
        </div>

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="text-sm font-semibold text-red-800 mb-1">Syntax Errors:</div>
            <div className="space-y-1">
              {errors.map((error, index) => (
                <div key={index} className="text-sm text-red-700 font-mono">
                  {error}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div>Lines: {code.split('\n').length}</div>
          <div>Characters: {code.length}</div>
          <div className={isValid ? 'text-green-600' : 'text-red-600'}>
            Status: {isValid ? 'Valid' : 'Invalid'}
          </div>
        </div>

        <div className="text-xs text-gray-500">
          Common JSON syntax rules:
          • Strings must be in double quotes
          • No trailing commas
          • Property names must be quoted
        </div>
      </div>
    </div>
  );
};

// 16. Product Rating with Review Copy
const ProductRatingReviewCopy = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [selectedReview, setSelectedReview] = useState('');

  const sampleReviews = [
    'Great product! Highly recommend it to everyone.',
    'Excellent quality and fast shipping. Will buy again.',
    'Perfect for my needs. Works exactly as described.',
    'Outstanding customer service and product quality.'
  ];

  const copyReview = (review: string) => {
    setSelectedReview(review);
    setReviewText(review);
    navigator.clipboard.writeText(review);
  };

  // Expose state to window.app_state
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      rating,
      hoverRating,
      reviewText,
      selectedReview
    };
  }, [rating, hoverRating, reviewText, selectedReview]);

  return (
    <div>
      <div className="space-y-6 max-w-2xl">
        {/* Product Info */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-2">Premium Wireless Headphones</h3>
          <p className="text-gray-600 text-sm mb-4">High-quality audio with noise cancellation</p>
          
          {/* Rating */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm font-medium">Your Rating:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-2xl transition-colors"
                >
                  <Star 
                    className={`h-6 w-6 ${
                      star <= (hoverRating || rating) 
                        ? 'text-yellow-400 fill-yellow-400' 
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <span className="text-sm text-gray-600">({rating}/5 stars)</span>
            )}
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-medium mb-2">Write a Review:</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience..."
              className="w-full px-3 py-2 border rounded-md resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Sample Reviews */}
        <div>
          <h4 className="font-semibold mb-3">Sample Reviews (click to copy):</h4>
          <div className="space-y-2">
            {sampleReviews.map((review, index) => (
              <div
                key={index}
                onClick={() => copyReview(review)}
                className={`p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedReview === review ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <p className="text-sm flex-1">{review}</p>
                  <Copy className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
                </div>
                {selectedReview === review && (
                  <div className="text-xs text-blue-600 mt-1">✓ Copied to clipboard</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 17. Settings Panel with Toggle Switches
const SettingsPanelToggleSwitches = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: true,
    browserNotifications: false,
    marketingEmails: true,
    accountUpdates: true
  });

  const toggleSetting = (key: string) => {
    const newSettings = { ...settings, [key]: !settings[key as keyof typeof settings] };
    
    // Dependency rule: emailNotifications requires accountUpdates
    if (key === 'emailNotifications' && !newSettings.emailNotifications) {
      newSettings.accountUpdates = false;
    }
    if (key === 'accountUpdates' && newSettings.accountUpdates && !newSettings.emailNotifications) {
      newSettings.emailNotifications = true;
    }
    
    setSettings(newSettings);
  };

  // Expose state to window.app_state
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      settings
    };
  }, [settings]);

  const ToggleSwitch = ({ 
    enabled, 
    onChange, 
    disabled = false 
  }: { 
    enabled: boolean; 
    onChange: () => void; 
    disabled?: boolean;
  }) => (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        enabled ? 'bg-blue-600' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div>
      <div className="space-y-6 max-w-lg">
        <div>
          <h3 className="font-semibold text-lg mb-4">Notification Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-medium">Email Notifications</div>
                <div className="text-sm text-gray-500">Receive notifications via email</div>
              </div>
              <ToggleSwitch 
                enabled={settings.emailNotifications}
                onChange={() => toggleSetting('emailNotifications')}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-medium">Push Notifications</div>
                <div className="text-sm text-gray-500">Mobile push notifications</div>
              </div>
              <ToggleSwitch 
                enabled={settings.pushNotifications}
                onChange={() => toggleSetting('pushNotifications')}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-medium">SMS Notifications</div>
                <div className="text-sm text-gray-500">Text message alerts</div>
              </div>
              <ToggleSwitch 
                enabled={settings.smsNotifications}
                onChange={() => toggleSetting('smsNotifications')}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-medium">Browser Notifications</div>
                <div className="text-sm text-gray-500">Desktop browser alerts</div>
              </div>
              <ToggleSwitch 
                enabled={settings.browserNotifications}
                onChange={() => toggleSetting('browserNotifications')}
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-semibold mb-3">Email Preferences</h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-medium">Marketing Emails</div>
                <div className="text-sm text-gray-500">Promotional offers and updates</div>
              </div>
              <ToggleSwitch 
                enabled={settings.marketingEmails}
                onChange={() => toggleSetting('marketingEmails')}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-medium">Account Updates</div>
                <div className="text-sm text-gray-500">Security and account changes</div>
              </div>
              <ToggleSwitch 
                enabled={settings.accountUpdates}
                onChange={() => toggleSetting('accountUpdates')}
                disabled={!settings.emailNotifications}
              />
            </div>
          </div>

          {!settings.emailNotifications && (
            <div className="mt-3 text-xs text-gray-500">
              ℹ️ Account updates require email notifications to be enabled
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 18. Budget Slider with Keyboard Navigation
const BudgetSliderKeyboardNavigation = () => {
  const [budget, setBudget] = useState(1000);
  const [focusOnSlider, setFocusOnSlider] = useState(false);
  const sliderRef = useRef<HTMLInputElement>(null);

  const min = 0;
  const max = 2000;
  const step = 25;

  // Expose state to window.app_state
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      budget,
      focusOnSlider
    };
  }, [budget, focusOnSlider]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!focusOnSlider) return;

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        setBudget(Math.max(min, budget - step));
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        setBudget(Math.min(max, budget + step));
        break;
      case 'PageDown':
        e.preventDefault();
        setBudget(Math.max(min, budget - step * 4));
        break;
      case 'PageUp':
        e.preventDefault();
        setBudget(Math.min(max, budget + step * 4));
        break;
      case 'Home':
        e.preventDefault();
        setBudget(min);
        break;
      case 'End':
        e.preventDefault();
        setBudget(max);
        break;
    }
  };


  return (
    <div>
      <div className="space-y-6 max-w-lg" onKeyDown={handleKeyDown}>
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">
            ${budget.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Monthly Budget</div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <div className="h-2 bg-gray-200 rounded-lg relative overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-lg transition-all duration-150"
                style={{ width: `${(budget / max) * 100}%` }}
              />
            </div>
            
            <input
              ref={sliderRef}
              type="range"
              min={min}
              max={max}
              step={step}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              onFocus={() => setFocusOnSlider(true)}
              onBlur={() => setFocusOnSlider(false)}
              className={`absolute top-0 w-full h-2 opacity-0 cursor-pointer focus:outline-none ${
                focusOnSlider ? 'ring-2 ring-blue-500 rounded-lg' : ''
              }`}
            />
            
            <div 
              className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md pointer-events-none transition-all duration-150"
              style={{ 
                left: `calc(${(budget / max) * 100}% - 8px)`,
                top: '-6px'
              }}
            />
          </div>

          <div className="flex justify-between text-sm text-gray-500">
            <span>${min.toLocaleString()}</span>
            <span>${max.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Keyboard Controls:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            <div>← → : ±$25</div>
            <div>↑ ↓ : ±$25</div>
            <div>Page Up/Down : ±$100</div>
            <div>Home/End : Min/Max</div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Current: ${budget} {focusOnSlider && '(focused)'}
          </div>
        </div>
      </div>
    </div>
  );
};

// 19. Progress Steps with Validation Gates
const ProgressStepsValidationGates = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [stepData, setStepData] = useState({
    step1: { name: '', email: '', valid: false },
    step2: { preferences: '', notifications: false, valid: false },
    step3: { terms: false, newsletter: false, valid: false }
  });

  const validateStep = (step: number, data = stepData) => {
    if (step === 1) {
      return data.step1.name.trim().length > 0 && 
             data.step1.email.includes('@');
    } else if (step === 2) {
      return data.step2.preferences !== '';
    } else if (step === 3) {
      return data.step3.terms;
    }
    return false;
  };

  const updateStepData = (step: number, field: string, value: any) => {
    const newStepData = { ...stepData };
    (newStepData as any)[`step${step}`][field] = value;
    
    // Update validation status based on the new data
    if (step === 1) {
      newStepData.step1.valid = newStepData.step1.name.trim().length > 0 && 
                               newStepData.step1.email.includes('@');
    } else if (step === 2) {
      newStepData.step2.valid = newStepData.step2.preferences !== '';
    } else if (step === 3) {
      newStepData.step3.valid = newStepData.step3.terms;
    }
    
    setStepData(newStepData);
  };

  const goToStep = (step: number) => {
    if (step <= currentStep || (step === currentStep + 1 && validateStep(currentStep))) {
      setCurrentStep(step);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Expose state to window.app_state
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      currentStep,
      stepData
    };
  }, [currentStep, stepData]);

  const steps = [
    { number: 1, title: 'Personal Info', unlocked: true },
    { number: 2, title: 'Preferences', unlocked: stepData.step1.valid },
    { number: 3, title: 'Confirmation', unlocked: stepData.step1.valid && stepData.step2.valid }
  ];

  return (
    <div>
      <div className="max-w-2xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <button
                onClick={() => goToStep(step.number)}
                disabled={!step.unlocked}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  step.number === currentStep
                    ? 'bg-blue-500 text-white'
                    : step.unlocked
                    ? stepData[`step${step.number}` as keyof typeof stepData].valid
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {stepData[`step${step.number}` as keyof typeof stepData].valid ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.number
                )}
              </button>
              
              <div className="ml-3">
                <div className={`text-sm font-semibold text-${step.unlocked ? 'green-600' : 'gray-500'}`}>
                  {step.title}
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <ArrowRight className={`h-4 w-4 mx-4 ${
                  step.unlocked ? 'text-gray-400' : 'text-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white border rounded-lg p-6 min-h-[300px]">
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={stepData.step1.name}
                  onChange={(e) => updateStepData(1, 'name', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email Address *</label>
                <input
                  type="email"
                  value={stepData.step1.email}
                  onChange={(e) => updateStepData(1, 'email', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                />
              </div>
              {!stepData.step1.valid && (stepData.step1.name || stepData.step1.email) && (
                <div className="text-red-600 text-sm">
                  Please fill in all required fields with valid information
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Communication Preferences</h3>
              <div>
                <label className="block text-sm font-medium mb-3">How would you like to receive updates? *</label>
                <div className="space-y-2">
                  {['email', 'sms', 'push', 'none'].map((option) => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="preferences"
                        value={option}
                        checked={stepData.step2.preferences === option}
                        onChange={(e) => updateStepData(2, 'preferences', e.target.value)}
                        className="text-blue-600"
                      />
                      <span className="capitalize">
                        {option === 'none' ? 'No updates' : `${option} notifications`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stepData.step2.notifications}
                    onChange={(e) => updateStepData(2, 'notifications', e.target.checked)}
                    className="text-blue-600"
                  />
                  <span>Enable instant notifications</span>
                </label>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Terms & Confirmation</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium mb-2">Summary:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Name: {stepData.step1.name}</div>
                  <div>Email: {stepData.step1.email}</div>
                  <div>Preferences: {stepData.step2.preferences}</div>
                </div>
              </div>
              <div className="space-y-3">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stepData.step3.terms}
                    onChange={(e) => updateStepData(3, 'terms', e.target.checked)}
                    className="text-blue-600 mt-1"
                  />
                  <span className="text-sm">
                    I agree to the Terms of Service and Privacy Policy *
                  </span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stepData.step3.newsletter}
                    onChange={(e) => updateStepData(3, 'newsletter', e.target.checked)}
                    className="text-blue-600 mt-1"
                  />
                  <span className="text-sm">
                    Subscribe to our newsletter for updates and tips
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6 pt-4 border-t">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={nextStep}
              disabled={currentStep < 3 ? !validateStep(currentStep) : !validateStep(3)}
              className={`px-4 py-2 rounded-md ${
                currentStep < 3 ? !validateStep(currentStep) : !validateStep(3)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {currentStep === 3 ? 'Complete' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 20. Data Table Editor with Inline Validation
const DataTableEditorInlineValidation = () => {
  const [contacts, setContacts] = useState([
    { id: 1, name: 'John Smith', email: 'john.smith', phone: '555-0123', editing: null },
    { id: 2, name: 'Jane Doe', email: 'jane@example.com', phone: '555-invalid', editing: null },
    { id: 3, name: 'Bob Wilson', email: 'bob@company.com', phone: '555-0789', editing: null }
  ]);

  const [editingCell, setEditingCell] = useState<{id: number, field: string} | null>(null);
  const [editValue, setEditValue] = useState('');

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^\d{3}-\d{4}$/.test(phone);

  const startEdit = (id: number, field: string, currentValue: string) => {
    setEditingCell({ id, field });
    setEditValue(currentValue);
  };

  const saveEdit = () => {
    if (!editingCell) return;

    const { id, field } = editingCell;
    let isValid = true;

    if (field === 'email') {
      isValid = validateEmail(editValue);
    } else if (field === 'phone') {
      isValid = validatePhone(editValue);
    }

    if (isValid) {
      setContacts(contacts.map(contact => 
        contact.id === id 
          ? { ...contact, [field]: editValue }
          : contact
      ));
      setEditingCell(null);
      setEditValue('');
    }
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  // Expose state to window.app_state
  useEffect(() => {
    (window as any).app_state = { 
      ...(window as any).app_state, 
      contacts,
      editingCell,
      editValue
    };
  }, [contacts, editingCell, editValue]);

  return (
    <div>
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Email</th>
                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Phone</th>
                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  {/* Name */}
                  <td className="border border-gray-300 px-4 py-2">
                    {editingCell?.id === contact.id && editingCell?.field === 'name' ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={saveEdit}
                        className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                    ) : (
                      <div
                        onClick={() => startEdit(contact.id, 'name', contact.name)}
                        className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded"
                      >
                        {contact.name}
                      </div>
                    )}
                  </td>

                  {/* Email */}
                  <td className="border border-gray-300 px-4 py-2">
                    {editingCell?.id === contact.id && editingCell?.field === 'email' ? (
                      <input
                        type="email"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={saveEdit}
                        className={`w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 ${
                          validateEmail(editValue) ? 'focus:ring-blue-500' : 'focus:ring-red-500 border-red-500'
                        }`}
                        autoFocus
                      />
                    ) : (
                      <div
                        onClick={() => startEdit(contact.id, 'email', contact.email)}
                        className={`cursor-pointer hover:bg-blue-50 px-2 py-1 rounded ${
                          validateEmail(contact.email) ? '' : 'text-red-600 bg-red-50'
                        }`}
                      >
                        {contact.email}
                      </div>
                    )}
                  </td>

                  {/* Phone */}
                  <td className="border border-gray-300 px-4 py-2">
                    {editingCell?.id === contact.id && editingCell?.field === 'phone' ? (
                      <input
                        type="tel"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={saveEdit}
                        placeholder="555-1234"
                        className={`w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 ${
                          validatePhone(editValue) ? 'focus:ring-blue-500' : 'focus:ring-red-500 border-red-500'
                        }`}
                        autoFocus
                      />
                    ) : (
                      <div
                        onClick={() => startEdit(contact.id, 'phone', contact.phone)}
                        className={`cursor-pointer hover:bg-blue-50 px-2 py-1 rounded ${
                          validatePhone(contact.phone) ? '' : 'text-red-600 bg-red-50'
                        }`}
                      >
                        {contact.phone}
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {validateEmail(contact.email) && validatePhone(contact.phone) ? (
                      <span className="text-green-600 font-semibold">✓ Valid</span>
                    ) : (
                      <span className="text-red-600 font-semibold">✗ Invalid</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-sm text-gray-600">
          <div className="mb-2"><strong>Instructions:</strong></div>
          <ul className="list-disc list-inside space-y-1">
            <li>Click any cell to edit inline</li>
            <li>Press Enter to save, Escape to cancel</li>
            <li>Email format: user@domain.com</li>
            <li>Phone format: XXX-XXXX</li>
          </ul>
        </div>

        {editingCell && (
          <div className="text-sm text-blue-600">
            Editing {editingCell.field} for contact {editingCell.id}. Press Enter to save, Escape to cancel.
          </div>
        )}
      </div>
    </div>
  );
};

// Task data
const tasks = [
    { 
      id: 1, 
      name: 'Multi-Step Registration Wizard', 
      component: MultiStepRegistrationWizard,
      task: 'Complete all 3 steps with exact values: email: john@company.com, password: secure123, first name: John, last name: Smith, company: Tech Corp, role: Developer',
      ux: 'Each step unlocks after validation, progress shows completion',
      test: () => {
        const appState = (window as any).app_state;
        const success = appState?.currentStep === 4 && 
          appState?.formData?.email === 'john@company.com' && 
          appState?.formData?.firstName === 'John' && 
          appState?.formData?.lastName === 'Smith' &&
          appState?.formData?.company === 'Tech Corp' &&
          appState?.formData?.password === 'secure123' &&
          appState?.formData?.role === 'Developer';
        return { success };
      }
    },
    { 
      id: 2, 
      name: 'Smart Calculator with Memory Functions', 
      component: SmartCalculatorMemoryFunctions,
      task: 'Calculate 15 + 25, store result in memory (MS), then recall (MR) and add 10 to get 50',
      ux: 'Calculator with memory functions, clear display, operation chaining',
      test: () => {
        const appState = (window as any).app_state;
        const success = appState?.display === '50' && appState?.memory === 40;
        return { success };
      }
    },
    { 
      id: 3, 
      name: 'Image Gallery Builder with Drag Sorting', 
      component: ImageGalleryDragSorting,
      task: 'Arrange images in alphabetical order by filename: city.jpg, forest.jpg, mountain.jpg, ocean.jpg, sunset.jpg',
      ux: 'Drag and drop to reorder, visual feedback during drag',
      test: () => {
        const appState = (window as any).app_state;
        const correctOrder = ['city.jpg', 'forest.jpg', 'mountain.jpg', 'ocean.jpg', 'sunset.jpg'];
        const success = appState?.images?.every((img: any, idx: number) => img.name === correctOrder[idx]);
        return { success };
      }
    },
    { 
      id: 4, 
      name: 'Credit Card Form with Real-Time Validation', 
      component: CreditCardFormValidation,
      task: 'Enter valid card: 4532015112830366, expiry: 12/25, CVV: 123, name: John Smith',
      ux: 'Real-time formatting and validation, visual feedback',
      test: () => {
        const appState = (window as any).app_state;
        const success = appState?.isValidCard && 
          appState?.isValidExpiry && 
          appState?.isValidCvv && 
          appState?.isValidHolder && 
          appState?.cardHolder === 'John Smith';
        return { success };
      }
    },
    { 
      id: 5, 
      name: 'Password Strength Meter', 
      component: PasswordStrengthMeter,
      task: 'Enter password "SecurePass123!" and confirm it matches (meets all 5 strength requirements)',
      ux: 'Real-time strength indicator, requirement checklist, show/hide toggle',
      test: () => {
        const appState = (window as any).app_state;
        const success = appState?.password === 'SecurePass123!' && 
          appState?.passwordsMatch && 
          appState?.score === 5;
        return { success };
      }
    },
    { 
      id: 6, 
      name: 'Address Builder with Component Fields', 
      component: AddressBuilderComponentFields,
      task: 'Enter exact address: 123 Main St, New York, NY 10001',
      ux: 'Real-time validation, state abbreviation format, ZIP code format',
      test: () => {
        const appState = (window as any).app_state;
        const success = appState?.address?.street === '123 Main St' && 
          appState?.address?.city === 'New York' && 
          appState?.address?.state === 'NY' && 
          appState?.address?.zipCode === '10001';
        return { success };
      }
    },
    { 
      id: 7, 
      name: 'Color Picker Multi-Format', 
      component: ColorPickerMultiFormat,
      task: 'Select exact color #FF6B35 (orange) in the color picker and copy its RGB value to clipboard from the boxes below',
      ux: 'Color picker, multiple format display, copy buttons',
      test: () => {
        const appState = (window as any).app_state;
        const success = appState?.color?.toUpperCase() === '#FF6B35' && 
          appState?.copied && 
          appState?.copySuccess?.includes('rgb(');
        return { success };
      }
    },
    { 
      id: 8, 
      name: 'Dual-Handle Range Slider', 
      component: DualHandleRangeSlider,
      task: 'Set range between 10-20',
      ux: 'Dual sliders with collision detection, visual range display',
      test: () => {
        const appState = (window as any).app_state;
        const success = appState?.minValue === 10 && appState?.maxValue === 20;
        return { success };
      }
    },
    { 
      id: 9, 
      name: 'Tag Input with Validation Rules', 
      component: TagInputValidationRules,
      task: 'Add exactly 5 valid tags: react, javascript, web, development, frontend',
      ux: 'Validation rules, forbidden words, character limits, duplicate prevention',
      test: () => {
        const appState = (window as any).app_state;
        const success = appState?.tags?.length === 5 && 
          appState?.tags?.includes('react') && 
          appState?.tags?.includes('javascript') &&
          appState?.tags?.includes('web') &&
          appState?.tags?.includes('development') &&
          appState?.tags?.includes('frontend');
        return { success };
      }
    },
    { 
      id: 10, 
      name: 'International Phone Number Input', 
      component: InternationalPhoneNumberInput,
      task: 'Select UK and enter phone number: 20 78 12 34 56',
      ux: 'Country selection, automatic formatting, validation per country',
      test: () => {
        const appState = (window as any).app_state;
        const success = appState?.selectedCountry === 'GB' && 
          appState?.phoneNumber === '20 78 12 34 56' && 
          appState?.isValid;
        return { success };
      }
    },
    { 
      id: 11, 
      name: 'Pin Code Entry with Security', 
      component: PinCodeEntryWithSecurity,
      task: 'Enter correct PIN: 123456',
      ux: 'Masked input, attempt limits, auto-focus, lockout behavior',
      test: () => {
        const appState = (window as any).app_state;
        const success = appState?.enteredPin === '123456' && appState?.attempts > 0;
        return { success };
      }
    },
    { 
      id: 12, 
      name: 'Survey Form with Conditional Logic', 
      component: SurveyFormConditionalLogic,
      task: 'Answer "Satisfied", then "Yes" to recommend, and select "UI/Design"',
      ux: 'Conditional questions appear based on previous answers',
      test: () => {
        const appState = (window as any).app_state;
        const features = appState?.responses?.features || [];
        const success = appState?.responses?.satisfaction === 'satisfied' && 
          appState?.responses?.recommend === 'yes' && 
          features.length === 1 && 
          features.includes('ui');
        return { success };
      }
    },
    { 
      id: 13, 
      name: 'Quantity Stepper with Stock Limits', 
      component: QuantityStepperStockLimits,
      task: 'Select quantity of 12 to get bulk discount',
      ux: 'Stock limits, bulk pricing, stepper controls, price calculation',
      test: () => {
        const appState = (window as any).app_state;
        const success = appState?.quantity === 12;
        return { success };
      }
    },
    { 
      id: 14, 
      name: 'Faceted Search Interface', 
      component: FacetedSearchInterface,
      task: 'Filter to show only Apple Electronics (should show exactly 2 products: iPhone 14 and MacBook Pro)',
      ux: 'Multiple filter categories, result counting, clear functionality',
      test: () => {
        const appState = (window as any).app_state;
        const success = appState?.filteredProducts?.length === 2 && 
          appState?.filters?.category?.includes('Electronics') && 
          appState?.filters?.brand?.includes('Apple') &&
          appState?.filteredProducts?.every((p: any) => p.brand === 'Apple' && p.category === 'Electronics');
        return { success };
      }
    },
    { 
      id: 15, 
      name: 'Code Input with Syntax Validation', 
      component: CodeInputSyntaxValidation,
      task: 'Fix the JSON syntax errors to make it valid',
      ux: 'Real-time syntax checking, error positioning, monospace font',
      test: () => {
        const appState = (window as any).app_state;
        const success = appState?.isValid && 
          appState?.code?.includes('"name"') && 
          appState?.code?.includes('"version"');
        return { success };
      }
    },
    { 
      id: 16, 
      name: 'Product Rating with Review Copy', 
      component: ProductRatingReviewCopy,
      task: 'Rate 4 stars and copy the first sample review',
      ux: 'Star rating, copy functionality, text selection and paste',
      test: () => {
        const appState = (window as any).app_state;
        const sampleReviews = [
          'Great product! Highly recommend it to everyone.',
          'Excellent quality and fast shipping. Will buy again.',
          'Perfect for my needs. Works exactly as described.',
          'Outstanding customer service and product quality.'
        ];
        const success = appState?.rating === 4 && appState?.reviewText === sampleReviews[0];
        return { success };
      }
    },
    { 
      id: 17, 
      name: 'Settings Panel with Toggle Switches', 
      component: SettingsPanelToggleSwitches,
      task: 'Enable only "Browser Notifications", disable all others',
      ux: 'Toggle switches, dependency rules, grouped settings',
      test: () => {
        const appState = (window as any).app_state;
        const success = !appState?.settings?.emailNotifications && 
          !appState?.settings?.pushNotifications && 
          !appState?.settings?.smsNotifications && 
          appState?.settings?.browserNotifications && 
          !appState?.settings?.marketingEmails && 
          !appState?.settings?.accountUpdates;
        return { success };
      }
    },
    { 
      id: 18, 
      name: 'Budget Slider with Keyboard Navigation', 
      component: BudgetSliderKeyboardNavigation,
      task: 'Set budget to exactly $750 using only keyboard navigation',
      ux: 'Keyboard-only controls, focus management, step increments',
      test: () => {
        const appState = (window as any).app_state;
        const success = appState?.budget === 750;
        return { success };
      }
    },
    { 
      id: 19, 
      name: 'Progress Steps with Validation Gates', 
      component: ProgressStepsValidationGates,
      task: 'Complete all 3 steps with exact values: name: John, email: john@company.com, preference: email, accept terms',
      ux: 'Sequential unlocking, validation gates, progress indicators',
      test: () => {
        const appState = (window as any).app_state;
        const success = appState?.stepData?.step1?.valid && 
          appState?.stepData?.step2?.valid && 
          appState?.stepData?.step3?.valid && 
          appState?.stepData?.step1?.name === 'John' &&
          appState?.stepData?.step1?.email === 'john@company.com' &&
          appState?.stepData?.step2?.preferences === 'email' &&
          appState?.stepData?.step3?.terms === true;
        return { success };
      }
    },
    { 
      id: 20, 
      name: 'Data Table Editor with Inline Validation', 
      component: DataTableEditorInlineValidation,
      task: 'Fix all email and phone formats: john.smith@company.com, jane@example.com, bob@company.com, and phones: 555-0123, 555-0456, 555-0789',
      ux: 'Click to edit cells, Enter to save, Escape to cancel, inline validation',
      test: () => {
        const appState = (window as any).app_state;
        const success = appState?.contacts?.length === 3 &&
          appState?.contacts?.[0]?.email === 'john.smith@company.com' && appState?.contacts?.[0]?.phone === '555-0123' &&
          appState?.contacts?.[1]?.email === 'jane@example.com' && appState?.contacts?.[1]?.phone === '555-0456' &&
          appState?.contacts?.[2]?.email === 'bob@company.com' && appState?.contacts?.[2]?.phone === '555-0789';
        return { success };
      }
    }
  ];

export const tasksForExport = tasks.map(({ id, task, ux }) => ({ id, task, ux }));
export const appInfo = { appName: 'Input Form Task Scenarios', appPath: '/input-boxes' };

// Main App using TaskWrapper
export default function App() {
  return (
    <TaskWrapper 
      tasks={tasks}
      appName="Input Form Task Scenarios"
      appPath="/input-boxes"
    />
  );
} 