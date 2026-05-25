import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CodeScrollPane } from './CodeScrollPane';

describe('CodeScrollPane', () => {
  it('renders its children', () => {
    render(
      <CodeScrollPane>
        <code>hello</code>
      </CodeScrollPane>
    );
    expect(screen.getByText('hello')).toBeInTheDocument();
  });
});
