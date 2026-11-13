import { mkdirSync, writeFileSync } from "node:fs";
import { defineConfig, type Plugin } from "vite";
import { imageVersions } from "./scripts/image-versions.ts";
import { saveReaderAssets } from "./scripts/save-reader-assets.ts";

const reader = saveReaderAssets();
const releaseConfig: Plugin = {
  name: "release-config",
  apply: "build",
  configResolved(config) {
    if (process.env.JOMC_RELEASE !== "1") return;
    const key = config.env.VITE_TURNSTILE_SITE_KEY?.trim();
    if (!key || /^[123]x0+/.test(key))
      throw new Error("Set a production VITE_TURNSTILE_SITE_KEY before releasing. Test keys are not allowed.");
  },
};

// The static host has no SPA fallback, so /import/ gets its own copy of the app page.
const importPage: Plugin = {
  name: "import-page",
  apply: "build",
  writeBundle({ dir = "dist" }, bundle) {
    const page = bundle["index.html"];
    if (page?.type !== "asset") throw new Error("index.html missing from build");
    const html = String(page.source)
      .replace("<title>Just One More Catch</title>", "<title>Import a save | Just One More Catch</title>")
      .replaceAll('https://justonemorecatch.app/"', 'https://justonemorecatch.app/import/"');
    mkdirSync(`${dir}/import`, { recursive: true });
    writeFileSync(`${dir}/import/index.html`, html);
  },
};

export default defineConfig({
  define: {
    __IMAGE_VERSIONS__: JSON.stringify(imageVersions()),
    __SAVE_READER_VERSION__: JSON.stringify(reader.version),
  },
  plugins: [reader.plugin, importPage, releaseConfig],
  build: {
    rolldownOptions: {
      input: ["index.html", "contact/index.html"],
      output: {
        codeSplitting: {
          groups: [
            // The shared preload helper must stay outside the deferred UI chunk.
            { name: "preload", test: /vite[\\/]preload-helper/, priority: 1 },
            { name: "clerk-ui", test: /node_modules[\\/]@clerk[\\/]ui[\\/]/ },
          ],
        },
      },
    },
  },
});
