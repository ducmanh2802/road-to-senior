import React, { useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { key: 'D', description: 'Jump to Dashboard' },
    { key: 'T', description: 'Jump to Today Page' },
    { key: 'R', description: 'Start Spaced Review (Active Recall)' },
    { key: 'K', description: 'Open Knowledge System' },
    { key: 'A', description: 'DSA Practice & Patterns' },
    { key: 'J', description: 'Core Java & Concurrency' },
    { key: 'S', description: 'Spring Boot 3 Deep Dive' },
    { key: 'M', description: 'Microservices & Kafka' },
    { key: 'Y', description: 'System Design Architecture' },
    { key: 'C', description: 'Claude Code AI Agent' },
    { key: 'E', description: 'Technical English Trainer' },
    { key: 'P', description: 'Production E-Commerce Project' },
    { key: 'I', description: 'Senior Interview Center' },
    { key: '⌘ + K / Ctrl + K', description: 'Open Command Palette' },
    { key: '?', description: 'Show this shortcuts guide' },
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard Shortcuts"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#111622] border border-[#1E293B] rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        <div className="p-3.5 bg-[#0B0E14] border-b border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-mono text-xs font-semibold">
            <Keyboard className="w-4 h-4 text-[#38BDF8]" />
            <span>KEYBOARD SHORTCUTS</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close shortcuts modal"
            className="p-1 rounded text-[#94A3B8] hover:text-white hover:bg-[#1E293B]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 max-h-[70vh] overflow-y-auto custom-scrollbar divide-y divide-[#1E293B]/60 font-mono text-xs">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="py-2 flex items-center justify-between">
              <span className="text-[#94A3B8] font-sans">{s.description}</span>
              <kbd className="px-2 py-0.5 rounded bg-[#0B0E14] border border-[#334155] text-[#38BDF8] font-semibold text-[11px]">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="p-3 bg-[#0B0E14] border-t border-[#1E293B] text-center text-[11px] text-[#64748B]">
          Press any single key anytime outside of input boxes to navigate instantly.
        </div>
      </div>
    </div>
  );
};
