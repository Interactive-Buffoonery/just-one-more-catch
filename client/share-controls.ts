import { esc } from "./dom";
import { shareActive } from "./share-owner";

export const SHARE_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><path d="M12 15V3m0 0L8 7m4-4 4 4"/></svg>`;
export const shareLabel = (id: string) => shareActive(id) ? 'Progress link <i>Active</i>' : "Share progress";
export const shareButton = (id: string, game: string) =>
  `<button class="sharei${shareActive(id) ? " on" : ""}" type="button" data-act="share" data-run="${esc(id)}" data-k="share-${esc(id)}" aria-haspopup="dialog" aria-label="Share progress for ${esc(game)}" title="Share progress">${SHARE_ICON}</button>`;
