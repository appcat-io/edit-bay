# Edit bay

A Video.js video skin for React, styled with CSS. It started from the Scaffold skin.

## Develop

```sh
bun dev
```

This serves the project page at `/` and the workbench at `/workbench/`. The workbench opens your skin in a slimmed-down version of the Video.js sandbox. It plays Tears of Steel from Mux at 24 fps, with chapters and subtitles in six languages; change the media in `apps/preview/src/frame/player`. The options panel sets the player's width and aspect ratio, the color scheme, text direction, and language, and playback options such as autoplay, muted, loop, and preload. The arrow button opens the preview on its own. The settings live in the URL, so a link such as `/workbench/?width=384&ratio=9:16&dir=rtl&locale=ar` opens the workbench in that state, and `/preview.html#width=384&ratio=9:16` opens the preview alone.

## Frame rate and timecode

Browsers don't report a video's frame rate, so set it on the skin with `frameRate`. Timecode, frame steps, and the ruler use it.

- NTSC rates: 23.976 (or 23.98), 29.97, and 59.94 count frames at their exact rate, 1000/1001 of 24, 30, or 60, so the count stays on the source's frames over a long program. Timecode labels them against 24, 30, or 60, as non-drop-frame timecode does.
- `dropFrame`: drop-frame timecode (HH:MM:SS;FF) for 29.97 and 59.94. Other rates ignore it.
- Frame on screen: the current timecode comes from the browser's frame report (`requestVideoFrameCallback`), which names the frame it drew. Where a browser doesn't report frames, or reports a time more than a frame from the player's own time while paused, the skin uses the player's time.
- Pause: when playback pauses, the player settles on the middle of the frame the timecode names, so the picture, the timecode, and the next frame step agree.

Limits:

- Frame steps are exact for constant-frame-rate video. With variable-frame-rate video, timecode shows each frame's time at the rate you set, but steps move at that rate, so they can skip or repeat a frame.
- Browsers don't promise frame-exact seeking. Timecode and steps were checked frame by frame in Chromium and Firefox, with 23.976 and 29.97 drop-frame test clips. Safari isn't checked yet. WebKit on Linux reports frame times two frames ahead, so the skin falls back to the player's time there.

## Deploy

```sh
bun run deploy
```

It asks where to deploy the workbench: Vercel, Netlify, or Cloudflare Pages. Name one to skip the question, such as `bun run deploy vercel`. The first time, the host's CLI signs you in and creates the project, then every run prints the URL. Vercel and Netlify deploy to a preview URL you can share; to deploy to production instead, add `--prod` to the `deploy:netlify` script, or to both commands in `deploy:vercel`.

To deploy on every push instead, put the project on GitHub and import it on Vercel or Netlify; `vercel.json` and `netlify.toml` already describe the build. The build uses relative URLs, so `dist/` also works on any static host, including in a subfolder.

## Where things live

- `src/`: your skin, and only your skin. Keep, rewrite, or delete any of it.
  - `src/video/`: the skin component and its parts.
  - `src/styles/`: theme tokens and shared styles the skin imports, when it started from a packaged skin.
  - `src/skin.css`: global styles for the skin.
- `apps/preview/`: the site. `index.html` and `src/site/` are the Edit bay project page at the root; `workbench/` and `src/shell/` are the workbench at `/workbench/`; `preview.html` and `src/frame/` are the preview the workbench frames. `src/site/top-bar.tsx` is the top bar all three pages share.
  - `src/shell/`: the Shadcn shell.
  - `src/frame/`: the page the shell frames. `player` mounts your skin in a player and sets the media it plays.
  - `public/`: files the preview serves, such as the chapters track.
- `vercel.json`, `netlify.toml`: how those hosts build the workbench.
- `skin.json`: what this skin is built from. Keep it; it records the Video.js version the skin was created with.

## Learn more

- [Build your own skin](https://videojs.org/docs/framework/react/guides/build-your-own-skin)
- [Customize skins](https://videojs.org/docs/framework/react/guides/customize-skins)
- [UI components](https://videojs.org/docs/framework/react/guides/ui-components)

## Credits

The preview plays Tears of Steel. (CC) Blender Foundation | [mango.blender.org](https://mango.blender.org), licensed under [Creative Commons Attribution 3.0](https://creativecommons.org/licenses/by/3.0/). Its subtitles come from the same release, converted to WebVTT. The film is not part of this repository; it streams from Mux.

The skin's code is licensed under Apache 2.0. See `LICENSE`.
