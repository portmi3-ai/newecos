$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$([Environment]::GetFolderPath('Desktop'))\Agent Zero.lnk")
$Shortcut.TargetPath = "D:\.aGITHUB REPO\mport-media-group\agent-zero\run_ai_agent.bat"
$Shortcut.IconLocation = "D:\.aGITHUB REPO\mport-media-group\agent-zero\icon.ico"
$Shortcut.WorkingDirectory = "D:\.aGITHUB REPO\mport-media-group\agent-zero"
$Shortcut.Save() 