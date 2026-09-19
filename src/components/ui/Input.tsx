import React, { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: LucideIcon | React.ReactNode;
  iconRight?: LucideIcon | React.ReactNode;
  mono?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  helperText,
  error,
  icon: Icon,
  iconRight: IconRight,
  mono = false,
  className = '',
  id,
  disabled,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const renderIcon = (iconItem: LucideIcon | React.ReactNode) => {
    if (!iconItem) return null;
    if (React.isValidElement(iconItem)) return iconItem;
    const IconComp = iconItem as LucideIcon;
    return <IconComp className="w-4 h-4" />;
  };

  return (
    <div className="w-full space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-[#94A3B8] font-mono select-none"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-2.5 pointer-events-none text-[#64748B] flex items-center justify-center">
            {renderIcon(Icon)}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={`w-full bg-[#0B0E14] text-[#F8FAFC] border rounded text-xs px-3 py-2 transition-all duration-150 placeholder-[#64748B] focus-ring disabled:opacity-50 disabled:cursor-not-allowed ${
            Icon ? 'pl-8' : ''
          } ${IconRight ? 'pr-8' : ''} ${
            error
              ? 'border-[#EF4444] focus:border-[#EF4444]'
              : 'border-[#1E293B] hover:border-[#334155] focus:border-[#38BDF8]'
          } ${mono ? 'font-mono' : 'font-sans'} ${className}`}
          {...props}
        />

        {IconRight && (
          <div className="absolute right-2.5 pointer-events-none text-[#64748B] flex items-center justify-center">
            {renderIcon(IconRight)}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-[11px] text-[#EF4444] font-mono">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-[#64748B] font-mono">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  mono?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  helperText,
  error,
  mono = false,
  className = '',
  id,
  rows = 4,
  disabled,
  ...props
}, ref) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-xs font-medium text-[#94A3B8] font-mono select-none"
        >
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        disabled={disabled}
        className={`w-full bg-[#0B0E14] text-[#F8FAFC] border rounded text-xs p-3 transition-all duration-150 placeholder-[#64748B] focus-ring disabled:opacity-50 disabled:cursor-not-allowed custom-scrollbar ${
          error
            ? 'border-[#EF4444] focus:border-[#EF4444]'
            : 'border-[#1E293B] hover:border-[#334155] focus:border-[#38BDF8]'
        } ${mono ? 'font-mono' : 'font-sans'} ${className}`}
        {...props}
      />

      {error ? (
        <p className="text-[11px] text-[#EF4444] font-mono">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-[#64748B] font-mono">{helperText}</p>
      ) : null}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: { value: string; label: string }[];
  mono?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  helperText,
  error,
  options,
  children,
  mono = true,
  className = '',
  id,
  disabled,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-medium text-[#94A3B8] font-mono select-none"
        >
          {label}
        </label>
      )}

      <select
        ref={ref}
        id={selectId}
        disabled={disabled}
        className={`w-full bg-[#0B0E14] text-[#F8FAFC] border rounded text-xs px-3 py-2 transition-all duration-150 focus-ring disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
          error
            ? 'border-[#EF4444] focus:border-[#EF4444]'
            : 'border-[#1E293B] hover:border-[#334155] focus:border-[#38BDF8]'
        } ${mono ? 'font-mono' : 'font-sans'} ${className}`}
        {...props}
      >
        {options
          ? options.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-[#111622] text-[#F8FAFC]">
                {opt.label}
              </option>
            ))
          : children}
      </select>

      {error ? (
        <p className="text-[11px] text-[#EF4444] font-mono">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-[#64748B] font-mono">{helperText}</p>
      ) : null}
    </div>
  );
});

Select.displayName = 'Select';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  description,
  className = '',
  id,
  disabled,
  ...props
}, ref) => {
  const checkboxId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <label className={`inline-flex items-start gap-2.5 cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <input
        ref={ref}
        type="checkbox"
        id={checkboxId}
        disabled={disabled}
        className="mt-0.5 w-4 h-4 rounded bg-[#0B0E14] border border-[#1E293B] text-[#38BDF8] focus:ring-[#38BDF8] focus:ring-offset-0 focus:ring-1 transition-colors cursor-pointer"
        {...props}
      />
      {(label || description) && (
        <div className="text-xs">
          {label && <div className="text-[#F8FAFC] font-medium leading-tight">{label}</div>}
          {description && <div className="text-[11px] text-[#94A3B8] font-mono mt-0.5">{description}</div>}
        </div>
      )}
    </label>
  );
});

Checkbox.displayName = 'Checkbox';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
}) => {
  return (
    <label className={`inline-flex items-center justify-between gap-3 cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      {(label || description) && (
        <div>
          {label && <div className="text-xs font-medium text-[#F8FAFC]">{label}</div>}
          {description && <div className="text-[11px] text-[#94A3B8] font-mono">{description}</div>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-ring ${
          checked ? 'bg-[#38BDF8]' : 'bg-[#1E293B]'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-4 bg-[#0B0E14]' : 'translate-x-0 bg-[#94A3B8]'
          }`}
        />
      </button>
    </label>
  );
};
