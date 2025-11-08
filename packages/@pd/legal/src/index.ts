import { sha256 } from '@pd/auth';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Load NDA content from docs/nda.md
 */
export function loadNDA(): string {
  try {
    const ndaPath = join(process.cwd(), '../../docs/nda.md');
    return readFileSync(ndaPath, 'utf-8');
  } catch (error) {
    console.error('Failed to load NDA:', error);
    return '# NDA\n\nNDA content not available.';
  }
}

/**
 * Compute SHA-256 hash of NDA content
 */
export function getNDAHash(content?: string): string {
  const ndaContent = content || loadNDA();
  return sha256(ndaContent);
}

/**
 * Get NDA version info
 */
export interface NDAVersion {
  content: string;
  hash: string;
  version: string;
  effectiveDate: string;
}

export function getNDAVersion(): NDAVersion {
  const content = loadNDA();
  return {
    content,
    hash: getNDAHash(content),
    version: '1.0',
    effectiveDate: '2025-01-01',
  };
}
