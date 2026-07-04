/** Visual tokens for the v2 marketing UI (Tailwind class strings). */
export const theme = {
  colors: {
    background: {
      primary: 'bg-zinc-50 dark:bg-[#020202] transition-colors',
      secondary: 'bg-zinc-100 dark:bg-[#050505] transition-colors',
      dark: 'bg-white dark:bg-black transition-colors',
    },
    border: 'structural-border',
    text: {
      primary: 'text-black dark:text-white transition-colors',
      secondary: 'text-zinc-600 dark:text-zinc-400 transition-colors',
      muted: 'text-zinc-500 transition-colors',
    },
  },
  layout: {
    section: 'border-b structural-border transition-colors',
    container: 'max-w-7xl mx-auto border-l border-r structural-border transition-colors',
  },
  typography: {
    h1: 'text-4xl sm:text-5xl lg:text-6xl text-black dark:text-white font-medium tracking-tight leading-[1.1] transition-colors',
    h2: 'text-3xl sm:text-4xl text-black dark:text-white font-medium tracking-tight transition-colors',
    h3: 'text-2xl text-black dark:text-white font-medium transition-colors',
    p: 'text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed font-light transition-colors',
    micro: 'label-micro',
  },
  buttons: {
    primary:
      'bg-black text-white dark:bg-white dark:text-black font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors',
    secondary:
      'border structural-border text-black dark:text-white font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors',
  },
};
