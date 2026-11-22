import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const SRC_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../src');

function collectTsFiles(directory: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(directory)) {
    const fullPath = join(directory, entry);
    if (statSync(fullPath).isDirectory()) {
      found.push(...collectTsFiles(fullPath));
      continue;
    }
    if (entry.endsWith('.ts')) {
      found.push(fullPath);
    }
  }
  return found;
}

function importSpecifiers(source: string): string[] {
  const specifiers: string[] = [];
  const patterns = [
    /from\s+['"]([^'"]+)['"]/g,
    /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /require\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      specifiers.push(match[1]!);
    }
  }
  return specifiers;
}

/**
 * Lapisan domain dan application tidak boleh bergantung pada framework
 * atau infrastruktur konkret. Pemeriksaan ini dijalankan terhadap kode
 * sumber, bukan dokumentasi, supaya regresi ketergantungan langsung terlihat.
 */
const FORBIDDEN_IN_DOMAIN = [
  'react',
  'next',
  '@prisma/client',
  '@prisma/adapter-pg',
  'persistence/generated',
  'node:fs',
  'node:path',
  'node:http',
];

const FORBIDDEN_IN_APPLICATION = [
  'react',
  'next',
  '@prisma/client',
  '@prisma/adapter-pg',
  'persistence/generated',
  'node:fs',
  'node:path',
];

function violationsIn(
  directoryName: string,
  forbidden: readonly string[],
): Array<{ file: string; specifier: string }> {
  const directory = join(SRC_ROOT, directoryName);
  const violations: Array<{ file: string; specifier: string }> = [];

  for (const file of collectTsFiles(directory)) {
    const source = readFileSync(file, 'utf8');
    for (const specifier of importSpecifiers(source)) {
      if (forbidden.some((pattern) => specifier === pattern || specifier.startsWith(`${pattern}/`))) {
        violations.push({ file: relative(SRC_ROOT, file), specifier });
      }
    }
  }

  return violations;
}

describe('batas ketergantungan lapisan', () => {
  it('lapisan domain tidak mengimpor React, Next.js, Prisma, atau API node', () => {
    expect(violationsIn('domain', FORBIDDEN_IN_DOMAIN)).toEqual([]);
  });

  it('lapisan application tidak mengimpor React, Next.js, atau Prisma', () => {
    expect(violationsIn('application', FORBIDDEN_IN_APPLICATION)).toEqual([]);
  });

  it('lapisan domain tidak bergantung pada infrastructure atau interface', () => {
    const violations = violationsIn('domain', ['infrastructure', 'interface']);
    expect(violations).toEqual([]);
  });

  it('lapisan application tidak bergantung pada infrastructure atau interface', () => {
    const violations = violationsIn('application', ['infrastructure', 'interface']);
    expect(violations).toEqual([]);
  });

  it('entry point yang dipakai klien tidak menarik lapisan server', () => {
    const source = readFileSync(join(SRC_ROOT, 'index.ts'), 'utf8');
    const specifiers = importSpecifiers(source);

    expect(specifiers.filter((specifier) => specifier.includes('infrastructure'))).toEqual([]);
    expect(specifiers.filter((specifier) => specifier.includes('interface'))).toEqual([]);
  });

  it('entry point server memang menyediakan lapisan infrastructure dan interface', () => {
    const source = readFileSync(join(SRC_ROOT, 'server.ts'), 'utf8');
    const specifiers = importSpecifiers(source);

    expect(specifiers.some((specifier) => specifier.includes('infrastructure'))).toBe(true);
    expect(specifiers.some((specifier) => specifier.includes('interface'))).toBe(true);
  });
});
