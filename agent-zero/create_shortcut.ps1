$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$([Environment]::GetFolderPath('Desktop'))\Sasha.lnk")
$Shortcut.TargetPath = "C:\mport-media-group\agent-zero\agent_gui.py"
$Shortcut.IconLocation = "C:\mport-media-group\agent-zero\Logo.ico"
$Shortcut.WorkingDirectory = "C:\mport-media-group\agent-zero"
$Shortcut.Description = "Sasha - Meta Agent Interface"
$Shortcut.Save() 