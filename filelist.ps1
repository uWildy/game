# Set your target directory and output file
$targetDir = "C:\Users\emart\OneDrive\Desktop\DEV\code"
$outputFile = "https://raw.githubusercontent.com/uWildy/aiWorkforce/refs/heads/main/FileList.txt"

# Create a recursive file list with full paths and output to text file
Get-ChildItem -Path $targetDir -Recurse -File | Select-Object -ExpandProperty FullName | Out-File -FilePath $outputFile -Encoding UTF8

# Set the text to find and replace
$findText = "https://raw.githubusercontent.com/uWildy/aiWorkforce/refs/heads/main/"
$replaceText = "https://raw.githubusercontent.com/uWildy/aiWorkforce/refs/heads/main/"

# Perform "replace all" in all text-based files in the directory
Get-ChildItem -Path $targetDir -Recurse -File | ForEach-Object {
    try {
        $content = Get-Content $_.FullName -Raw
        if ($content -match [regex]::Escape($findText)) {
            $newContent = $content -replace [regex]::Escape($findText), $replaceText
            $newContent | Set-Content $_.FullName
            Write-Host "Replaced in: $($_.FullName)"
        }
    } catch {
        Write-Warning "Could not process: $($_.FullName)"
    }
}
