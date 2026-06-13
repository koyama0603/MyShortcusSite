# Generates Japanese narration WAVs (n0..n7) into reel/audio/.
# Run under Windows PowerShell 5.1 for WinRT voices:
#   powershell.exe -NoProfile -File tts.ps1
# Primary: WinRT SpeechSynthesizer (natural voice: Sayaka -> Ayumi -> Nanami).
# Fallback: System.Speech (Microsoft Haruka Desktop, SAPI5).
# Narration text is read from narration.txt as UTF-8 (keeps this script ASCII-safe).

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$outDir = Join-Path $here 'audio'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$lines = [System.IO.File]::ReadAllLines((Join-Path $here 'narration.txt'), [System.Text.Encoding]::UTF8) |
  Where-Object { $_.Trim().Length -gt 0 }

function Save-WinRT {
  param([string[]]$Texts, [string]$OutDir)
  Add-Type -AssemblyName System.Runtime.WindowsRuntime | Out-Null
  $null = [Windows.Media.SpeechSynthesis.SpeechSynthesizer, Windows.Media, ContentType = WindowsRuntime]
  $null = [Windows.Storage.Streams.DataReader, Windows.Storage.Streams, ContentType = WindowsRuntime]

  $asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() |
    Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and
      $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]
  function Await($op, $t) {
    $m = $asTaskGeneric.MakeGenericMethod($t)
    $task = $m.Invoke($null, @($op))
    $task.Wait(-1) | Out-Null
    $task.Result
  }

  $synth = [Windows.Media.SpeechSynthesis.SpeechSynthesizer]::new()
  $voices = [Windows.Media.SpeechSynthesis.SpeechSynthesizer]::AllVoices
  $pick = $null
  foreach ($name in @('Sayaka', 'Ayumi', 'Nanami', 'Haruka')) {
    $pick = $voices | Where-Object { $_.DisplayName -match $name } | Select-Object -First 1
    if ($pick) { break }
  }
  if (-not $pick) { $pick = $voices | Where-Object { $_.Language -like 'ja*' } | Select-Object -First 1 }
  if (-not $pick) { throw 'No Japanese WinRT voice found' }
  $synth.Voice = $pick
  Write-Output ("WinRT voice: " + $pick.DisplayName)

  $streamType = [Windows.Media.SpeechSynthesis.SpeechSynthesisStream]
  for ($i = 0; $i -lt $Texts.Count; $i++) {
    $stream = Await ($synth.SynthesizeTextToStreamAsync($Texts[$i])) $streamType
    $size = [uint32]$stream.Size
    $reader = [Windows.Storage.Streams.DataReader]::new($stream.GetInputStreamAt(0))
    Await ($reader.LoadAsync($size)) ([uint32]) | Out-Null
    $bytes = New-Object byte[] $size
    $reader.ReadBytes($bytes)
    $reader.Dispose()
    $p = Join-Path $OutDir ("n{0}.wav" -f $i)
    [System.IO.File]::WriteAllBytes($p, $bytes)
    Write-Output ("  n{0}.wav  {1} bytes" -f $i, $size)
  }
}

function Save-Sapi {
  param([string[]]$Texts, [string]$OutDir)
  Add-Type -AssemblyName System.Speech
  $s = New-Object System.Speech.Synthesis.SpeechSynthesizer
  try { $s.SelectVoice('Microsoft Haruka Desktop') } catch { }
  $s.Rate = -1
  Write-Output ("SAPI voice: " + $s.Voice.Name)
  for ($i = 0; $i -lt $Texts.Count; $i++) {
    $p = Join-Path $OutDir ("n{0}.wav" -f $i)
    $s.SetOutputToWaveFile($p)
    $s.Speak($Texts[$i])
    Write-Output ("  n{0}.wav written" -f $i)
  }
  $s.Dispose()
}

try {
  Save-WinRT -Texts $lines -OutDir $outDir
  Write-Output 'Narration: WinRT OK'
} catch {
  Write-Output ("WinRT failed (" + $_.Exception.Message + "); falling back to SAPI.")
  Save-Sapi -Texts $lines -OutDir $outDir
  Write-Output 'Narration: SAPI fallback OK'
}
