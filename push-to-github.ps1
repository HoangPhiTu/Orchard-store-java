# =============================================================================
# Script PowerShell - Tự Động Push Code Lên GitHub
# =============================================================================
# Sử dụng: .\push-to-github.ps1
# =============================================================================

param(
    [string]$GitHubUsername = "",
    [string]$RepositoryName = "",
    [string]$CommitMessage = "",
    [switch]$SkipConfirmation = $false
)

# Colors for output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success { Write-ColorOutput Green $args }
function Write-Error { Write-ColorOutput Red $args }
function Write-Info { Write-ColorOutput Cyan $args }
function Write-Warning { Write-ColorOutput Yellow $args }

# =============================================================================
# Step 1: Kiểm tra Git
# =============================================================================
Write-Info "`n🔍 Đang kiểm tra Git..."

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "❌ Git chưa được cài đặt hoặc chưa có trong PATH!"
    Write-Info "Vui lòng cài đặt Git từ: https://git-scm.com/downloads"
    exit 1
}

$gitVersion = git --version
Write-Success "✅ $gitVersion"

# Kiểm tra xem đã là git repository chưa
if (-not (Test-Path ".git")) {
    Write-Error "❌ Thư mục hiện tại chưa phải là Git repository!"
    Write-Info "Đang khởi tạo Git repository..."
    git init
    if ($LASTEXITCODE -ne 0) {
        Write-Error "❌ Không thể khởi tạo Git repository!"
        exit 1
    }
    Write-Success "✅ Đã khởi tạo Git repository"
}

# =============================================================================
# Step 2: Kiểm tra Git Config
# =============================================================================
Write-Info "`n🔍 Đang kiểm tra Git config..."

$gitUserName = git config user.name
$gitUserEmail = git config user.email

if (-not $gitUserName -or -not $gitUserEmail) {
    Write-Warning "⚠️  Git user.name hoặc user.email chưa được cấu hình!"
    Write-Info "Vui lòng cấu hình:"
    Write-Info "  git config --global user.name 'Your Name'"
    Write-Info "  git config --global user.email 'your.email@example.com'"
    exit 1
}

Write-Success "✅ Git User: $gitUserName <$gitUserEmail>"

# =============================================================================
# Step 3: Kiểm tra Remote
# =============================================================================
Write-Info "`n🔍 Đang kiểm tra remote repository..."

$remoteUrl = git remote get-url origin 2>$null

if (-not $remoteUrl) {
    Write-Warning "⚠️  Chưa có remote 'origin'!"
    
    # Hỏi thông tin GitHub
    if (-not $GitHubUsername) {
        $GitHubUsername = Read-Host "Nhập GitHub Username"
    }
    
    if (-not $RepositoryName) {
        $RepositoryName = Read-Host "Nhập Repository Name"
    }
    
    if (-not $GitHubUsername -or -not $RepositoryName) {
        Write-Error "❌ Username và Repository Name là bắt buộc!"
        exit 1
    }
    
    $remoteUrl = "https://github.com/$GitHubUsername/$RepositoryName.git"
    Write-Info "Đang thêm remote: $remoteUrl"
    
    git remote add origin $remoteUrl
    if ($LASTEXITCODE -ne 0) {
        Write-Error "❌ Không thể thêm remote!"
        exit 1
    }
    
    Write-Success "✅ Đã thêm remote: $remoteUrl"
} else {
    Write-Success "✅ Remote đã tồn tại: $remoteUrl"
    
    # Extract username và repo từ URL
    if ($remoteUrl -match "github\.com[:/]([^/]+)/([^/]+?)(?:\.git)?$") {
        $GitHubUsername = $matches[1]
        $RepositoryName = $matches[2] -replace '\.git$', ''
    }
}

# =============================================================================
# Step 4: Kiểm tra Files Cần Commit
# =============================================================================
Write-Info "`n🔍 Đang kiểm tra files cần commit..."

git status --short | Out-Null
$statusOutput = git status --short

if (-not $statusOutput) {
    Write-Warning "⚠️  Không có thay đổi nào để commit!"
    Write-Info "Repository đã up-to-date."
    exit 0
}

