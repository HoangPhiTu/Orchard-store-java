# =============================================================================
# Script PowerShell Đơn Giản - Push Code Lên GitHub
# =============================================================================
# Sử dụng: .\push-to-github-simple.ps1
# =============================================================================

Write-Host "`n🚀 Push Code Lên GitHub - Script Đơn Giản`n" -ForegroundColor Cyan

# Kiểm tra Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git chưa được cài đặt!" -ForegroundColor Red
    exit 1
}

# Kiểm tra remote
$remoteUrl = git remote get-url origin 2>$null

if (-not $remoteUrl) {
    Write-Host "⚠️  Chưa có remote repository!`n" -ForegroundColor Yellow
    
    $username = Read-Host "Nhập GitHub Username"
    $repo = Read-Host "Nhập Repository Name"
    
    if (-not $username -or -not $repo) {
        Write-Host "❌ Username và Repository Name là bắt buộc!" -ForegroundColor Red
        exit 1
    }
    
    $remoteUrl = "https://github.com/$username/$repo.git"
    git remote add origin $remoteUrl
    Write-Host "✅ Đã thêm remote: $remoteUrl`n" -ForegroundColor Green
}

# Kiểm tra thay đổi
$status = git status --short
if (-not $status) {
    Write-Host "✅ Không có thay đổi nào!`n" -ForegroundColor Green
    exit 0
}

# Hiển thị thay đổi
Write-Host "📋 Files sẽ được commit:" -ForegroundColor Cyan
git status --short

# Commit message
$message = Read-Host "`nNhập commit message"
if (-not $message) {
    $message = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

# Thực hiện
Write-Host "`n📦 Đang add files..." -ForegroundColor Cyan
git add .

Write-Host "💾 Đang commit..." -ForegroundColor Cyan
git commit -m $message

Write-Host "🚀 Đang push..." -ForegroundColor Cyan
$branch = git branch --show-current
if (-not $branch) {
    git branch -M main
    $branch = "main"
}

git push -u origin $branch

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Đã push thành công!`n" -ForegroundColor Green
} else {
    Write-Host "`n❌ Push thất bại! Vui lòng kiểm tra lại.`n" -ForegroundColor Red
}

