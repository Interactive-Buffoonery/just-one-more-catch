import { defineConfig } from "vite";
import { imageVersions } from "./scripts/image-versions.ts";

export default defineConfig({
  define: { __IMAGE_VERSIONS__: JSON.stringify(imageVersions()) },
});
