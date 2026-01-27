
import React from 'react';

interface SciFiSliderProps {
  label: string;
  name: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  minLabel?: string;
  maxLabel?: string;
  disabled?: boolean;
}

const SciFiSlider: React.FC<SciFiSliderProps> = ({ label, name, value, min, max, step = 0.1, onChange, minLabel, maxLabel, disabled = false }) => {
  return (
    <div className={`w-full transition-opacity ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-medium text-gray-400 tracking-wider uppercase">{label}</label>
        <input
            type="number"
            name={name}
            value={String(value)}
            min={min}
            max={max}
            step={step}
            onChange={onChange}
            disabled={disabled}
            onBlur={(e) => { // Handle case where user leaves input empty
                if (e.target.value === '') {
                    const event = {
                        ...e,
                        target: { ...e.target, value: String(min) }
                    };
                    onChange(event as React.ChangeEvent<HTMLInputElement>);
                }
            }}
            className="w-20 text-sm font-semibold font-mono text-[var(--primary-300)] bg-slate-900/50 px-2 py-0.5 rounded text-center border border-slate-700/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:ring-1 focus:ring-[var(--primary-400)] transition disabled:cursor-not-allowed"
        />
      </div>
      <div className="flex items-center gap-3">
         {minLabel && <span className="text-xs text-gray-500 w-12 text-center font-mono">{minLabel}</span>}
        <input
          type="range"
          name={name}
          min={min}
          max={max}
          value={value}
          step={step}
          onChange={onChange}
          disabled={disabled}
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-800 [&::-webkit-slider-thumb]:bg-[var(--primary-400)] [&::-webkit-slider-thumb]:shadow-[0_0_8px_var(--primary-glow)] disabled:cursor-not-allowed disabled:[&::-webkit-slider-thumb]:bg-slate-600 disabled:[&::-webkit-slider-thumb]:shadow-none"
        />
        {maxLabel && <span className="text-xs text-gray-500 w-12 text-center font-mono">{maxLabel}</span>}
      </div>
    </div>
  );
};

export default SciFiSlider;