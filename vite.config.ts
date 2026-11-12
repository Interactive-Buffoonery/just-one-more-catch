import { defineConfig } from "vite";
import { imageVersions } from "./scripts/image-versions.ts";
import { saveReaderAssets } from "./scripts/save-reader-assets.ts";

const reader = saveReaderAssets();

export default defineConfig({
  define: {
    __IMAGE_VERSIONS__: JSON.stringify(imageVersions()),
    __SAVE_READER_VERSION__: JSON.stringify(reader.version),
  },
  plugins: [reader.plugin],
  build: {
    rolldownOptions: {
      input: ["index.html", "contact/index.html"],
    },
  },
});
