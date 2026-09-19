import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'lg',
  className = '',
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-[#111622] border border-[#1E293B] rounded-lg shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in zoom-in-95 duration-150 ${className}`}
      >
        {/* Modal Header */}
        {(title || subtitle) && (
          <div className="px-5 py-4 border-b border-[#1E293B] flex items-center justify-between gap-3 shrink-0 bg-[#0B0E14]/40">
            <div>
              {typeof title === 'string' ? (
                <h3 className="text-base font-semibold text-[#F8FAFC] tracking-tight">
                  {title}
                </h3>
              ) : (
                title
              )}
              {subtitle && (
                typeof subtitle === 'string' ? (
                  <p className="text-xs text-[#94A3B8] mt-0.5">{subtitle}</p>
                ) : (
                  subtitle
                )
              )}
            </div>
            <IconButton
              icon={X}
              size="sm"
              variant="ghost"
              label="Close modal"
              onClick={onClose}
            />
          </div>
        )}

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="px-5 py-3 border-t border-[#1E293B] bg-[#0B0E14]/40 flex items-center justify-end gap-2 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  position?: 'right' | 'left';
  width?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  position = 'right',
  width = 'md',
  className = '',
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  const positionClasses = {
    right: 'inset-y-0 right-0',
    left: 'inset-y-0 left-0',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-xs">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div
        className={`fixed ${positionClasses[position]} w-full ${widthClasses[width]} bg-[#111622] border-l border-[#1E293B] shadow-2xl flex flex-col h-full z-10 ${className}`}
      >
        {(title || subtitle) && (
          <div className="px-5 py-4 border-b border-[#1E293B] flex items-center justify-between gap-3 bg-[#0B0E14]/50">
            <div>
              {typeof title === 'string' ? (
                <h3 className="text-base font-semibold text-[#F8FAFC]">{title}</h3>
              ) : (
                title
              )}
              {subtitle && <p className="text-xs text-[#94A3B8]">{subtitle}</p>}
            </div>
            <IconButton icon={X} size="sm" label="Close drawer" onClick={onClose} />
          </div>
        )}

        <div className="p-5 overflow-y-auto custom-scrollbar flex-1">{children}</div>

        {footer && (
          <div className="px-5 py-3 border-t border-[#1E293B] bg-[#0B0E14]/50 flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
