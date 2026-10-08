import { build, context } from "esbuild"
import { cp, mkdir } from "node:fs/promises"
await mkdir("dist", { recursive: true })
await cp("public", "dist", { recursive: true })
await cp("index.html", "dist/index.html")
const dev = process.argv.includes("--dev")
const options = {
  entryPoints: ["src/main.jsx"],
  bundle: true,
  outfile: "dist/app.js",
  jsx: "automatic",
  sourcemap: dev,
  minify: !dev,
  define: {
    "process.env.NODE_ENV": JSON.stringify(dev ? "development" : "production"),
  },
  logLevel: "info",
}
if (dev || process.argv.includes("--preview")) {
  const compiler = await context(options)
  if (dev) await compiler.watch()
  else await compiler.rebuild()
  await compiler.serve({
    servedir: "dist",
    host: "0.0.0.0",
    port: Number(process.env.PORT || 8443),
  })
  console.log(
    "Refresh the browser after source changes. Restart for HTML or public asset changes.",
  )
} else await build(options)
