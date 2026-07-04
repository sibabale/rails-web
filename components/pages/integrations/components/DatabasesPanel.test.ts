import { describe, expect, it } from 'vitest';
import {
  migrationCopyFor,
  migrationToneFor,
} from '@/components/pages/integrations/components/DatabasesPanel';

describe('DatabasesPanel migration alerts', () => {
  it('renders backend conflict notices as warning copy for unconnected services', () => {
    const conflictNotice =
      'This database connection is already in use by another service in this environment.';

    const tone = migrationToneFor({
      isConnectedPool: false,
      isSetupFailed: false,
      status: 'idle',
      serviceNotice: conflictNotice,
    });
    const copy = migrationCopyFor({
      isSettingUp: false,
      isConnectedPool: false,
      isSetupFailed: false,
      status: 'idle',
      serviceNotice: conflictNotice,
    });

    expect(tone).toBe('warning');
    expect(copy).toBe(conflictNotice);
  });

  it('keeps generic migration guidance when no service notice exists', () => {
    const tone = migrationToneFor({
      isConnectedPool: false,
      isSetupFailed: false,
      status: 'idle',
      serviceNotice: null,
    });
    const copy = migrationCopyFor({
      isSettingUp: false,
      isConnectedPool: false,
      isSetupFailed: false,
      status: 'idle',
      serviceNotice: null,
    });

    expect(tone).toBe('neutral');
    expect(copy).toBe('Migrations will be checked after this database is connected.');
  });
});
