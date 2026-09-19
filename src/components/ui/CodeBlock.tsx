import React, { useState } from 'react';
import { Copy, Check, Terminal as TerminalIcon } from 'lucide-react';
import { IconButton } from './IconButton';

export interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  title?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'java',
  filename,
  title,
  showLineNumbers = false,
  className = '',
}) => {
  const displayTitle = title || filename;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const lines = code.trim().split('\n');

  return (
    <div className={`rounded-md border border-[#1E293B] bg-[#0B0E14] overflow-hidden font-mono text-xs ${className}`}>
      {/* Code Header */}
      <div className="px-3.5 py-2 bg-[#111622] border-b border-[#1E293B] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[#94A3B8] truncate">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/60 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/60 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]/60 inline-block" />
          {displayTitle && <span className="text-[#F8FAFC] font-medium ml-1 truncate">{displayTitle}</span>}
          <span className="text-[10px] uppercase text-[#64748B] ml-1">[{language}]</span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-[#94A3B8] hover:text-[#38BDF8] transition-colors p-1 rounded hover:bg-[#1E293B] cursor-pointer"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#22C55E]" />
              <span className="text-[#22C55E]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="p-3.5 overflow-x-auto custom-scrollbar text-[#E5E7EB]">
        {showLineNumbers ? (
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx} className="hover:bg-[#151B28]/40">
                  <td className="pr-4 select-none text-[#64748B] text-right font-mono text-[11px] w-8">
                    {idx + 1}
                  </td>
                  <td className="whitespace-pre font-mono">{line}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <pre className="whitespace-pre font-mono leading-relaxed">{code.trim()}</pre>
        )}
      </div>
    </div>
  );
};

export interface TerminalProps {
  title?: string;
  children: React.ReactNode;
  statusText?: string;
  className?: string;
}

export const Terminal: React.FC<TerminalProps> = ({
  title = 'bash - senior-java-180',
  children,
  statusText,
  className = '',
}) => {
  return (
    <div className={`rounded-lg border border-[#1E293B] bg-[#0B0E14] overflow-hidden font-mono shadow-xl ${className}`}>
      <div className="px-3.5 py-2 bg-[#111622] border-b border-[#1E293B] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
          </div>
          <div className="flex items-center gap-1.5 text-[#94A3B8] ml-2">
            <TerminalIcon className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="font-semibold text-[#F8FAFC]">{title}</span>
          </div>
        </div>
        {statusText && (
          <div className="flex items-center gap-1.5 text-[11px] text-[#22C55E]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
            <span>{statusText}</span>
          </div>
        )}
      </div>
      <div className="p-4 text-xs text-[#E5E7EB] leading-relaxed custom-scrollbar overflow-x-auto">
        {children}
      </div>
    </div>
  );
};
