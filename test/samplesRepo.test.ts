import { describe, it, expect } from 'vitest';
import { samplesFolderUrl, SDK_SAMPLE_FOLDERS } from '../lib/samplesRepo';

describe('samplesRepo', () => {
  it('builds GitHub tree URL for a folder', () => {
    expect(samplesFolderUrl('typescript', 'main', 'https://github.com/railsinfra/rails-sdk-samples')).toBe(
      'https://github.com/railsinfra/rails-sdk-samples/tree/main/typescript'
    );
  });

  it('strips trailing slashes from base', () => {
    expect(samplesFolderUrl('go', 'main', 'https://github.com/railsinfra/rails-sdk-samples/')).toBe(
      'https://github.com/railsinfra/rails-sdk-samples/tree/main/go'
    );
  });

  it('lists expected sample folders', () => {
    const ids = SDK_SAMPLE_FOLDERS.map((f) => f.id);
    expect(ids).toContain('typescript');
    expect(ids).toContain('csharp');
  });
});
