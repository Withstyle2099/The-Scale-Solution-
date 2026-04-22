Attribute VB_Name = "modUI"
Option Explicit

Public Sub ShowReminderForm()
    On Error GoTo EH
    frmReminder.Show
    Exit Sub
EH:
    MsgBox "UserForm frmReminder is not installed yet. Please create it and paste the provided code.", vbExclamation
End Sub
