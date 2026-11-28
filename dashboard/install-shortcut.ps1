param(
  [switch]$AlsoStartup
)

$dashDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$vbsPath = Join-Path $dashDir "start-silent.vbs"
$wsh = New-Object -ComObject WScript.Shell

# 1. Desktop shortcut
$desktop = [Environment]::GetFolderPath("Desktop")
if (-not $desktop) { $desktop = Join-Path $env:USERPROFILE "Desktop" }
$desktopLink = Join-Path $desktop "Life Planner.lnk"
$sc = $wsh.CreateShortcut($desktopLink)
$sc.TargetPath = "wscript.exe"
$sc.Arguments = "`"$vbsPath`""
$sc.WorkingDirectory = $dashDir
$sc.Description = "Open Life Planner Local Dashboard (http://127.0.0.1:4310)"
$sc.Save()
Write-Host "Desktop shortcut created: $desktopLink"

# 2. Optional Windows Startup auto-launch (starts hidden server on login without opening browser)
if ($AlsoStartup) {
  $startup = [Environment]::GetFolderPath("Startup")
  if (-not $startup) { $startup = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs\Startup" }
  $startupLink = Join-Path $startup "Life Planner Server.lnk"
  $sc2 = $wsh.CreateShortcut($startupLink)
  $sc2.TargetPath = "powershell.exe"
  $sc2.Arguments = "-NoProfile -WindowStyle Hidden -Command `"Start-Process node -ArgumentList '`"$dashDir\server.js`"' -WorkingDirectory '`"$dashDir`"' -WindowStyle Hidden`""
  $sc2.WorkingDirectory = $dashDir
  $sc2.WindowStyle = 7
  $sc2.Description = "Auto-start Life Planner Dashboard server in background"
  $sc2.Save()
  Write-Host "Startup auto-launch created: $startupLink"
}
