
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
    // Regex for capturing various tokens
    // 1. Strings: "..." or '...'
    // 2. Comments: //...
    // 3. Keywords: const, let, return, etc.
    // 4. Method calls: .methodName(
    // 5. Types/Classes: Starts with Uppercase (usually) or specific common types
    // 6. Numbers: 100, 500000
    // 7. Boolean/Null: true, false, null
    const tokens = line.split(/(".*?"|'.*?'|\/\/.*|\b(?:const|let|var|await|async|import|from|return|func|package|type|struct|pub|fn|mut|impl|use|public|class|new|static|void|interface|enum|if|else|err|for|range|vec|List|of)\b|\.\s*([a-zA-Z_]\w*)\s*(?=\()|\b([A-Z][a-zA-Z0-9_]*)\b|\b\d+\b|\b(?:true|false|null)\b)/g);

    return tokens.map((token, i) => {
      if (!token) return null;

      // 1. Strings
      if (/^(".*?"|'.*?')$/.test(token)) {
        return <span key={i} className="text-emerald-400">{token}</span>;
      }
      // 2. Comments
      if (/^\/\/.*$/.test(token)) {
        return <span key={i} className="text-zinc-600 italic">{token}</span>;
      }
      // 3. Keywords
      if (/^(const|let|var|await|async|import|from|return|func|package|type|struct|pub|fn|mut|impl|use|public|class|new|static|void|interface|enum|if|else|err|for|range|vec|List|of)$/.test(token)) {
        return <span key={i} className="text-fuchsia-400">{token}</span>;
      }
      // 4. Method/Function Calls (handled by capture group 2 in regex if preceded by dot)
      // Note: the split logic above might put the method name in a later group. 
      // Let's refine the logic: if the previous token was a dot, or if it matches common method patterns.
      if (line.includes(`.${token}(`) || line.includes(`${token}(`)) {
          if (!/^[A-Z]/.test(token)) { // Avoid highlighting constructors as regular methods
            return <span key={i} className="text-amber-200">{token}</span>;
          }
      }
      // 5. Types/Classes
      if (/^([A-Z][a-zA-Z0-9_]*)$/.test(token)) {
        return <span key={i} className="text-cyan-400">{token}</span>;
      }
      // 6. Numbers
      if (/^\d+$/.test(token)) {
        return <span key={i} className="text-orange-400">{token}</span>;
      }
      // 7. Boolean/Null
      if (/^(true|false|null)$/.test(token)) {
        return <span key={i} className="text-orange-300">{token}</span>;
      }

      // Default (Symbols, operators, variable names)
      // Highlight dots and brackets slightly differently for depth
      if (/^[.:(){}[\]]$/.test(token)) {
          return <span key={i} className="text-zinc-400">{token}</span>;
      }

      return <span key={i} className="text-zinc-300">{token}</span>;
    });
  };

  return (
    <div className="relative group bg-[#0d1117] border border-zinc-800 rounded-xl overflow-hidden font-mono text-sm shadow-2xl">
      {/* Tab Header */}
      <div className="flex items-center justify-between px-4 bg-[#161b22] border-b border-zinc-800">
        <div className="flex gap-4 overflow-x-auto no-scrollbar">
          {languages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setSelectedLang(lang.id as keyof CodeSnippets)}
              className={`py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                selectedLang === lang.id
                  ? 'border-fuchsia-500 text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors ml-4 bg-zinc-800/50 px-2 py-1 rounded border border-zinc-700/50"
        >
          {copied ? (
            <>
              <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              <span>Copied</span>
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="relative">
        <pre className="p-6 overflow-x-auto text-zinc-300 min-h-[160px] scrollbar-thin scrollbar-thumb-zinc-800 bg-[#0d1117]">
          <code className="block leading-relaxed">
            {snippets[selectedLang].split('\n').map((line, i) => (
              <div key={i} className="flex group/line hover:bg-zinc-800/20 transition-colors">
                <span className="w-8 select-none text-zinc-600 text-right pr-4 font-normal">{i + 1}</span>
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
