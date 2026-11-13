import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();
crons.interval("Expire analytics events", { hours: 1 }, internal.events.prune, {});
crons.interval("Expire inactive rate limits", { hours: 1 }, internal.quotaKeys.prune, {});
export default crons;
