import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CodeBlock from './CodeBlock';

const snippets = {
  ts: 'const a = 1;',
  go: 'package main',
  java: 'class A {}',
  kotlin: 'fun main() {}',
  csharp: 'class A {}',
};

describe('CodeBlock', () => {
  it('renders the language tabs', () => {
    render(<CodeBlock snippets={snippets} />);
    expect(screen.getByRole('button', { name: /TypeScript/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Go/i })).toBeInTheDocument();
  });
});
