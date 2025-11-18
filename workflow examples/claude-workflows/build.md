# Build Instructions

**IMPORTANT:** Overrides base CLAUDE.md. Authoritative build documentation.

## Full Solution Build
```bash
# From parent dir of enterprise (where Monorepo.sln is)
cd ..
powershell "& '{MSBUILD_PATH}' Monorepo.sln /t:Build /p:Configuration=Debug /m /v:minimal"
```
- `/m` = parallel, `/v:minimal` = errors/warnings only
- Takes 5-10min cold, 1-3min incremental
- Expected warnings: NU1701, NU1702, MSB3277, MSB3073 (safe to ignore)

## Build Strategy: Minimum Required Only

**IMPORTANT:** Only build the specific project(s) you modified to save time and resources.

**Examples:**
- Changed `TDClient` controller → Build only `TDClient\TDClient.csproj`
- Changed `TDNext` page → Build only `TDNext\TDNext.csproj`
- Changed shared `TeamDynamix.Domain` code → Build full solution (dependencies)

**When to build full solution:**
- Changes to shared libraries (`objects/TeamDynamix.*`)
- Database schema changes (`TeamDynamixDB`)
- Unsure of dependencies

**⚠️ Objects folder dependency note:** If you build any project in `objects/`, you must rebuild any dependent project you're testing to get the updated DLL reference.

**When to build single project:**
- Changes isolated to one application (TDClient, TDNext, TDAdmin, etc.)
- UI-only changes (controllers, views, scripts)

## Web Forms Projects (TDNext/TDAdmin/TDClient)
```bash
# From enterprise dir - must use MSBuild via PowerShell (bash breaks / switches)
powershell -Command "& '{MSBUILD_PATH}' TDNext\TDNext.csproj /t:Build /p:Configuration=Debug"
```

## TDWorkManagement (ASP.NET Core + TypeScript + Vue)
```bash
# All-in-one: From enterprise dir
dotnet build TDWorkManagement\TDWorkManagement.csproj

# Individual components if needed:
cd TDWorkManagement && npm run builddev          # TypeScript only
cd TDWorkManagement\VueLibrarySource && npm run builddev  # Vue only
cd TDWorkManagement && npm run scss:compile      # Styles only
```
**Auto-runs:** .csproj MSBuild targets handle Vue/TS builds automatically (uses timestamp files to skip if unchanged)

## Troubleshooting

**NU1900 (NuGet auth):** Install credential provider:
```bash
powershell -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://aka.ms/install-artifacts-credprovider.ps1'))"
```

**Locked files:** IIS app pools auto-stopped/started during build. If fails, manually: `iisreset /stop`

**Force rebuild TDWorkManagement:** Delete timestamps:
```bash
del /f TDWorkManagement\node_modules\tdworkmanagement.timestamp
del /f TDWorkManagement\VueLibrarySource\node_modules\vuelibrarysource.timestamp
```

## Prerequisites
- .NET 8.0 SDK
- Node.js LTS
- Azure Artifacts Credential Provider (see NU1900 above)
