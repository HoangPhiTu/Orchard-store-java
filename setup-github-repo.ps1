# =============================================================================
# Script PowerShell - Setup GitHub Repository Lần Đầu
# =============================================================================
# Sử dụng: .\setup-github-repo.ps1
# =============================================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubUsername,
    
    [Parameter(Mandatory=$true)]
    [string]$RepositoryName,
    
    [string]$Description = "Orchard Store E-Commerce Platform",
    [string]$Visibility = "private"
)

Write-Host "`n[SETUP] Setup GitHub Repository`n" -ForegroundColor Cyan

# =============================================================================
# Step 1: Kiểm tra Git
# =============================================================================
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Git chua duoc cai dat!" -ForegroundColor Red
    exit 1
}

# =============================================================================
# Step 2: Khởi tạo Git Repository (nếu chưa có)
# =============================================================================
if (-not (Test-Path ".git")) {
    Write-Host "[INFO] Dang khoi tao Git repository..." -ForegroundColor Cyan
    git init
    Write-Host "[OK] Da khoi tao Git repository`n" -ForegroundColor Green
}

# =============================================================================
# Step 3: Kiểm tra Git Config
# =============================================================================
$gitUserName = git config user.name
$gitUserEmail = git config user.email

if (-not $gitUserName -or -not $gitUserEmail) {
    Write-Host "[WARNING] Git config chua duoc thiet lap!`n" -ForegroundColor Yellow
    $name = Read-Host "Nhập tên của bạn"
    $email = Read-Host "Nhập email của bạn"
    
    git config user.name $name
    git config user.email $email
    Write-Host "[OK] Da cau hinh Git config`n" -ForegroundColor Green
} else {
    Write-Host "[OK] Git User: $gitUserName <$gitUserEmail>`n" -ForegroundColor Green
}

# =============================================================================
# Step 4: Add Remote
# =============================================================================
$remoteUrl = "https://github.com/$GitHubUsername/$RepositoryName.git"

# Kiểm tra remote đã tồn tại chưa
$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
    Write-Host "[WARNING] Remote 'origin' da ton tai: $existingRemote" -ForegroundColor Yellow
    $replace = Read-Host "Bạn có muốn thay thế? (Y/N)"
    if ($replace -eq "Y" -or $replace -eq "y") {
        git remote remove origin
        git remote add origin $remoteUrl
        Write-Host "[OK] Da cap nhat remote: $remoteUrl`n" -ForegroundColor Green
    } else {
        Write-Host "Giu nguyen remote hien tai.`n" -ForegroundColor Cyan
    }
} else {
    git remote add origin $remoteUrl
    Write-Host "[OK] Da them remote: $remoteUrl`n" -ForegroundColor Green
}

# =============================================================================
# Step 5: Kiểm tra .gitignore
# =============================================================================
Write-Host "[INFO] Dang kiem tra .gitignore..." -ForegroundColor Cyan

$propsFile = "orchard-store-backend/src/main/resources/application.properties"
$isIgnored = git check-ignore -v $propsFile 2>$null

if (-not $isIgnored) {
    Write-Host "[WARNING] CANH BAO: application.properties co the bi commit!" -ForegroundColor Red
    Write-Host "File nay chua credentials va KHONG NEN duoc commit!`n" -ForegroundColor Red
} else {
    Write-Host "[OK] application.properties da duoc ignore`n" -ForegroundColor Green
}

# =============================================================================
# Step 6: Hướng Dẫn Tạo Repository Trên GitHub
# =============================================================================
Write-Host "[INFO] BUOC TIEP THEO:" -ForegroundColor Cyan
Write-Host "1. Tao repository tren GitHub:" -ForegroundColor White
Write-Host "   URL: https://github.com/new" -ForegroundColor Gray
Write-Host "   Repository name: $RepositoryName" -ForegroundColor Gray
Write-Host "   Description: $Description" -ForegroundColor Gray
Write-Host "   Visibility: $Visibility" -ForegroundColor Gray
Write-Host "   [WARNING] KHONG tich 'Initialize with README'`n" -ForegroundColor Yellow

Write-Host "2. Sau khi tao repository, chay:" -ForegroundColor White
Write-Host "   .\push-to-github.ps1" -ForegroundColor Green
Write-Host "   hoac" -ForegroundColor White
Write-Host "   .\push-to-github-simple.ps1`n" -ForegroundColor Green

Write-Host "3. Hoac chay lenh thu cong:" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Gray
Write-Host "   git commit -m 'Initial commit'" -ForegroundColor Gray
Write-Host "   git branch -M main" -ForegroundColor Gray
Write-Host "   git push -u origin main`n" -ForegroundColor Gray

Write-Host "[OK] Setup hoan tat!`n" -ForegroundColor Green

