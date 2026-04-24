param(
    [int]$Port = 8765,
    [string]$HostName = "127.0.0.1",
    [string]$Browser = "",
    [switch]$NoOpen
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Url = "http://$HostName`:$Port/index.html"

function Test-PortOpen {
    param([string]$HostName, [int]$Port)
    $Client = New-Object System.Net.Sockets.TcpClient
    try {
        $Connect = $Client.BeginConnect($HostName, $Port, $null, $null)
        if (-not $Connect.AsyncWaitHandle.WaitOne(250, $false)) {
            return $false
        }
        $Client.EndConnect($Connect)
        return $true
    } catch {
        return $false
    } finally {
        $Client.Close()
    }
}

if (Test-PortOpen -HostName $HostName -Port $Port) {
    Write-Host "Port $Port already has a server. Opening $Url"
    if (-not $NoOpen) {
        if ($Browser) {
            Start-Process $Browser $Url
        } else {
            Start-Process $Url
        }
    }
    exit 0
}

$Python = Get-Command python -ErrorAction SilentlyContinue
if (-not $Python) {
    $Python = Get-Command py -ErrorAction SilentlyContinue
}
if (-not $Python) {
    throw "Python was not found on PATH."
}

$ArgsList = @("$Root\launch_game.py", "--port", "$Port", "--host", "$HostName")
if ($NoOpen) {
    $ArgsList += "--no-open"
}
if ($Browser) {
    $ArgsList += @("--browser", $Browser)
}

& $Python.Source @ArgsList
