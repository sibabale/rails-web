
import React, { useState } from 'react';
import { CodeSnippets } from '../types';

interface CodeBlockProps {
  snippets: CodeSnippets;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ snippets }) => {
  const [selectedLang, setSelectedLang] = useState<keyof CodeSnippets>('ts');
  const [copied, setCopied] = useState(false);

  const languages = [
    { id: 'ts', label: 'TypeScript' },
    { id: 'go', label: 'Go' },
    { id: 'rust', label: 'Rust' },
    { id: 'java', label: 'Java' },
  ] as const;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[selectedLang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlight = (line: string) => {
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
      if (line.includes(`.${token}(`) || line.includes(`${token}(`)) {
          if (!/^[A-Z]/.test(token)) {
            return <span key={i} className="text-amber-200">{token}</span>;
          }
      }
      if (/^([A-Z][a-zA-Z0-9_]*)$/.test(token)) {
        return <span key={i} className="text-white font-semibold">{token}</span>;
      }
      if (/^\d+$/.test(token)) {
        return <span key={i} className="text-orange-400">{token}</span>;
      }
      if (/^(true|false|null)$/.test(token)) {
        return <span key={i} className="text-orange-300">{token}</span>;
      }
      if (/^[.:(){}[\]]$/.test(token)) {
          return <span key={i} className="text-zinc-600">{token}</span>;
      }

      return <span key={i} className="text-zinc-400">{token}</span>;
    });
  };

  return (
    <div className="relative group bg-[#080808] border border-white/5 rounded-2xl overflow-hidden font-mono text-sm shadow-2xl">
      {/* Tab Header */}
      <div className="flex items-center justify-between px-6 bg-black/40 border-b border-white/5 backdrop-blur-sm">
        <div className="flex gap-6 overflow-x-auto no-scrollbar">
          {languages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setSelectedLang(lang.id as keyof CodeSnippets)}
              className={`py-4 text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border-b-2 ${
                selectedLang === lang.id
                  ? 'border-white text-white'
                  : 'border-transparent text-zinc-600 hover:text-zinc-400'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div className="relative">
        <pre className="p-8 overflow-x-auto text-zinc-300 min-h-[220px] scrollbar-thin scrollbar-thumb-zinc-800 bg-[#080808]">
          <code className="block leading-relaxed">
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
