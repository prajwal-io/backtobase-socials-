import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const server = await createServer({
  root: fileURLToPath(new URL('../', import.meta.url)),
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'silent',
});
const { getWebGLContext } = await server.ssrLoadModule('/src/components/ui/shader-art.tsx');
after(() => server.close());

test('shader context falls back when WebGL is unavailable', () => {
  assert.equal(getWebGLContext(null), null);
  assert.equal(getWebGLContext({ getContext: () => null }), null);
});

test('shader requests a bounded WebGL context when available', () => {
  const context = {};
  let request;
  const canvas = { getContext: (...args) => { request = args; return context; } };

  assert.equal(getWebGLContext(canvas), context);
  assert.deepEqual(request, ['webgl', { antialias: false, depth: false, alpha: false }]);
});
