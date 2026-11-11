import { versionImage } from "../shared/image-url.ts";

declare const __IMAGE_VERSIONS__: Record<string, string>;
export const imageUrl = (path: string) => versionImage(path, __IMAGE_VERSIONS__);
