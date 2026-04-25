#!/usr/bin/env node
import helper from '@prisma/generator-helper'
import fs from 'node:fs'
import path from 'node:path'

helper.generatorHandler({
  onManifest() {
    return {
      prettyName: 'Prisma Models Metadata',
      defaultOutput: 'generated',
    }
  },
  async onGenerate(options) {
    const models = options.dmmf.datamodel.models

    const outputDir = options.generator.output.value

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const targetPath = path.join(outputDir, 'index.js')
    const declarationPath = path.join(outputDir, 'index.d.ts')

    const jsContent = `export const prismaModelsMetadata = ${JSON.stringify(models, null, 2)}\n`
    const dtsContent = `export declare const prismaModelsMetadata: ${JSON.stringify(models, null, 2)}\n`

    fs.writeFileSync(targetPath, jsContent)
    fs.writeFileSync(declarationPath, dtsContent)
  },
})
