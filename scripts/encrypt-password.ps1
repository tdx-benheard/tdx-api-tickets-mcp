# TeamDynamix MCP Server - Password Encryption Tool
# Encrypts passwords using Windows DPAPI for secure storage

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host " TeamDynamix MCP - Password Encryption Tool" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This tool encrypts your TeamDynamix password using Windows DPAPI."
Write-Host "The encrypted password can only be decrypted by your Windows user account."
Write-Host ""

# Get password securely
$SecurePassword = Read-Host "Enter your TeamDynamix password" -AsSecureString

# Convert SecureString to plain text temporarily for DPAPI encryption
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecurePassword)
$PlainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)

try {
    # Encrypt using DPAPI
    Add-Type -AssemblyName System.Security
    $EncryptedBytes = [Security.Cryptography.ProtectedData]::Protect(
        [Text.Encoding]::UTF8.GetBytes($PlainPassword),
        $null,
        'CurrentUser'
    )
    $EncryptedBase64 = [Convert]::ToBase64String($EncryptedBytes)
    $DpapiPassword = "dpapi:$EncryptedBase64"

    # Clear plain password from memory
    $PlainPassword = $null
    [System.GC]::Collect()

    Write-Host ""
    Write-Host "✓ Password encrypted successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Encrypted password (use this in your credentials file):" -ForegroundColor Yellow
    Write-Host ""
    Write-Host $DpapiPassword -ForegroundColor White
    Write-Host ""
    Write-Host "Copy this value to your credentials JSON file:" -ForegroundColor Cyan
    Write-Host '  "TDX_PASSWORD": "' -NoNewline -ForegroundColor Gray
    Write-Host $DpapiPassword -NoNewline -ForegroundColor White
    Write-Host '"' -ForegroundColor Gray
    Write-Host ""

    # Optionally copy to clipboard
    $CopyChoice = Read-Host "Copy to clipboard? (y/N)"
    if ($CopyChoice -eq 'y' -or $CopyChoice -eq 'Y') {
        Set-Clipboard -Value $DpapiPassword
        Write-Host "✓ Copied to clipboard" -ForegroundColor Green
    }

} catch {
    Write-Host ""
    Write-Host "✗ Encryption failed: $_" -ForegroundColor Red
    Write-Host ""
    exit 1
} finally {
    # Ensure password is cleared from memory
    $PlainPassword = $null
    $SecurePassword = $null
    [System.GC]::Collect()
}

Write-Host ""
Write-Host "Security Notes:" -ForegroundColor Yellow
Write-Host "  • This encrypted password only works on this Windows user account"
Write-Host "  • It cannot be decrypted by other users or on other computers"
Write-Host "  • Store the credentials file securely (outside version control)"
Write-Host ""
