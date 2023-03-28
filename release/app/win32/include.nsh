!macro customInstall
  WriteRegStr HKCR "*\shell\PowerRenameExt" "" "Open with ${PRODUCT_NAME}"
  WriteRegStr HKCR "*\shell\PowerRenameExt" "Icon" "$appExe"
  WriteRegStr HKCR "*\shell\PowerRenameExt\Command" "" '"$appExe" "%1"'
  WriteRegStr HKCR "Directory\shell\PowerRenameExt" "" "Open with ${PRODUCT_NAME}"
  WriteRegStr HKCR "Directory\shell\PowerRenameExt" "Icon" "$appExe"
  WriteRegStr HKCR "Directory\shell\PowerRenameExt\Command" "" '"$appExe" "%1"'
!macroend

!macro customUnInstall
  DeleteRegKey HKCR "*\shell\PowerRenameExt"
  DeleteRegKey HKCR "Directory\shell\PowerRenameExt"
!macroend
