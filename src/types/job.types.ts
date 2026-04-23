import type { Job, SendOptions } from "pg-boss"

type JobContext<T extends object> = Job<T>

export type { JobContext, SendOptions }
