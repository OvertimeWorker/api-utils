/* eslint-disable no-undef */
import fs from "fs"
import path from "path"

const SRC_PATH = "./src"

function generateBarrels(currentDir) {
  const items = fs.readdirSync(currentDir, { withFileTypes: true })
  const exports = []

  for (const item of items) {
    if (item.name === "index.ts" || item.name.startsWith(".")) continue

    if (item.isDirectory()) {
      // Recurse into subfolder first
      generateBarrels(path.join(currentDir, item.name))

      // Export the subfolder's index
      exports.push(`export * from "./${item.name}/index.js"`)
    } else if (item.name.endsWith(".ts")) {
      // Export individual file
      const name = item.name.replace(".ts", "")
      exports.push(`export * from "./${name}.js"`)
    }
  }

  // Generate index.ts if not in the root src directory
  const isRoot = path.resolve(currentDir) === path.resolve(SRC_PATH)

  if (exports.length > 0 && !isRoot) {
    const content = exports.join("\n") + "\n"
    const outputPath = path.join(currentDir, "index.ts")

    fs.writeFileSync(outputPath, content)
    console.log(`✅ Generated: ${outputPath}`)
  }
}

console.log("🚀 Starting barrel generation...")
generateBarrels(SRC_PATH)
