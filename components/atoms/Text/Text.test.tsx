import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Text } from './Text';

describe('Text', () => {
  it('renders its children as a paragraph by default', () => {
    render(<Text>hello</Text>);
    const node = screen.getByText('hello');
    expect(node.tagName.toLowerCase()).toBe('p');
  });

  it('renders the micro variant inside a div', () => {
    render(<Text variant="micro">small</Text>);
    const node = screen.getByText('small');
    expect(node.tagName.toLowerCase()).toBe('div');
  });
});