Write-Info "Các files sẽ được commit:"
git status --short | ForEach-Object {
    $status = $_.Substring(0, 2)
    $file = $_.Substring(3)
    if ($status -match "^A") {
        Write-Success "  [+] $file"
    } elseif ($status -match "^M") {
        Write-Info "  [M] $file"
    } elseif ($status -match "^D") {
        Write-Warning "  [D] $file"
    } else {
        Write-Info "  [?] $file"
    }
}

# Kiểm tra application.properties có bị commit không
$checkProps = git status --short | Select-String "application.properties$"
if ($checkProps -and $checkProps -notmatch "application.properties.example") {
    Write-Error "`n❌ CẢNH BÁO: application.properties có thể bị commit!"
    Write-Error "File này chứa credentials và KHÔNG NÊN được commit!"
    Write-Info "Đang kiểm tra .gitignore..."
    
    $isIgnored = git check-ignore -v "orchard-store-backend/src/main/resources/application.properties"
    if (-not $isIgnored) {
        Write-Error "❌ application.properties KHÔNG được ignore!"
        Write-Error "Vui lòng kiểm tra lại .gitignore trước khi tiếp tục!"
        exit 1
    }
}

# =============================================================================
# Step 5: Xác Nhận
# =============================================================================
if (-not $SkipConfirmation) {
    Write-Info "`n📋 Tóm tắt:"
    Write-Info "  Repository: $remoteUrl"
    Write-Info "  User: $gitUserName <$gitUserEmail>"
    Write-Info "  Files: $(($statusOutput | Measure-Object -Line).Lines) files"
    
    $confirm = Read-Host "`nBạn có muốn tiếp tục? (Y/N)"
    if ($confirm -ne "Y" -and $confirm -ne "y") {
        Write-Info "Đã hủy."
        exit 0
    }
}

# =============================================================================
# Step 6: Add Files
# =============================================================================
Write-Info "`n📦 Đang add files..."

git add .
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Không thể add files!"
    exit 1
}

Write-Success "✅ Đã add files"

# =============================================================================
# Step 7: Commit
# =============================================================================
Write-Info "`n💾 Đang commit..."

if (-not $CommitMessage) {
    $defaultMessage = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    $CommitMessage = Read-Host "Nhập commit message (Enter để dùng: $defaultMessage)"
    if (-not $CommitMessage) {
        $CommitMessage = $defaultMessage
    }
}

git commit -m $CommitMessage
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Không thể commit!"
    Write-Info "Có thể không có thay đổi nào hoặc commit message trống."
    exit 1
}

Write-Success "✅ Đã commit: $CommitMessage"

# =============================================================================
# Step 8: Push
# =============================================================================
Write-Info "`n🚀 Đang push lên GitHub..."

# Kiểm tra branch hiện tại
$currentBranch = git branch --show-current
if (-not $currentBranch) {
    Write-Info "Đang tạo branch 'main'..."
    git branch -M main
    $currentBranch = "main"
}

Write-Info "Branch: $currentBranch"

# Push
git push -u origin $currentBranch
if ($LASTEXITCODE -ne 0) {
    Write-Error "`n❌ Push thất bại!"
    Write-Info "`nCó thể do:"
    Write-Info "  1. Chưa authenticate với GitHub"
    Write-Info "  2. Cần sử dụng Personal Access Token thay vì password"
    Write-Info "  3. Repository chưa tồn tại trên GitHub"
    Write-Info "`nHướng dẫn:"
    Write-Info "  - Tạo Personal Access Token: https://github.com/settings/tokens"
    Write-Info "  - Dùng token này khi hỏi password"
    Write-Info "  - Hoặc setup SSH keys: https://docs.github.com/en/authentication/connecting-to-github-with-ssh"
    exit 1
}

Write-Success "`n✅ Đã push thành công lên GitHub!"
Write-Info "`n🔗 Repository: $remoteUrl"
Write-Info "📝 Commit: $CommitMessage"
Write-Info "🌿 Branch: $currentBranch"
Write-Info "`n✨ Hoàn tất!"

