import { describe, expect, it } from 'vitest';
import { resolveEnvironmentId } from './index';

const sandboxId = '11111111-1111-4111-8111-111111111111';
const productionId = '22222222-2222-4222-8222-222222222222';

describe('resolveEnvironmentId', () => {
  it('returns production UUID when production mode and prod env exists', () => {
    const session = {
      environment_id: sandboxId,
      environments: [
        { id: sandboxId, type: 'sandbox' },
        { id: productionId, type: 'production' },
      ],
    };

    expect(resolveEnvironmentId(session, 'production')).toBe(productionId);
  });

  it('returns null in production mode when production UUID is missing', () => {
    const session = {
      environment_id: sandboxId,
      environments: [{ id: sandboxId, type: 'sandbox' }],
    };

    expect(resolveEnvironmentId(session, 'production')).toBeNull();
  });

  it('returns sandbox UUID from environments when sandbox mode is active', () => {
    const session = {
      environment_id: sandboxId,
      environments: [
        { id: sandboxId, type: 'sandbox' },
        { id: productionId, type: 'production' },
      ],
    };

    expect(resolveEnvironmentId(session, 'sandbox')).toBe(sandboxId);
  });

  it('falls back to session.environment_id only for sandbox mode', () => {
    const session = { environment_id: sandboxId };

    expect(resolveEnvironmentId(session, 'sandbox')).toBe(sandboxId);
    expect(resolveEnvironmentId(session, 'production')).toBeNull();
  });
});
