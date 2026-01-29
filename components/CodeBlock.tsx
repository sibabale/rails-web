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
    { id: 'python', label: 'Python' },
    { id: 'java', label: 'Java' },
    { id: 'kotlin', label: 'Kotlin' },
  ] as const;

  const highlight = (line: string) => {
    const tokenRegex =
      /(".*?"|'.*?'|\/\/.*|\b(?:const|let|var|await|async|import|from|return|func|package|type|struct|pub|fn|mut|impl|use|public|class|new|static|void|interface|enum|if|else|err|for|range|vec|List|of|def|print|try|except|lambda|with|as|in|is|not|and|or|pass|break|continue|yield|raise)\b|\.\s*[a-zA-Z_]\w*(?=\()|\b[a-zA-Z_]\w*(?=:)|\b[A-Z][a-zA-Z0-9_]*\b|\b\d+\b|\b(?:true|false|null|True|False|None)\b|[.:(){}[\]])/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    const pushSpan = (text: string, className: string, key: string) => {
      if (!text) return;
      parts.push(
        <span key={key} className={className}>
          {text}
        </span>
      );
    };

    while ((match = tokenRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        pushSpan(line.slice(lastIndex, match.index), 'text-zinc-400', `text-${lastIndex}`);
      }

      const token = match[0];

      if (/^(".*?"|'.*?')$/.test(token)) {
        pushSpan(token, 'text-emerald-400', `str-${match.index}`);
      } else if (/^\/\/.*$/.test(token)) {
        pushSpan(token, 'text-zinc-600 italic', `com-${match.index}`);
      } else if (/^(const|let|var|await|async|import|from|return|func|package|type|struct|pub|fn|mut|impl|use|public|class|new|static|void|interface|enum|if|else|err|for|range|vec|List|of|def|print|try|except|lambda|with|as|in|is|not|and|or|pass|break|continue|yield|raise)$/.test(token)) {
        pushSpan(token, 'text-sky-400 font-medium', `kw-${match.index}`);
      } else if (/^[a-zA-Z_]\w*$/.test(token) && line.includes(`${token}:`)) {
        pushSpan(token, 'text-violet-300', `key-${match.index}`);
      } else if (/^\.\s*[a-zA-Z_]\w*$/.test(token)) {
        const methodName = token.replace(/^\.\s*/, '');
        const prefix = token.slice(0, token.length - methodName.length);
        pushSpan(prefix, 'text-zinc-600', `dot-${match.index}`);
        pushSpan(methodName, 'text-amber-200', `meth-${match.index}`);
      } else if (/^[A-Z][a-zA-Z0-9_]*$/.test(token)) {
        pushSpan(token, 'text-white font-semibold', `type-${match.index}`);
      } else if (/^\d+$/.test(token)) {
        pushSpan(token, 'text-orange-400', `num-${match.index}`);
      } else if (/^(true|false|null|True|False|None)$/.test(token)) {
        pushSpan(token, 'text-orange-300', `bool-${match.index}`);
      } else if (/^[.:(){}[\]]$/.test(token)) {
        pushSpan(token, 'text-zinc-600', `op-${match.index}`);
      } else {
        pushSpan(token, 'text-zinc-400', `tok-${match.index}`);
      }

      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < line.length) {
      pushSpan(line.slice(lastIndex), 'text-zinc-400', `text-${lastIndex}`);
    }

    return parts;
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