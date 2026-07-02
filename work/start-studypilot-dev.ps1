$ErrorActionPreference = "Stop"
Set-Location "C:\Users\hlj2498\Documents\Codex\2026-06-26\figma-plugin-figma-openai-curated-remote"
$env:Path = "C:\Users\hlj2498\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;" + $env:Path
& ".\node_modules\.bin\next.CMD" dev -p 3000
