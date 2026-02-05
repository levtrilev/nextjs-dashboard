import { useState } from 'react';
import { InOutType } from './definitions';

interface TradeToggleProps {
  value?: InOutType;
  onChange?: (value: InOutType) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function TradeInOutToggle({
  value,
  onChange,
  readonly = false,
  size = 'md'
}: TradeToggleProps) {
  const [internalValue, setInternalValue] = useState<InOutType>('out');
  const currentValue = value ?? internalValue;

  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg'
  };

  const handleChange = (newValue: InOutType) => {
    if (!value) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  return (
    <div className="inline-flex rounded-lg bg-gray-100 p-1">
      <button
        type="button"
        disabled={readonly}
        onClick={() => handleChange('in')}
        className={`flex items-center space-x-2 font-medium transition-all duration-300 rounded-md 
          ${currentValue === 'in'? readonly
            ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-white shadow-md'
            : 'bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-md'
              : 'text-gray-700 hover:bg-white'
        } ${sizes[size]}`}
      >
        <span>📥</span>
        <span>Закупка</span>
      </button>

      <button
        type="button"
        disabled={readonly}
        onClick={() => handleChange('out')}
        className={`flex items-center space-x-2 font-medium transition-all duration-300 rounded-md 
          ${currentValue === 'out' ? readonly
            ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-white shadow-md'
            : 'bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-md'
            : 'text-gray-700 hover:bg-white'
          } ${sizes[size]}`}
      >
        <span>📤</span>
        <span>Продажа</span>
      </button>
    </div>
  );
}