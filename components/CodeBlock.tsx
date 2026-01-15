
import React, { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden font-mono text-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-b border-zinc-800">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-800"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-800"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-800"></div>
        </div>
        <button
          onClick={handleCopy}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-6 overflow-x-auto text-zinc-300">
        <code>
          {code.split('\n').map((line, i) => (
            <div key={i} className="flex">
              <span className="w-8 select-none text-zinc-700">{i + 1}</span>
              <span>{line}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock;
