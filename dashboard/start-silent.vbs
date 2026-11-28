Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")
dir = fso.GetParentFolderName(WScript.ScriptFullName)

' Start Node server hidden only if port 4310 is not already listening
checkCmd = "powershell -NoProfile -WindowStyle Hidden -Command ""try { $c = New-Object System.Net.Sockets.TcpClient('127.0.0.1', 4310); $c.Close(); exit 0 } catch { exit 1 }"""
isRunning = shell.Run(checkCmd, 0, True)

If isRunning <> 0 Then
  shell.CurrentDirectory = dir
  shell.Run "node """ & dir & "\server.js""", 0, False
  WScript.Sleep 700
End If

shell.Run "http://127.0.0.1:4310", 1, False
