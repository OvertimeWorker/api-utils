import type { Express, IRouter } from "express"
import pc from "picocolors"
import Table from "cli-table3"

const DiscoveredPaths: { method: string; fullPath: string }[] = []

function analyzeExpressPaths(router: IRouter, parentPath = "") {
  for (const layer of router.stack) {
    if (layer.name === "handle" && layer.route) {
      const fullPath = `${parentPath}${layer.route.path}`
      const path = {
        fullPath,
        method: "unknown",
      }
      const numHandlers = layer.route.stack.length
      // Iterate over the RequestHandlers
      for (let index = 0; index < numHandlers; index += 1) {
        const middleware = layer.route.stack[index] as IRouter["stack"][0]

        // The last argument will be the route handler
        if (index >= numHandlers - 1) {
          path.method = middleware.method.toUpperCase()
        }
      }

      DiscoveredPaths.push(path)

      // Recursively call until all routers are covered.
    } else if (layer.name === "router" && typeof layer.handle === "function") {
      analyzeExpressPaths(layer.handle as IRouter, parentPath)
    }
  }
}

function initDiscoverPath(app: Express) {
  const originalUse: typeof app.use = app.use.bind(app)

  // Monkey patch app.use function
  app.use = function (...args: Parameters<typeof app.use>) {
    if (typeof args[0] === "string") {
      const basePath = args[0]
      // Iterate over the remaining objects to find the router function
      for (let i = 1; i < args.length; i += 1) {
        const arg = args[i]

        if (typeof arg === "function" && arg.name === "router" && basePath) {
          // arg is the router function
          analyzeExpressPaths(arg, basePath)
        }
      }
    }

    originalUse(...args)
  } as typeof app.use

  const verbs = ["get", "post", "put", "delete", "patch", "options", "head"] as const
  type HttpVerb = (typeof verbs)[number]

  // Monkey patch app[method] functions
  verbs.forEach((method) => {
    const originalMethod = app[method].bind(app)

    app[method] = function (...args: Parameters<(typeof app)[HttpVerb]>) {
      if (typeof args[0] === "string") {
        const basePath = args[0]

        DiscoveredPaths.push({
          method: method.toUpperCase(),
          fullPath: basePath,
        })
      }

      return originalMethod(...args)
    } as (typeof app)[HttpVerb]
  })
}

// Highlights HTTP methods with different colors for better visibility
function formatMethod(method: string): string {
  const m = method.toUpperCase()
  if (m.includes("GET")) return pc.green(m)
  if (m.includes("POST")) return pc.blue(m)
  if (m.includes("PUT") || m.includes("PATCH")) return pc.yellow(m)
  if (m.includes("DELETE")) return pc.red(m)
  return pc.magenta(m)
}

// Highlights Express path parameters (e.g., :id) in Cyan
function formatPath(path: string): string {
  // Regex looks for a colon followed by word characters
  return path.replace(/(:\w+)/g, (match) => pc.cyan(match))
}

function displayDiscoveryTable() {
  const table = new Table({
    head: [pc.gray("Method"), pc.gray("Endpoint Path")],
    style: {
      head: [], // Disables the default red header text
      border: ["gray"], // Subtle borders
    },
  })

  DiscoveredPaths.forEach((route) => {
    table.push([formatMethod(route.method), formatPath(route.fullPath)])
  })

  // eslint-disable-next-line no-console
  console.log(table.toString())
}

export { displayDiscoveryTable, initDiscoverPath }
