document.addEventListener('DOMContentLoaded', () => {
  tailwind.config = {
    darkMode: 'class',
    theme: {
      extend: {
        fontFamily: {
          sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
          heading: ['Space Grotesk', 'ui-sans-serif', 'system-ui', 'sans-serif'],
          mono: ['Noto Sans Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
        },
      },
    },
  };
});
