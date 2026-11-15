export default {
  plugins: [{
    name: 'absolute-share-urls',
    transformIndexHtml(html) {
      const preview = process.env.VERCEL_ENV === 'preview';
      const host = preview
        ? process.env.VERCEL_URL || process.env.VITE_VERCEL_URL
        : process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VITE_VERCEL_PROJECT_PRODUCTION_URL;
      if (!host) return html;
      const origin = `https://${host}`;
      return html
        .replaceAll('content="/share-preview.png"', `content="${origin}/share-preview.png"`)
        .replace('<meta property="og:type"', `<meta property="og:url" content="${origin}/" />\n    <meta property="og:type"`);
    },
  }],
};
