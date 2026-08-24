# start-local-environment.ps1
# Starts local MongoDB, downloads & starts local Redis, and runs the entire SyncStream app!

$workspaceRoot = $pwd
$jdkDir = Join-Path $workspaceRoot "jdk"
$mavenDir = Join-Path $workspaceRoot "maven"
$redisDir = Join-Path $workspaceRoot "redis"
$dbDir = Join-Path $workspaceRoot "data\db"

# 1. Start MongoDB (Port 27017)
if (-not (Test-Path $dbDir)) {
    New-Item -ItemType Directory -Force -Path $dbDir | Out-Null
}
$mongoExe = "C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe"
if (Test-Path $mongoExe) {
    Write-Host "Starting local MongoDB server on port 27017..." -ForegroundColor Cyan
    Start-Process -FilePath $mongoExe -ArgumentList "--dbpath `"$dbDir`"" -WindowStyle Hidden
} else {
    Write-Warning "MongoDB community server not found at standard path C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe!"
}

# 2. Download and start Redis (Port 6379)
if (-not (Test-Path $redisDir)) {
    Write-Host "Redis is missing. Downloading portable Redis v3.0.504..." -ForegroundColor Cyan
    $redisZip = Join-Path $workspaceRoot "redis.zip"
    Invoke-WebRequest -Uri "https://github.com/microsoftarchive/redis/releases/download/win-3.0.504/Redis-x64-3.0.504.zip" -OutFile $redisZip
    Write-Host "Extracting Redis..." -ForegroundColor Cyan
    Expand-Archive -Path $redisZip -DestinationPath $redisDir -Force
    Remove-Item $redisZip -Force
}

Write-Host "Starting local Redis server on port 6379..." -ForegroundColor Cyan
Start-Process -FilePath (Join-Path $redisDir "redis-server.exe") -WindowStyle Hidden

# 3. Bootstrap JDK 21 if missing
if (-not (Test-Path (Join-Path $jdkDir "jdk-21.0.2+13"))) {
    Write-Host "JDK 21 is missing. Downloading portable JDK 21 (Eclipse Temurin)..." -ForegroundColor Cyan
    $jdkZip = Join-Path $workspaceRoot "jdk.zip"
    Invoke-WebRequest -Uri "https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.2%2B13/OpenJDK21U-jdk_x64_windows_hotspot_21.0.2_13.zip" -OutFile $jdkZip
    Write-Host "Extracting JDK 21..." -ForegroundColor Cyan
    Expand-Archive -Path $jdkZip -DestinationPath $jdkDir -Force
    Remove-Item $jdkZip -Force
}

# 4. Bootstrap Maven if missing
if (-not (Test-Path (Join-Path $mavenDir "apache-maven-3.9.6"))) {
    Write-Host "Maven is missing. Downloading portable Maven 3.9.6..." -ForegroundColor Cyan
    $mvnZip = Join-Path $workspaceRoot "maven.zip"
    Invoke-WebRequest -Uri "https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip" -OutFile $mvnZip
    Write-Host "Extracting Maven..." -ForegroundColor Cyan
    Expand-Archive -Path $mvnZip -DestinationPath $mavenDir -Force
    Remove-Item $mvnZip -Force
}

# 5. Set local database environment defaults
$env:PORT = "8080"
$env:MONGODB_URI = "mongodb://localhost:27017/syncstream"
$env:REDIS_HOST = "localhost"
$env:REDIS_PORT = "6379"
$env:REDIS_PASSWORD = ""
$env:JWT_SECRET = "5573796e6353747265616d53757065725365637265744b65793230323623"
$env:JWT_EXPIRATION = "86400000"
$env:FRONTEND_URL = "http://localhost:5173"
$env:SPRING_DATA_MONGODB_URI = $env:MONGODB_URI
$env:SPRING_DATA_REDIS_HOST = $env:REDIS_HOST
$env:SPRING_DATA_REDIS_PORT = $env:REDIS_PORT
$env:SPRING_DATA_REDIS_PASSWORD = $env:REDIS_PASSWORD

# Set Environment paths
$env:JAVA_HOME = Join-Path $jdkDir "jdk-21.0.2+13"
$mvnCmd = Join-Path $mavenDir "apache-maven-3.9.6\bin\mvn.cmd"

# 6. Start the frontend dev server in a new window
Write-Host "Starting Vite frontend dev server on port 5173..." -ForegroundColor Cyan
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal

# 7. Launch spring boot in this terminal
Write-Host "Starting Spring Boot server on port 8080..." -ForegroundColor Green
Set-Location -Path (Join-Path $workspaceRoot "backend")
& $mvnCmd spring-boot:run
