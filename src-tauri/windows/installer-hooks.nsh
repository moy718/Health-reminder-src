!macro NSIS_HOOK_PREUNINSTALL
  ; 卸载应用时一并清理每天 08:00 的自动启动任务。
  nsExec::ExecToLog 'schtasks.exe /Delete /TN "HealthReminder-Daily-8AM" /F'
!macroend
