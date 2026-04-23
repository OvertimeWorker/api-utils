import { PgBoss } from "pg-boss"
import type { SendOptions, ConstructorOptions, WorkOptions } from "pg-boss"
import type { JobContext } from "~/types/job.types.js"

abstract class BaseJob<T extends object> {
  abstract readonly type: string
  protected localConcurrency = 1
  protected localGroupConcurrency = 1
  protected pollingIntervalSeconds: WorkOptions["pollingIntervalSeconds"] = 60
  protected readonly options: SendOptions = {}

  readonly boss: PgBoss
  private readonly defaultOptions: SendOptions = {
    singletonNextSlot: true,
    retryLimit: 3,
    retryDelay: 60,
    retryBackoff: true,
  }

  constructor(boss: PgBoss) {
    this.boss = boss
  }

  abstract handle(job: JobContext<T>): Promise<void>

  abstract fail(job: JobContext<T>, error: Error): Promise<void>

  async start(): Promise<void> {
    await this.boss.createQueue(this.type)
    await this.boss.work<T>(
      this.type,
      {
        batchSize: 1,
        localConcurrency: this.localConcurrency,
        localGroupConcurrency: this.localGroupConcurrency,
        pollingIntervalSeconds: this.pollingIntervalSeconds ?? 60,
      },
      async (jobs) => {
        const [job] = jobs
        if (job) {
          try {
            await this.handle(job)
          } catch (error) {
            const [fullJob] = await this.boss.findJobs(this.type, {
              id: job.id,
            })

            if (fullJob && fullJob.retryCount >= fullJob.retryLimit) {
              try {
                await this.fail(job, error as Error)
              } catch (error) {
                // eslint-disable-next-line no-console
                console.error(`Failed to fail job ${job.id}: ${error}`)
              }
            }

            throw error
          }
        }
      },
    )
  }

  async emit(data: T, options?: SendOptions): Promise<void> {
    await this.boss.send(this.type, data, {
      ...this.defaultOptions,
      ...this.options,
      ...options,
    })
  }
}

type ExtractJobData<T> = T extends BaseJob<infer D> ? D : never

class JobManager<RegisteredJobs extends Record<string, BaseJob<object>>> {
  private readonly boss: PgBoss
  private jobs = new Map<string, BaseJob<object>>()

  constructor(options: ConstructorOptions) {
    this.boss = new PgBoss(options)
  }

  register<D extends object, T extends BaseJob<D>>(
    jobClass: new (boss: PgBoss) => T,
  ): JobManager<RegisteredJobs & { [P in T["type"]]: T }> {
    const jobInstance = new jobClass(this.boss)
    this.jobs.set(jobInstance.type, jobInstance)

    return this
  }

  async start(): Promise<void> {
    await this.boss.start()
    for (const job of this.jobs.values()) {
      await job.start()
    }
  }

  async emit<K extends keyof RegisteredJobs>(
    jobName: K,
    data: ExtractJobData<RegisteredJobs[K]>,
    options?: SendOptions,
  ): Promise<void> {
    const job = this.jobs.get(jobName as string)
    if (!job) throw new Error(`No job registered with the name ${String(jobName)}`)

    await job.emit(data, options)
  }
}

export { BaseJob, JobManager }
