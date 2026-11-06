# Seego fonts

Self-hosted **Fraunces** (titles) and **Hanken Grotesk** (everything else), both under the SIL Open Font License (`licenses/`).

| Folder    | Used by              | Content                                                                                    |
| --------- | -------------------- | ------------------------------------------------------------------------------------------ |
| `web/`    | web, landing page    | Variable `.woff2`, Latin subset, declared in `src/fonts.css` (`@seego/ui/fonts.css`).      |
| `native/` | mobile (`expo-font`) | Static `.ttf`: Hanken Grotesk 400/500/600/700, Fraunces Regular/Italic at optical size 36. |
| `source/` | nobody (build input) | The variable fonts downloaded from Google Fonts, to regenerate `web/` and `native/`.       |

## How the files were derived

With `pip install fonttools brotli`:

- `web/Fraunces*.woff2`: `fontTools.varLib.instancer` with `SOFT=0, WONK=0, wght=400:700` (the `opsz` axis is kept, browsers apply it automatically), then `pyftsubset`-style Latin subset (U+0000-00FF, œ, €, typographic punctuation, arrows) and woff2.
- `web/HankenGrotesk-Variable.woff2`: `wght=400:900`, same subset.
- `native/Fraunces-{Regular,Italic}.ttf`: instance at `opsz=36, wght=400, SOFT=0, WONK=0` (React Native cannot use variable fonts).
- `native/HankenGrotesk-*.ttf`: static files from the Google Fonts download, unchanged.

## Changing a font

Replace the files, keep their names (or update `src/fonts.css` and the `useFonts` call in `apps/mobile/src/app/_layout.tsx`), and keep the family names in `src/typography.ts` in sync.
