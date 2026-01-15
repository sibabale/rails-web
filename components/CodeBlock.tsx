import React, { useState } from 'react';
import { CodeSnippets } from '../types';

interface CodeBlockProps {
  snippets: CodeSnippets;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ snippets }) => {
  const [selectedLang, setSelectedLang] = useState<keyof CodeSnippets>('ts');

  const languages = [
    { id: 'ts', label: 'TypeScript' },
    { id: 'go', label: 'Go' },
    { id: 'rust', label: 'Rust' },
    { id: 'java', label: 'Java' },
  ] as const;

  const highlight = (line: string) => {
    // Regex for basic syntax highlighting
    const tokens = line.split(/(".*?"|'.*?'|\/\/.*|\b(?:const|let|var|await|async|import|from|return|func|package|type|struct|pub|fn|mut|impl|use|public|class|new|static|void|interface|enum|if|else|err|for|range|vec|List|of)\b|\.\s*([a-zA-Z_]\w*)\s*(?=\()|\b([A-Z][a-zA-Z0-9_]*)\b|\b\d+\b|\b(?:true|false|null)\b)/g);

    return tokens.map((token, i) => {
      if (!token) return null;

      if (/^(".*?"|'.*?')$/.test(token)) {
        return <span key={i} className="text-emerald-400">{token}</span>;
      }
      if (/^\/\/.*$/.test(token)) {
        return <span key={i} className="text-zinc-600 italic">{token}</span>;
      }
      if (/^(const|let|var|await|async|import|from|return|func|package|type|struct|pub|fn|mut|impl|use|public|class|new|static|void|interface|enum|if|else|err|for|range|vec|List|of)$/.test(token)) {
        return <span key={i} className="text-sky-400 font-medium">{token}</span>;
      }
      // Method calls
      if (line.includes(`.${token}(`) || line.includes(`${token}(`)) {
          if (!/^[A-Z]/.test(token)) {
            return <span key={i} className="text-amber-200">{token}</span>;
          }
      }
      // Types / Classes
      if (/^([A-Z][a-zA-Z0-9_]*)$/.test(token)) {
        return <span key={i} className="text-white font-semibold">{token}</span>;
      }
      // Numbers
      if (/^\d+$/.test(token)) {
        return <span key={i} className="text-orange-400">{token}</span>;
      }
      // Booleans / Null
      if (/^(true|false|null)$/.test(token)) {
        return <span key={i} className="text-orange-300">{token}</span>;
      }
      // Operators / Braces
      if (/^[.:(){}[\]]$/.test(token)) {
          return <span key={i} className="text-zinc-600">{token}</span>;
      }

      return <span key={i} className="text-zinc-400">{token}</span>;
    });
  };

  return (
    <div className="relative group bg-[#080808] border border-white/5 rounded-2xl overflow-hidden font-mono text-sm shadow-2xl">
      {/* Header Container */}
      <div className="flex items-center justify-between px-6 bg-black/40 border-b border-white/5 backdrop-blur-sm min-h-[52px]">
        {/* Language Tabs - Left Side */}
        <div className="flex gap-6 overflow-x-auto no-scrollbar flex-grow mr-4">
          {languages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setSelectedLang(lang.id as keyof CodeSnippets)}
              className={`py-4 text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border-b-2 outline-none ${
                selectedLang === lang.id
                  ? 'border-white text-white'
                  : 'border-transparent text-zinc-600 hover:text-zinc-400'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
        
        {/* Status Indicator - Right Side (Preventing overlap with flex-shrink-0) */}
        <div className="flex items-center gap-2 select-none flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-pulse"></span>
          <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.2em] font-bold">
            Live Sandbox
          </span>
        </div>
      </div>

      <div className="relative">
        <pre className="p-8 overflow-x-auto text-zinc-300 min-h-[240px] scrollbar-thin scrollbar-thumb-zinc-800 bg-[#080808]">
          <code className="block leading-relaxed font-mono font-medium">
            {snippets[selectedLang].split('\n').map((line, i) => (
              <div key={i} className="flex group/line py-0.5">
                <span className="w-8 select-none text-zinc-800 text-right pr-4 font-normal text-xs">{i + 1}</span>
                <span className="flex-1 whitespace-pre">{highlight(line)}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;