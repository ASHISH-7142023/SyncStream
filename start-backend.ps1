# start-backend.ps1
# SyncStream NATIVE Backend Launcher & Bootstrapper

$workspaceRoot = $pwd
$jdkDir = Join-Path $workspaceRoot "jdk"
$mavenDir = Join-Path $workspaceRoot "maven"

# 1. Bootstrap JDK 21 if missing
if (-not (Test-Path (Join-Path $jdkDir "jdk-21.0.2+13"))) {
    Write-Host "JDK 21 is missing. Downloading portable JDK 21 (Eclipse Temurin)..." -ForegroundColor Cyan
    $jdkZip = Join-Path $workspaceRoot "jdk.zip"
    Invoke-WebRequest -Uri "https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.2%2B13/OpenJDK21U-jdk_x64_windows_hotspot_21.0.2_13.zip" -OutFile $jdkZip
    Write-Host "Extracting JDK 21..." -ForegroundColor Cyan
    Expand-Archive -Path $jdkZip -DestinationPath $jdkDir -Force
    Remove-Item $jdkZip -Force
    Write-Host "JDK 21 Setup Completed." -ForegroundColor Green
}

# 2. Bootstrap Maven if missing
if (-not (Test-Path (Join-Path $mavenDir "apache-maven-3.9.6"))) {
    Write-Host "Maven is missing. Downloading portable Maven 3.9.6..." -ForegroundColor Cyan
    $mvnZip = Join-Path $workspaceRoot "maven.zip"
    Invoke-WebRequest -Uri "https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip" -OutFile $mvnZip
    Write-Host "Extracting Maven..." -ForegroundColor Cyan
    Expand-Archive -Path $mvnZip -DestinationPath $mavenDir -Force
    Remove-Item $mvnZip -Force
    Write-Host "Maven Setup Completed." -ForegroundColor Green
}

# 3. Read .env credentials
$envFile = Join-Path $workspaceRoot ".env"
if (-not (Test-Path $envFile)) {
    $envFile = Join-Path $workspaceRoot "frontend\.env"
}

if (Test-Path $envFile) {
    Write-Host "Loading environment configurations from $envFile..." -ForegroundColor Yellow
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $key, $value = $line.Split("=", 2)
            $key = $key.Trim()
            $value = $value.Trim()
            # Remove surrounding quotes if present
            if ($value.StartsWith('"') -and $value.EndsWith('"')) {
                $value = $value.Substring(1, $value.Length - 2)
            } elseif ($value.StartsWith("'") -and $value.EndsWith("'")) {
                $value = $value.Substring(1, $value.Length - 2)
            }
            Set-Item -Path "Env:\$key" -Value $value
            # Map standard Spring keys
            if ($key -eq "MONGODB_URI") { $env:SPRING_DATA_MONGODB_URI = $value }
            if ($key -eq "REDIS_HOST") { $env:SPRING_DATA_REDIS_HOST = $value }
            if ($key -eq "REDIS_PORT") { $env:SPRING_DATA_REDIS_PORT = $value }
            if ($key -eq "REDIS_PASSWORD") { $env:SPRING_DATA_REDIS_PASSWORD = $value }
        }
    }
} else {
    Write-Warning "No .env file found! Please create a .env file containing your MongoDB and Redis cloud URIs."
}

# 4. Set Environment paths
$env:JAVA_HOME = Join-Path $jdkDir "jdk-21.0.2+13"
$mvnCmd = Join-Path $mavenDir "apache-maven-3.9.6\bin\mvn.cmd"

# 5. Launch spring boot
Set-Location -Path (Join-Path $workspaceRoot "backend")
Write-Host "Starting Spring Boot server on port $env:PORT..." -ForegroundColor Green
& $mvnCmd spring-boot:run
