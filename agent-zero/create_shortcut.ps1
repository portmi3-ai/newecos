$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$([Environment]::GetFolderPath('Desktop'))\Sasha.lnk")
$Shortcut.TargetPath = "D:\.aGITHUB REPO\Queen\agent_gui.py"
$Shortcut.IconLocation = "D:\.aGITHUB REPO\Queen\Logo.ico"
$Shortcut.WorkingDirectory = "D:\.aGITHUB REPO\Queen"
$Shortcut.Description = "Sasha - Meta Agent Interface"
$Shortcut.Save() 
