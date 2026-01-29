import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Dashboard from '../components/Dashboard';
import environmentReducer from '../state/slices/environmentSlice';

const renderDashboard = () => {
  const store = configureStore({
    reducer: {
      environment: environmentReducer,
    },
  });

  render(
    <Provider store={store}>
      <Dashboard
        onLogout={() => undefined}
        currentTheme="light"
        onToggleTheme={() => undefined}
        session={null}
        profile={null}
      />
    </Provider>
  );

  return store;
};

describe('Dashboard environment selector', () => {
  it('defaults to sandbox and switches to production', async () => {
    renderDashboard();
    expect(screen.getByText('Sandbox')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'PROD' }));

    expect(screen.getByText('Production')).toBeInTheDocument();
    expect(
      screen.getByText('Live Production Environment — Real Assets at Risk')
    ).toBeInTheDocument();
  });
});
