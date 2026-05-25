import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ApiKeyManager from './ApiKeyManager';
import environmentReducer from '@/state/slices/environmentSlice';

vi.mock('@/lib/env', () => ({
  getClientServerUrl: () => 'http://localhost:3001',
}));

const sandboxId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

const renderApiKeyManager = () => {
  const store = configureStore({
    reducer: {
      environment: environmentReducer,
    },
  });

  render(
    <Provider store={store}>
      <ApiKeyManager
        session={{
          access_token: 'test-token',
          environment_id: sandboxId,
          environments: [{ id: sandboxId, type: 'sandbox' }],
        }}
      />
    </Provider>
  );

  return store;
};

describe('ApiKeyManager responsive layout', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [],
      })
    );
  });

  it('renders responsive stack classes on the token row', async () => {
    const { container } = render(
      <Provider
        store={configureStore({
          reducer: { environment: environmentReducer },
        })}
      >
        <ApiKeyManager
          session={{
            access_token: 'test-token',
            environment_id: sandboxId,
            environments: [{ id: sandboxId, type: 'sandbox' }],
          }}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('api-key-manager')).toBeInTheDocument();
    });

    const tokenRow = container.querySelector('.flex.flex-col.gap-3.sm\\:flex-row');
    expect(tokenRow).not.toBeNull();
  });

  it('uses responsive padding on the manager section', async () => {
    renderApiKeyManager();

    const section = await screen.findByTestId('api-key-manager');
    expect(section.className).toContain('p-4');
    expect(section.className).toContain('sm:p-6');
    expect(section.className).toContain('lg:p-8');
  });
});
