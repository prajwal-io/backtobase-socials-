# BacktoBase

A single-page React + Vite social hub. Static output, with no backend, accounts, database, or API keys.

## Structure

- `src/App.jsx` assembles the page.
- `src/components/` contains the link cards and featured videos; `src/components/ui/shader-art.tsx` holds the background shader.
- `src/data/socials.js` holds the four social links in display order.
- `src/data/videos.js` holds featured YouTube links and their video IDs.
- `src/styles.css` contains the layout and visual styles.
- `src/components/ui/shader-art.css` contains the shader layer styles.
- `public/backtobase-logo.png` is the updated supplied BacktoBase artwork with its white background removed, cropped, and exported 3840 pixels wide.
- `public/share-preview.png` is a 1920×1080 social sharing image using that same logo.
- `vite.config.js` turns share-image and canonical metadata into full URLs on Vercel builds.

## Edit content

Update the `title`, `description`, or `url` fields in `src/data/socials.js` to edit the social cards. The three current highlights are in `src/data/videos.js`; add published videos there using their title, YouTube URL, and video ID:

```js
{ title: 'Video title', url: 'https://youtu.be/VIDEO_ID', videoId: 'VIDEO_ID' }
```

The featured section shows one video at a time with its YouTube thumbnail and play indicator. Use the previous/next arrow buttons to move through the videos; they wrap from the last back to the first. Clicking the card opens that video on YouTube in a new tab. Thumbnails load from YouTube’s image host; no embed, API key, or backend is used. Leave `videos` as `[]` to hide the section.

## Local development

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. Run `npm test` for the sharing-metadata check, then `npm run build` for a production build; output is written to `dist/`. Use `npm run preview` to check that output locally.

## Vercel

Import this directory as a Vercel project. Select the **Vite** framework preset, set the build command to `npm run build`, and set the output directory to `dist`. The project has not been deployed.

Vercel's production URL system variable supplies full sharing URLs at build time when system variables are exposed in project settings. Local builds keep relative image paths because they have no public domain. Use `npm ci` for a reproducible install from `package-lock.json`.

## UI tooling

This is a JavaScript Vite app with custom CSS. Vite transpiles the shader's TSX file during the build, but the repository does not currently run TypeScript type checks or use Tailwind/shadcn. The component needs only React and its adjacent CSS file to run here; no images, icons, providers, or state package are required.

The existing component path is `src/components/` and the main stylesheet is `src/styles.css`. The `src/components/ui/` folder keeps reusable UI components in the conventional shadcn location without mixing them with page components. To add the full tooling later, install TypeScript (`npm install -D typescript @types/react @types/react-dom`) and create a Vite TS config, install Tailwind (`npm install tailwindcss @tailwindcss/vite`) and add its Vite plugin and CSS import, then run `npx shadcn@latest init` with the component alias pointed at `src/components/ui`. The shader does not depend on Tailwind utility classes.

