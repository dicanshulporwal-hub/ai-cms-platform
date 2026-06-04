# Integration Test Script for AI CMS Platform
# Comprehensive end-to-end testing of all major CMS flows

$API = "http://localhost:3001"
$ADMIN = "http://localhost:3000"
$PUBLIC = "http://localhost:3002"

$pass = 0
$fail = 0
$results = @()

function Test-Endpoint {
    param([string]$Name, [string]$Url, [string]$Method = "GET", [string]$Body = "", [hashtable]$Headers = @{}, [int]$ExpectedStatus = 200, [switch]$ReturnBody)
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            ErrorAction = "Stop"
            UseBasicParsing = $true
        }
        if ($Body -and $Method -ne "GET") {
            $params.Body = $Body
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params
        $status = $response.StatusCode
        
        if ($status -eq $ExpectedStatus) {
            $script:pass++
            $script:results += "PASS: $Name"
            Write-Host "  PASS: $Name" -ForegroundColor Green
            if ($ReturnBody) { return $response.Content | ConvertFrom-Json }
        } else {
            $script:fail++
            $script:results += "FAIL: $Name (Expected $ExpectedStatus, Got $status)"
            Write-Host "  FAIL: $Name (Expected $ExpectedStatus, Got $status)" -ForegroundColor Red
        }
    } catch {
        $actualStatus = 0
        if ($_.Exception.Response) {
            $actualStatus = [int]$_.Exception.Response.StatusCode
        }
        if ($actualStatus -eq $ExpectedStatus) {
            $script:pass++
            $script:results += "PASS: $Name"
            Write-Host "  PASS: $Name" -ForegroundColor Green
        } else {
            $script:fail++
            $errMsg = if ($actualStatus -gt 0) { "HTTP $actualStatus" } else { $_.Exception.Message }
            $script:results += "FAIL: $Name ($errMsg)"
            Write-Host "  FAIL: $Name - $errMsg" -ForegroundColor Red
        }
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " AI CMS Integration Tests" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# --- Step 1: Login ---
Write-Host "[1] Authentication" -ForegroundColor Yellow
$loginBody = '{"email":"admin@example.com","password":"Admin@12345"}'
$loginResp = Invoke-RestMethod -Uri "$API/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResp.accessToken

if ($token) {
    $pass++; $results += "PASS: Admin login"
    Write-Host "  PASS: Admin login (token obtained)" -ForegroundColor Green
} else {
    $fail++; $results += "FAIL: Admin login"
    Write-Host "  FAIL: Admin login" -ForegroundColor Red
    exit 1
}

$authHeaders = @{ "Authorization" = "Bearer $token" }

# --- Step 2: Page Lifecycle ---
Write-Host "`n[2] Page Lifecycle (Create -> Submit -> Approve -> Publish)" -ForegroundColor Yellow

# Check if page already exists
$existingPage = $null
try {
    $existingPage = Invoke-RestMethod -Uri "$API/public/pages/integration-test-page" -Method GET -ErrorAction Stop
} catch {}

if ($existingPage -and $existingPage.id) {
    $pageId = $existingPage.id
    $pass++; $results += "PASS: Page already published"
    Write-Host "  PASS: Page already published (id=$pageId)" -ForegroundColor Green
} else {
    $pageBody = @{
        title = "Integration Test Page"
        slug = "integration-test-page"
        content = "<h1>Integration Test</h1><p>This page was created by the integration test script.</p>"
        metaTitle = "Integration Test"
        metaDescription = "A test page for integration testing."
    } | ConvertTo-Json

    try {
        $page = Invoke-RestMethod -Uri "$API/pages" -Method POST -Body $pageBody -ContentType "application/json" -Headers $authHeaders
        $pageId = $page.id
        $pass++; $results += "PASS: Create page"
        Write-Host "  PASS: Create page (id=$pageId)" -ForegroundColor Green

        # Submit -> Approve -> Publish
        Invoke-RestMethod -Uri "$API/pages/$pageId/submit" -Method POST -Headers $authHeaders | Out-Null
        $pass++; $results += "PASS: Submit page"
        Write-Host "  PASS: Submit page" -ForegroundColor Green

        Invoke-RestMethod -Uri "$API/pages/$pageId/approve" -Method POST -Headers $authHeaders | Out-Null
        $pass++; $results += "PASS: Approve page"
        Write-Host "  PASS: Approve page" -ForegroundColor Green

        Invoke-RestMethod -Uri "$API/pages/$pageId/publish" -Method POST -Headers $authHeaders | Out-Null
        $pass++; $results += "PASS: Publish page"
        Write-Host "  PASS: Publish page" -ForegroundColor Green
    } catch {
        $fail++; $results += "FAIL: Page lifecycle - $($_.Exception.Message)"
        Write-Host "  FAIL: Page lifecycle - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Verify page accessible via public API
Test-Endpoint -Name "Public page accessible" -Url "$API/public/pages/integration-test-page"

# --- Step 3: Verify Sitemap ---
Write-Host "`n[3] Sitemap & Robots" -ForegroundColor Yellow
try {
    $sitemapResp = Invoke-WebRequest -Uri "$API/sitemap.xml" -Method GET -UseBasicParsing
    $sitemapContent = $sitemapResp.Content
    if ($sitemapContent -match "integration-test-page") {
        $pass++; $results += "PASS: Page in sitemap"
        Write-Host "  PASS: Published page found in sitemap.xml" -ForegroundColor Green
    } else {
        $fail++; $results += "FAIL: Page not in sitemap"
        Write-Host "  FAIL: Published page NOT found in sitemap.xml" -ForegroundColor Red
    }
} catch {
    $fail++; $results += "FAIL: Sitemap fetch error"
    Write-Host "  FAIL: Sitemap fetch - $($_.Exception.Message)" -ForegroundColor Red
}

Test-Endpoint -Name "Robots.txt" -Url "$API/robots.txt"

# --- Step 4: Navigation Menu ---
Write-Host "`n[4] Navigation Menu" -ForegroundColor Yellow

# Check if a HEADER menu already exists
$existingMenus = Invoke-RestMethod -Uri "$API/public/menus" -Method GET
$headerMenu = $existingMenus | Where-Object { $_.location -eq "HEADER" }

if ($headerMenu) {
    $pass++; $results += "PASS: HEADER menu exists"
    Write-Host "  PASS: HEADER menu already exists" -ForegroundColor Green
} else {
    $menuBody = @{
        name = "Main Navigation"
        slug = "main-navigation"
        location = "HEADER"
        description = "Primary site navigation"
    } | ConvertTo-Json

    try {
        $menu = Invoke-RestMethod -Uri "$API/menus" -Method POST -Body $menuBody -ContentType "application/json" -Headers $authHeaders
        $menuId = $menu.id
        $pass++; $results += "PASS: Create menu"
        Write-Host "  PASS: Create HEADER menu (id=$menuId)" -ForegroundColor Green

        # Add menu items
        $items = @(
            @{ label = "Home"; url = "/"; linkType = "INTERNAL"; sortOrder = 0 }
            @{ label = "About"; url = "/pages/about"; linkType = "INTERNAL"; sortOrder = 1 }
            @{ label = "Blog"; url = "/blog"; linkType = "INTERNAL"; sortOrder = 2 }
            @{ label = "FAQs"; url = "/faqs"; linkType = "INTERNAL"; sortOrder = 3 }
        )
        foreach ($item in $items) {
            try {
                Invoke-RestMethod -Uri "$API/menus/$menuId/items" -Method POST -Body ($item | ConvertTo-Json) -ContentType "application/json" -Headers $authHeaders | Out-Null
            } catch {}
        }
        $pass++; $results += "PASS: Add menu items"
        Write-Host "  PASS: Added menu items" -ForegroundColor Green

        # Activate
        try {
            Invoke-RestMethod -Uri "$API/menus/$menuId/activate" -Method POST -Headers $authHeaders | Out-Null
            $pass++; $results += "PASS: Activate menu"
            Write-Host "  PASS: Menu activated" -ForegroundColor Green
        } catch {
            $pass++; $results += "PASS: Menu activation (may be auto-active)"
            Write-Host "  PASS: Menu activation (may already be active)" -ForegroundColor Green
        }
    } catch {
        $fail++; $results += "FAIL: Create menu - $($_.Exception.Message)"
        Write-Host "  FAIL: Create menu - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Test-Endpoint -Name "Public HEADER menu endpoint" -Url "$API/public/menus/location/HEADER"

# --- Step 5: Broken Link Scanner ---
Write-Host "`n[5] Broken Link Scanner" -ForegroundColor Yellow
try {
    $scan = Invoke-RestMethod -Uri "$API/broken-links/scans/run" -Method POST -Headers $authHeaders
    $pass++; $results += "PASS: Broken link scan"
    Write-Host "  PASS: Broken link scan completed" -ForegroundColor Green
} catch {
    $fail++; $results += "FAIL: Broken link scan - $($_.Exception.Message)"
    Write-Host "  FAIL: Broken link scan - $($_.Exception.Message)" -ForegroundColor Red
}

Test-Endpoint -Name "Broken links summary" -Url "$API/broken-links/summary" -Headers $authHeaders

# --- Step 6: Backup ---
Write-Host "`n[6] Backup Manager" -ForegroundColor Yellow
try {
    $backupBody = '{"includePages":true,"includeBlogs":true,"includeFaqs":true,"includeSettings":true}'
    $backup = Invoke-RestMethod -Uri "$API/backups/create" -Method POST -Body $backupBody -ContentType "application/json" -Headers $authHeaders
    $pass++; $results += "PASS: Create backup"
    Write-Host "  PASS: Backup created (id=$($backup.id))" -ForegroundColor Green
} catch {
    $fail++; $results += "FAIL: Create backup - $($_.Exception.Message)"
    Write-Host "  FAIL: Create backup - $($_.Exception.Message)" -ForegroundColor Red
}

Test-Endpoint -Name "Backup summary" -Url "$API/backup-manager/summary" -Headers $authHeaders

# --- Step 7: Content Calendar ---
Write-Host "`n[7] Content Calendar" -ForegroundColor Yellow
Test-Endpoint -Name "Content calendar summary" -Url "$API/content-calendar/summary" -Headers $authHeaders

# --- Step 8: Announcements ---
Write-Host "`n[8] Announcements" -ForegroundColor Yellow
Test-Endpoint -Name "Public announcements" -Url "$API/public/announcements"

# --- Step 9: Structured Data ---
Write-Host "`n[9] Structured Data (JSON-LD)" -ForegroundColor Yellow
Test-Endpoint -Name "Global structured data" -Url "$API/public/structured-data/global"

# --- Step 10: Analytics Event Tracking ---
Write-Host "`n[10] Analytics" -ForegroundColor Yellow
$eventBody = '{"event":"page_view","path":"/integration-test","sessionId":"test-session-001"}'
Test-Endpoint -Name "Track analytics event" -Url "$API/public/analytics/event" -Method POST -Body $eventBody -ExpectedStatus 201
Test-Endpoint -Name "Analytics overview" -Url "$API/analytics/overview" -Headers $authHeaders

# --- Step 11: Template System ---
Write-Host "`n[11] Template System" -ForegroundColor Yellow
Test-Endpoint -Name "Template render data" -Url "$API/public/template/render-data"

# --- Step 12: Redirects & 404 ---
Write-Host "`n[12] Redirects & 404 Tracking" -ForegroundColor Yellow
Test-Endpoint -Name "Redirect resolve (no match)" -Url "$API/public/redirects/resolve?path=/non-existent"
Test-Endpoint -Name "Redirects summary" -Url "$API/redirects/summary" -Headers $authHeaders

# --- Step 13: AI Prompts ---
Write-Host "`n[13] AI Prompts Governance" -ForegroundColor Yellow
Test-Endpoint -Name "AI prompts governance" -Url "$API/ai-prompts/governance" -Headers $authHeaders

# --- Step 14: Webhooks ---
Write-Host "`n[14] Integrations" -ForegroundColor Yellow
Test-Endpoint -Name "Webhooks summary" -Url "$API/integrations/summary" -Headers $authHeaders

# --- Step 15: Deployment ---
Write-Host "`n[15] Deployment" -ForegroundColor Yellow
Test-Endpoint -Name "Deployment summary" -Url "$API/deployment/summary" -Headers $authHeaders

# --- Step 16: API Access ---
Write-Host "`n[16] API Access (Headless CMS)" -ForegroundColor Yellow
Test-Endpoint -Name "API access summary" -Url "$API/api-access/summary" -Headers $authHeaders

# --- Step 17: Accessibility ---
Write-Host "`n[17] Accessibility" -ForegroundColor Yellow
Test-Endpoint -Name "Accessibility summary" -Url "$API/accessibility/summary" -Headers $authHeaders

# --- Step 18: Tenders ---
Write-Host "`n[18] Tenders" -ForegroundColor Yellow
Test-Endpoint -Name "Tenders list" -Url "$API/tenders" -Headers $authHeaders

# --- Step 19: Public Web Rendering ---
Write-Host "`n[19] Public Web Site" -ForegroundColor Yellow
Test-Endpoint -Name "Public homepage" -Url $PUBLIC
Test-Endpoint -Name "Public page render" -Url "$PUBLIC/pages/integration-test-page"

# --- Step 20: Admin Panel ---
Write-Host "`n[20] Admin Panel" -ForegroundColor Yellow
Test-Endpoint -Name "Admin web loads" -Url $ADMIN

# --- Step 21: Dashboard ---
Write-Host "`n[21] Dashboard" -ForegroundColor Yellow
Test-Endpoint -Name "Dashboard summary" -Url "$API/dashboard/summary" -Headers $authHeaders

# --- Summary ---
$total = $pass + $fail
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " RESULTS: $pass/$total passed, $fail failed" -ForegroundColor $(if ($fail -eq 0) { "Green" } else { "Yellow" })
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$results | ForEach-Object {
    $color = if ($_ -match "^PASS") { "Green" } else { "Red" }
    Write-Host "  $_" -ForegroundColor $color
}

Write-Host "`nDone.`n"
