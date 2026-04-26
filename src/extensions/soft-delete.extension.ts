import { type Config, createSoftDeleteExtension } from "@candoimage/prisma-extension-soft-delete"
import type { DMMF } from "@prisma/client/runtime/client"
import { getModelsWithSoftDeleteMap } from "~/utils/extension.utils.js"

function getSoftDeleteExtension(dmmfModels: DMMF.Model[], config?: Config) {
  const configHasModels = Object.keys(config?.models ?? {}).length > 0

  let models = config?.models ?? {}
  if (!configHasModels) {
    models = getModelsWithSoftDeleteMap(dmmfModels)
  }

  if (config == null) {
    config = {
      models,
      defaultConfig: {
        field: "deletedAt",
        createValue: (deleted) => {
          if (deleted) return new Date()
          return null
        },
        allowToOneUpdates: true,
        allowCompoundUniqueIndexWhere: true,
      },
    }
  }

  return createSoftDeleteExtension(config)
}

export { getSoftDeleteExtension }
