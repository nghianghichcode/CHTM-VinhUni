# Device Scan (Windows) - outputs JSON to clipboard and console
$cpu = (Get-CimInstance Win32_Processor | Select-Object -First 1 -ExpandProperty Name)
$ramBytes = (Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory
$os = (Get-CimInstance Win32_OperatingSystem).Caption
$storageBytes = (Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" | Measure-Object -Property Size -Sum).Sum

$profile = [pscustomobject]@{
  os = $os
  cpu = $cpu
  ramGB = [math]::Round($ramBytes / 1GB, 1)
  storageGB = [math]::Round($storageBytes / 1GB, 0)
}

$json = $profile | ConvertTo-Json -Compress
try {
  Set-Clipboard -Value $json
} catch {
  # Clipboard not available, continue
}

Write-Output $json
