import type { DMMF } from "@prisma/client/runtime/client"
import type { ProcessedDMMFModels } from "~/types/extension.types.js"

function getModelsWithSoftDeleteMap(dmmfModels: DMMF.Model[]) {
  const modelsWithSoftDelete = dmmfModels.filter((model) =>
    model.fields.some((f) => f.name === "deletedAt"),
  )

  const modelsWithSoftDeleteMap = modelsWithSoftDelete.reduce(
    (acc, model) => {
      acc[model.name] = true
      return acc
    },
    {} as Record<string, boolean>,
  )

  return modelsWithSoftDeleteMap
}

function getProcessedDMMFModels(dmmfModels: DMMF.Model[]) {
  const processedDMMFModels = dmmfModels.reduce((acc, model) => {
    const { fields, ...modelWithoutFields } = model

    const processedFields = fields.reduce(
      (acc, field) => {
        acc[field.name] = field
        return acc
      },
      {} as Record<string, DMMF.Field>,
    )

    const directIdFields = model.fields.filter((f) => f.isId).map((f) => f.name) // standard @id
    const compositeIdFields = model.primaryKey ? model.primaryKey.fields : [] // compound @@id
    const idFields = [...new Set([...directIdFields, ...compositeIdFields])]

    acc[model.name] = {
      ...modelWithoutFields,
      fields: processedFields,
      idFields,
    }

    return acc
  }, {} as ProcessedDMMFModels)

  return processedDMMFModels
}

// Get a record's unique ID (primary/compound key) based on prisma metadata
function getRecordId(
  processedDMMFModels: ProcessedDMMFModels,
  modelName: string,
  record: Record<string, unknown> | null,
): number | string | null {
  if (!record) return null
  if (Object.keys(record).length === 0) return null

  const model = processedDMMFModels[modelName]
  if (!model) {
    throw new Error(`Model ${modelName} not found in processed DMMF models`)
  }

  const idFields = model.idFields
  if (!idFields.length) {
    throw new Error(`No ID field found for model ${modelName}`)
  }

  // Singular ID (@id)
  if (idFields.length === 1) {
    const singleKey = idFields[0]

    if (!singleKey) {
      throw new Error(`Model ${modelName} does not have a valid single ID field`)
    }

    const value = record[singleKey]

    if (value == null) {
      throw new Error(`ID field ${singleKey} in model ${modelName} does not have a value`)
    }

    return value as number | string
  }

  // Compound ID (@@id)
  throw new Error(`Model ${modelName} with compound ID not supported`)

  // // create object of the keys and stringify it to represent the unique ID
  // const compoundId: Record<string, any> = {}
  // for (const key of idFields) {
  //   if (record[key] == null) {
  //     throw new Error(`ID field ${key} in model ${modelName} does not have a value`)
  //   }

  //   compoundId[key] = record[key]
  // }

  // return JSON.stringify(compoundId)
}

export { getModelsWithSoftDeleteMap, getRecordId, getProcessedDMMFModels }
