import React from 'react';
import { SiTypescript, SiGo, SiKotlin, SiOpenjdk, SiDotnet, SiSupabase, SiGooglecloud, SiPostgresql } from '@icons-pack/react-simple-icons';
import { Cloud, Server } from 'lucide-react';

interface Props {
  activeSection: 'clients' | 'api' | 'database' | 'all';
}

export default function ArchitectureDiagram({ activeSection }: Props) {
  const isClients = activeSection === 'clients' || activeSection === 'all';
  const isApi = activeSection === 'api' || activeSection === 'all';
  const isDb = activeSection === 'database' || activeSection === 'all';

  const sdks = [
    { id: 'KT', Icon: SiKotlin },
    { id: 'JV', Icon: SiOpenjdk },
    { id: '.NET', Icon: SiDotnet },
    { id: 'GO', Icon: SiGo },
    { id: 'TS', Icon: SiTypescript }
  ];

  const dbs = [
    { id: 'SUPA', Icon: SiSupabase },
    { id: 'PG', Icon: SiPostgresql },
    { id: 'AWS', Icon: Cloud },
    { id: 'GCP', Icon: SiGooglecloud },
    { id: 'AZURE', Icon: Server }
  ];

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center font-mono text-xs">
      
      {/* Client Apps */}
      <div className={`w-full border border-dashed p-4 text-center shadow-sm relative transition-all duration-500 block
        ${isClients ? 'border-emerald-500 bg-white dark:bg-[#0a0a0a] ring-1 ring-emerald-500/20' : 'border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-black opacity-50 dark:opacity-40'}`}>
        <div className={`font-medium ${isClients ? 'mb-3' : ''} ${isClients ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500'}`}>SDK</div>
        
        {isClients && (
          <div className="flex flex-wrap justify-center gap-2">
            {sdks.map(sdk => {
              const Icon = sdk.Icon;
              return (
                <div key={sdk.id} className="w-8 h-8 flex items-center justify-center border rounded-sm transition-colors border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10">
                  <Icon size={14} />
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className={`flex flex-col items-center w-full my-2 relative transition-all duration-500 ${isClients || isApi ? 'opacity-100' : 'opacity-50 dark:opacity-40'}`}>
        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700"></div>
        <div className={`w-2 h-2 border bg-white dark:bg-black rotate-45 -my-1 z-10 ${isClients || isApi ? 'border-emerald-500' : 'border-zinc-300 dark:border-zinc-700'}`}></div>
        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700"></div>
        <div className={`absolute right-8 top-1/2 -translate-y-1/2 text-[9px] ${isClients || isApi ? 'text-emerald-600 dark:text-emerald-500/80' : 'text-zinc-500 dark:text-zinc-600'}`}>REST</div>
      </div>
      
      {/* NGINX Gateway */}
      <div className={`w-full border p-3 text-center shadow-md relative z-10 transition-all duration-500 block
        ${isApi ? 'border-emerald-500 bg-emerald-50 dark:bg-[#111] text-emerald-600 dark:text-emerald-400 shadow-emerald-100 dark:shadow-emerald-900/20' : 'border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-[#0a0a0a] text-zinc-500 dark:text-zinc-600 opacity-50 dark:opacity-40'}`}>
        <span>NGINX Gateway</span>
      </div>
      
      <div className={`flex flex-col items-center w-full my-2 transition-all duration-500 ${isApi ? 'opacity-100' : 'opacity-50 dark:opacity-40'}`}>
        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700"></div>
        <div className={`w-2 h-2 border bg-white dark:bg-black rotate-45 -my-1 z-10 ${isApi ? 'border-emerald-500' : 'border-zinc-300 dark:border-zinc-700'}`}></div>
        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700"></div>
      </div>

      {/* rails core diagram box */}
      <div className={`w-full border p-6 relative shadow-xl transition-all duration-500 block
        ${isApi ? 'border-emerald-500 bg-white dark:bg-black ring-1 ring-emerald-500/20' : 'border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-black opacity-50 dark:opacity-40'}`}>
        <div className={`absolute top-0 left-0 px-3 py-1 text-[9px] uppercase tracking-widest font-bold transition-all duration-500
          ${isApi ? 'bg-emerald-500 text-white dark:text-black' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'}`}>
          rails core
        </div>
        
        <div className="mt-6 flex flex-col gap-3 relative">
          <div className="grid grid-cols-3 gap-2 sm:gap-3 relative z-10">
            {/* Users */}
            <div className={`border p-3 sm:p-4 text-center transition-colors flex flex-col items-center
              ${isApi ? 'border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-[#050505]' : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black'}`}>
              <span className={`material-symbols-sharp mb-1 sm:mb-2 ${isApi ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-600'}`} style={{ fontSize: '1.1rem' }}>group</span>
              <div className={`font-medium text-[11px] sm:text-xs transition-colors ${isApi ? 'text-black dark:text-white' : 'text-zinc-500 dark:text-zinc-600'}`}>Users</div>
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">service</div>
            </div>

            {/* Accounts */}
            <div className={`border p-3 sm:p-4 text-center transition-colors flex flex-col items-center
              ${isApi ? 'border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-[#050505]' : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black'}`}>
              <span className={`material-symbols-sharp mb-1 sm:mb-2 ${isApi ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-600'}`} style={{ fontSize: '1.1rem' }}>account_balance_wallet</span>
              <div className={`font-medium text-[11px] sm:text-xs transition-colors ${isApi ? 'text-black dark:text-white' : 'text-zinc-500 dark:text-zinc-600'}`}>Accounts</div>
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">service</div>
            </div>

            {/* Audit */}
            <div className={`border p-3 sm:p-4 text-center transition-colors flex flex-col items-center
              ${isApi ? 'border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-[#050505]' : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black'}`}>
              <span className={`material-symbols-sharp mb-1 sm:mb-2 ${isApi ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-600'}`} style={{ fontSize: '1.1rem' }}>fact_check</span>
              <div className={`font-medium text-[11px] sm:text-xs transition-colors ${isApi ? 'text-black dark:text-white' : 'text-zinc-500 dark:text-zinc-600'}`}>Audit</div>
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">service</div>
            </div>
          </div>

          <div className="relative w-full pointer-events-none z-0 -my-0.5 flex flex-col items-stretch" aria-hidden>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="flex justify-center">
                <div
                  className={`h-6 w-0 border-l border-dashed transition-all duration-500 ${isApi ? 'border-emerald-300 dark:border-emerald-500/50' : 'border-zinc-300 dark:border-zinc-700'}`}
                />
              </div>
              <div className="flex justify-center">
                <div
                  className={`h-6 w-0 border-l border-dashed transition-all duration-500 ${isApi ? 'border-emerald-300 dark:border-emerald-500/50' : 'border-zinc-300 dark:border-zinc-700'}`}
                />
              </div>
              <div className="flex justify-center">
                <div
                  className={`h-6 w-0 border-l border-dashed transition-all duration-500 ${isApi ? 'border-emerald-300 dark:border-emerald-500/50' : 'border-zinc-300 dark:border-zinc-700'}`}
                />
              </div>
            </div>
            <div
              className={`h-0 w-full border-t border-dashed transition-all duration-500 ${isApi ? 'border-emerald-300 dark:border-emerald-500/50' : 'border-zinc-300 dark:border-zinc-700'}`}
            />
            <div className="flex justify-center">
              <div
                className={`h-5 w-0 border-l border-dashed transition-all duration-500 ${isApi ? 'border-emerald-300 dark:border-emerald-500/50' : 'border-zinc-300 dark:border-zinc-700'}`}
              />
            </div>
          </div>

          {/* Ledger */}
          <div className={`border p-4 text-center transition-colors relative z-10 flex flex-col items-center
            ${isApi ? 'border-zinc-200 dark:border-zinc-600 bg-white dark:bg-[#0a0a0a]' : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black'}`}>
            <span className={`material-symbols-sharp mb-2 ${isApi ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-600'}`} style={{ fontSize: '1.25rem' }}>menu_book</span>
            <div className={`font-medium ${isApi ? 'text-black dark:text-white' : 'text-zinc-500 dark:text-zinc-600'}`}>Ledger Engine</div>
            <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">service</div>
          </div>
        </div>

        <div className={`mt-5 text-center text-[10px] flex items-center justify-center gap-2 transition-all duration-500 ${isApi ? 'text-emerald-600 dark:text-emerald-500' : 'text-zinc-400 dark:text-zinc-700'}`}>
          <span className={`w-4 border-t border-dashed ${isApi ? 'border-emerald-300 dark:border-emerald-500/50' : 'border-zinc-300 dark:border-zinc-700'}`}></span>
          <span>gRPC Mesh</span>
          <span className={`w-4 border-t border-dashed ${isApi ? 'border-emerald-300 dark:border-emerald-500/50' : 'border-zinc-300 dark:border-zinc-700'}`}></span>
        </div>
      </div>

      <div className={`flex flex-col items-center w-full my-2 transition-all duration-500 ${isDb || isApi ? 'opacity-100' : 'opacity-50 dark:opacity-40'}`}>
        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700"></div>
        <div className={`w-2 h-2 border bg-white dark:bg-black rotate-45 -my-1 z-10 ${isDb || isApi ? 'border-emerald-500' : 'border-zinc-300 dark:border-zinc-700'}`}></div>
        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700"></div>
      </div>

      {/* Database */}
      <div className={`w-full border border-dashed p-4 text-center transition-all duration-500 block
        ${isDb ? 'border-emerald-500 bg-white dark:bg-[#050505] opacity-100 ring-1 ring-emerald-500/20' : 'border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-black opacity-50 dark:opacity-40'}`}>
        <span className={`block ${isDb ? 'mb-3' : 'mb-1'} font-medium transition-colors ${isDb ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-600'}`}>Database</span>
        
        {isDb && (
          <div className="flex flex-wrap justify-center gap-2 mb-3">
            {dbs.map(db => {
              const Icon = db.Icon;
              return (
                <div key={db.id} className="w-8 h-8 flex items-center justify-center border rounded-sm transition-colors border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10">
                  <Icon size={14} />
                </div>
              );
            })}
          </div>
        )}

        <span className={`text-[10px] block ${isDb ? 'text-zinc-500 dark:text-zinc-400' : 'text-zinc-400 dark:text-zinc-700'}`}>Plug-in Neon, Supabase, etc. (pure SQL migrations)</span>
      </div>

    </div>
  );
}
