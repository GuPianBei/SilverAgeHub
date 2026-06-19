param(
  [int]$Port = 0
)

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$cli = 'C:\Program Files (x86)\Tencent\微信web开发者工具\cli.bat'
$node = 'C:\Users\yjt\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
$envId = 'cloud1-d0g5eg4kxeed0d74d'

if (-not (Test-Path -LiteralPath $cli)) {
  throw "WeChat DevTools CLI not found: $cli"
}

if (-not (Test-Path -LiteralPath $node)) {
  throw "Node.js not found: $node"
}

& $node (Join-Path $PSScriptRoot 'verify-stable-architecture.js')
if ($LASTEXITCODE -ne 0) {
  throw 'Local stable architecture verification failed.'
}

$common = @(
  '--project', $projectRoot,
  '--lang', 'zh'
)

if ($Port -gt 0) {
  $common += @('--port', $Port)
}

Write-Host 'Listing cloud functions before deployment...'
& $cli cloud functions list --env $envId @common
if ($LASTEXITCODE -ne 0) {
  throw 'Cannot connect to the WeChat DevTools CLI service. Enable the service port and retry.'
}

Write-Host 'Deploying userApi and adminApi with remote npm install...'
& $cli cloud functions deploy `
  --env $envId `
  --names userApi adminApi `
  --remote-npm-install `
  @common

if ($LASTEXITCODE -ne 0) {
  throw 'Cloud function deployment failed. Check the CLI output above.'
}

Write-Host 'Listing cloud functions after deployment...'
& $cli cloud functions list --env $envId @common
if ($LASTEXITCODE -ne 0) {
  throw 'Post-deployment cloud function verification failed.'
}

Write-Host 'Stable cloud function deployment completed.'
