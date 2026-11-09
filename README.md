# Kothar themes

The themes that used to ship inside [Kothar](https://github.com/billwang7599/kothar): Catppuccin, Everforest, Gruvbox,
Kanagawa, Nord, Rosé Pine, Solarized and Tokyo Night. Install them from **Settings → Marketplace** in Kothar.

This repo is also the template for a theme of your own.

## How Kothar installs a theme

The [marketplace catalog](https://github.com/billwang7599/kothar-marketplace) only points at a repo. Kothar looks up
that repo's latest GitHub release and downloads the asset named `<id>.json`. One release can carry many themes, as this
one does, or just one.

A theme can only ever change colours. Kothar checks every file before it installs it: known fields only, and every
colour a hex value (`#rgb`, `#rrggbb` or `#rrggbbaa`). Anything else and the install is refused.

## Make your own theme

1. Make a repo of your own (or fork this one) with `themes/<id>.json`:

   ```json
   {
     "id": "my-theme",
     "name": "My Theme",
     "version": "1.0.0",
     "author": "Your Name",
     "description": "One line about it.",
     "variants": { "dark": "Night", "light": "Day" },
     "dark":  { "bg": "#1d1f21", "panel": "#25282b", "raised": "#2e3135", "hover": "#373b40", "border": "#373b40",
                "text": "#e6e6e6", "muted": "#b4b7bb", "faint": "#7d8288", "accent": "#5b8def",
                "on-accent": "#ffffff", "green": "#7fbf7f", "amber": "#e3a33b", "red": "#e06c6c" },
     "light": { "bg": "#ffffff", "panel": "#f4f5f6", "raised": "#ffffff", "hover": "#eceef0", "border": "#dfe2e5",
                "text": "#1d1f21", "muted": "#4f555c", "faint": "#5f656c", "accent": "#2563d9",
                "on-accent": "#ffffff", "green": "#2e7d32", "amber": "#a76a0c", "red": "#c62828" }
   }
   ```

   - `id`: lowercase letters, digits and dashes. The file must be named `<id>.json`.
   - `variants` is optional: what you call your dark and light palettes.
   - Every one of the 13 colours is required in both `dark` and `light`. `amber` means "Kothar needs you", so keep
     `accent` well away from it.
2. Copy `scripts/check.mjs` and `.github/` from this repo. `node scripts/check.mjs` checks the format and that text
   stays readable (4.5:1 on the page and panels).
3. Try it in Kothar before you publish: **Settings → Marketplace → Install from folder…** and pick your `themes/`
   folder. It installs as "local".
4. Bump `version`, then push a tag (`git tag v1.0.0 && git push --tags`). The release workflow checks the themes and
   publishes them.
5. Submit it to the catalog with a PR to
   [kothar-marketplace](https://github.com/billwang7599/kothar-marketplace#submit-a-theme-or-mod).

Later releases reach Kothar users without another review: they see **Update** once your latest release has a new
`version`.

## Credits

Each palette belongs to its authors: Catppuccin (the Catppuccin org), Everforest (sainnhe), Gruvbox (morhetz), Kanagawa
(rebelot), Nord (Arctic Ice Studio), Rosé Pine (the Rosé Pine org), Solarized (Ethan Schoonover) and Tokyo Night
(enkia). The theme files here are MIT licensed; see each palette's own licence for the colours.
