import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import test from 'node:test';
import { socials } from '../src/data/socials.js';
import { videos, wrapVideoIndex } from '../src/data/videos.js';
import viteConfig from '../vite.config.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

function withVercelEnv(values, run) {
  const keys = ['VERCEL_ENV', 'VERCEL_URL', 'VITE_VERCEL_URL', 'VERCEL_PROJECT_PRODUCTION_URL', 'VITE_VERCEL_PROJECT_PRODUCTION_URL'];
  const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  keys.forEach((key) => delete process.env[key]);
  Object.assign(process.env, values);
  try { run(); }
  finally {
    keys.forEach((key) => {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    });
  }
}

function assertShareOrigin(result, host) {
  const escapedHost = host.replaceAll('.', '\\.');
  assert.match(result, new RegExp(`property="og:url" content="https://${escapedHost}/"`));
  assert.equal((result.match(new RegExp(`https://${escapedHost}/share-preview\\.png`, 'g')) || []).length, 2);
}

test('Vercel production builds use the production canonical and share URLs', () => {
  withVercelEnv({ VERCEL_PROJECT_PRODUCTION_URL: 'example.vercel.app' }, () => {
    assertShareOrigin(viteConfig.plugins[0].transformIndexHtml(html), 'example.vercel.app');
  });
});

test('Vercel preview builds use the preview deployment URL', () => {
  withVercelEnv({ VERCEL_ENV: 'preview', VERCEL_URL: 'feature-branch.vercel.app', VERCEL_PROJECT_PRODUCTION_URL: 'example.vercel.app' }, () => {
    assertShareOrigin(viteConfig.plugins[0].transformIndexHtml(html), 'feature-branch.vercel.app');
  });
});

test('local builds keep relative metadata when no Vercel domain is set', () => {
  withVercelEnv({}, () => {
    const result = viteConfig.plugins[0].transformIndexHtml(html);
    assert.match(result, /property="og:image" content="\/share-preview\.png"/);
    assert.doesNotMatch(result, /property="og:url"/);
  });
});

test('social destinations include the three requested links and YouTube channel in order', () => {
  assert.deepEqual(socials.map(({ title, url }) => [title, url]), [
    ['LinkedIn', 'https://www.linkedin.com/company/backtobasee/'],
    ['Instagram', 'https://www.instagram.com/backtobase_xyz?exln=MXFvMHF3OGU0cXB4dw=='],
    ['WhatsApp', 'https://chat.whatsapp.com/JLCaNCa00Vv1bP0s7fy6MC'],
    ['YouTube', 'https://www.youtube.com/@BacktoBase_xyz'],
  ]);
});

test('featured highlights match the three supplied YouTube videos', () => {
  assert.deepEqual(videos.map(({ url, videoId }) => [url, videoId]), [
    ['https://youtu.be/m2dGP0BzTVo', 'm2dGP0BzTVo'],
    ['https://youtu.be/JjyS3d6sttQ', 'JjyS3d6sttQ'],
    ['https://youtu.be/UvLzX8XCinM', 'UvLzX8XCinM'],
  ]);
});

test('video carousel wraps in both directions', () => {
  assert.equal(wrapVideoIndex(2, 1), 0);
  assert.equal(wrapVideoIndex(0, -1), 2);
  assert.equal(wrapVideoIndex(1, 1), 2);
});

test('share descriptions mention the YouTube channel', () => {
  assert.match(html, /property="og:description" content="[^"]*YouTube[^"]*"/);
  assert.match(html, /name="twitter:description" content="[^"]*YouTube[^"]*"/);
});

test('brand images have the requested sizes and transparent logo format', () => {
  const logo = readFileSync(new URL('../public/backtobase-logo.png', import.meta.url));
  const share = readFileSync(new URL('../public/share-preview.png', import.meta.url));
  assert.deepEqual([logo.readUInt32BE(16), logo[25]], [3840, 6]);
  const imageData = [];
  for (let offset = 8; offset < logo.length;) {
    const length = logo.readUInt32BE(offset);
    if (logo.toString('ascii', offset + 4, offset + 8) === 'IDAT') imageData.push(logo.subarray(offset + 8, offset + 8 + length));
    offset += length + 12;
  }
  // The first pixel has no left or upper neighbors, so PNG filters leave its alpha byte unchanged.
  assert.equal(inflateSync(Buffer.concat(imageData))[4], 0, 'top-left logo pixel should be transparent');
  assert.deepEqual([share.readUInt32BE(16), share.readUInt32BE(20)], [1920, 1080]);
});
