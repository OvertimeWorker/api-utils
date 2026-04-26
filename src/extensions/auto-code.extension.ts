import { Prisma } from "@prisma/client/extension"
import type { DMMF, TypeMapDef } from "@prisma/client/runtime/client"
import type { PrefixOptions, RawExecutable } from "~/types/extension.types.js"
import { getProcessedDMMFModels } from "~/utils/extension.utils.js"

const sequenceCache = new Map<string, string>()

function createAutoCodeExtension<TypeMap extends TypeMapDef>(
  dmmfModels: DMMF.Model[],
  CodeOptions: PrefixOptions<TypeMap>,
) {
  const processedDMMFModels = getProcessedDMMFModels(dmmfModels)

  const extension = Prisma.defineExtension((client) => {
    const baseClient = Prisma.getExtensionContext(client) as unknown as RawExecutable

    return client.$extends({
      name: "auto-code",

      query: {
        $allModels: {
          async create({ model, args, query }) {
            const configKey = Object.keys(CodeOptions).find(
              (k) => k.toLowerCase() === model.toLowerCase(),
            ) as keyof PrefixOptions<TypeMap> | undefined

            // Check if there is a code generator for this model
            const codeOption = configKey ? CodeOptions[configKey] : undefined

            if (!codeOption) {
              return query(args)
            }

            const rawArgs = args as typeof args & { data: Record<string, unknown> }

            // If the user manually provided a custom code, skip auto-generation and proceed
            if ("code" in rawArgs.data) {
              return query(args)
            }

            const modelMeta = processedDMMFModels[model]
            if (!modelMeta) {
              throw new Error(`Model ${model} not found in DMMF models`)
            }

            const table = modelMeta.dbName
            if (!table) {
              throw new Error(`No table found for model ${model}`)
            }

            const schema = modelMeta.schema
            if (!schema) {
              throw new Error(`No schema found for model ${model}`)
            }

            const idPropertyName = modelMeta.idFields[0]
            if (!idPropertyName) {
              throw new Error(`No ID field found for model ${model}`)
            }

            const idColumnName = modelMeta.fields[idPropertyName]?.dbName
            if (!idColumnName) {
              throw new Error(`No ID column found for model ${model}`)
            }

            // Ask Postgres dynamically which schema this table belongs to
            let seq = sequenceCache.get(model)

            if (!seq) {
              const [seqResult] = await baseClient.$queryRawUnsafe<{ seq: string }[]>(
                `SELECT pg_get_serial_sequence('${schema}.${table}', '${idColumnName}') as seq`,
              )

              if (!seqResult?.seq) {
                throw new Error(`Sequence not found for ${schema}.${table}`)
              }

              seq = seqResult.seq
              sequenceCache.set(model, seq)
            }

            const [result] = await baseClient.$queryRawUnsafe<{ next_id: bigint }[]>(
              `SELECT nextval('${seq}') as next_id`,
            )

            if (!result?.next_id) {
              throw new Error(`Sequence ${seq} returned no next ID`)
            }

            const nextId = Number(result.next_id)

            rawArgs.data[idPropertyName] = nextId
            rawArgs.data["code"] = codeOption(nextId, rawArgs.data)
            return query(rawArgs)
          },
        },
      },
    })
  })

  return {
    extension,
    options: CodeOptions,
  }
}

export { createAutoCodeExtension }
