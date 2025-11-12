#!/usr/bin/env tsx
/**
 * TeamDynamix MCP Server - Interactive Environment Credential Setup Tool
 * Encrypts passwords, tests authentication, discovers apps, outputs Claude-parseable config
 *
 * Usage: npm run setup-env-config
 */

import { password, select, input, confirm, checkbox } from '@inquirer/prompts';
import { execSync } from 'child_process';
import axios from 'axios';

console.log('');
console.log('========================================================');
console.log(' TeamDynamix MCP - Interactive Credential Setup Tool');
console.log('========================================================');
console.log('');
console.log('This tool will:');
console.log('  1. Encrypt your password using Windows DPAPI');
console.log('  2. Test authentication with TeamDynamix');
console.log('  3. Discover available ticketing applications');
console.log('  4. Output configuration for Claude to set up');
console.log('');

async function main() {
  try {
    // Step 1: Select environment
    const environment = await select({
      message: 'Which environment?',
      choices: [
        { name: 'Production', value: 'prod' },
        { name: 'Test', value: 'test' },
        { name: 'Canary', value: 'canary' },
        { name: 'Development', value: 'dev' },
      ],
    });

    // Step 2: Get domain (pre-populated based on environment)
    const defaultDomains: Record<string, string> = {
      prod: 'solutions.teamdynamix.com',
      test: 'part01-demo.teamdynamixtest.com',
      canary: 'eng.teamdynamixcanary.com',
      dev: 'localhost/TDDev',
    };

    let domain = await input({
      message: 'TeamDynamix domain',
      default: defaultDomains[environment],
    });

    // Step 3: Get username
    let username = await input({
      message: 'TeamDynamix username',
    });

    if (!username) {
      console.error('\n✗ Username is required');
      process.exit(1);
    }

    // Step 4: Get password
    let plainPassword = await password({
      message: 'Enter your TeamDynamix password',
      mask: '*',
    });

    if (!plainPassword) {
      console.error('\n✗ Password is required');
      process.exit(1);
    }

    // Step 5: Test authentication (with retry loop)
    let authToken: string | null = null;

    while (!authToken) {
      // Construct base URL
      const protocol = domain.startsWith('localhost') ? 'http' : 'https';
      const baseUrl = `${protocol}://${domain}/TDWebApi`;

      console.log('\n🔍 Testing authentication...');

      try {
        const authResponse = await axios.post(
          `${baseUrl}/api/auth`,
          { UserName: username, Password: plainPassword },
          { timeout: 10000 }
        );
        authToken = authResponse.data;
        console.log('✓ Authentication successful!\n');
      } catch (error: any) {
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          console.error('✗ Timeout: Cannot reach server at', baseUrl);
        } else if (error.response?.status === 401) {
          console.error('✗ Authentication failed: Invalid username or password');
        } else if (error.response?.status === 403) {
          console.error('✗ Authentication failed: Access forbidden (403)');
        } else {
          console.error('✗ Authentication failed:', error.message);
        }

        const retry = await confirm({
          message: 'Would you like to try again with different credentials?',
          default: true,
        });

        if (!retry) {
          process.exit(1);
        }

        console.log('');
        domain = await input({
          message: 'TeamDynamix domain',
          default: domain,
        });

        username = await input({
          message: 'TeamDynamix username',
          default: username,
        });

        plainPassword = await password({
          message: 'TeamDynamix password',
          mask: '*',
        });

        if (!plainPassword) {
          console.error('\n✗ Password is required');
          process.exit(1);
        }
      }
    }

    // Construct final base URL for output
    const protocol = domain.startsWith('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${domain}/TDWebApi`;

    // Step 6: Fetch available applications
    console.log('🔍 Fetching available ticketing applications...');

    let selectedAppIds: string;
    try {
      const appsResponse = await axios.get(`${baseUrl}/api/applications`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      const ticketingApps = appsResponse.data.filter(
        (app: any) => app.Type === 'Ticketing' && app.Active
      );

      if (ticketingApps.length === 0) {
        console.log('\n⚠ No active ticketing applications found automatically');
        selectedAppIds = await input({
          message: 'Enter application IDs manually (comma-separated)',
        });
      } else {
        console.log(`\n✓ Found ${ticketingApps.length} ticketing application(s)\n`);

        const selectedApps = await checkbox({
          message: 'Select applications (space to select, enter to confirm)',
          choices: ticketingApps.map((app: any) => ({
            name: `${app.Name} (ID: ${app.AppID})`,
            value: app.AppID.toString(),
            checked: false,
          })),
          pageSize: 20,
        });

        if (selectedApps.length === 0) {
          console.error('\n✗ You must select at least one application');
          process.exit(1);
        }

        selectedAppIds = selectedApps.join(',');
      }
    } catch (error: any) {
      console.log('\n⚠ Unable to fetch applications automatically');
      if (error.response?.status) {
        console.log(`   Error: HTTP ${error.response.status}: ${error.response.statusText}`);
      } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        console.log('   Error: Request timed out');
      } else {
        console.log(`   Error: ${error.message}`);
      }
      console.log('');
      selectedAppIds = await input({
        message: 'Enter application IDs manually (comma-separated)',
      });
    }

    // Step 7: Encrypt password (now that everything else succeeded)
    console.log('\n🔐 Encrypting password...');

    const psCommand = `Add-Type -AssemblyName System.Security; $plainText = [Console]::In.ReadToEnd().Trim(); $encrypted = [Security.Cryptography.ProtectedData]::Protect([Text.Encoding]::UTF8.GetBytes($plainText), $null, 'CurrentUser'); 'dpapi:' + [Convert]::ToBase64String($encrypted)`;

    const encryptedPassword = execSync(
      `powershell -NoProfile -NonInteractive -Command "${psCommand}"`,
      {
        input: plainPassword,
        encoding: 'utf8',
        windowsHide: true,
        stdio: ['pipe', 'pipe', 'pipe'],
      }
    ).trim();

    if (!encryptedPassword.startsWith('dpapi:')) {
      console.error('\n✗ Encryption failed: Invalid output format');
      throw new Error('Encryption failed: Invalid output format');
    }

    console.log('✓ Password encrypted successfully!\n');

    // Step 8: Format output for Claude
    const output = `TDXCREDS:START
environment=${environment}
baseUrl=${baseUrl}
username=${username}
password=${encryptedPassword}
appIds=${selectedAppIds}
TDXCREDS:END`;

    // Display output
    console.log('\n✓ Configuration ready:\n');
    console.log(output);
    console.log('');

    // Copy to clipboard
    try {
      // Use stdin to avoid escaping issues with special characters
      execSync('powershell -Command "$input | Set-Clipboard"', {
        input: output,
        windowsHide: true,
      });
      console.log('✓ Copied to clipboard! Paste it to Claude Code (Ctrl+V)');
    } catch (clipboardError) {
      console.log('⚠ Could not copy to clipboard automatically');
      console.log('  Copy the text above and paste it to Claude Code');
    }
    console.log('');

    console.log('Security Notes:');
    console.log('  • This encrypted password only works on this Windows user account');
    console.log('  • It cannot be decrypted by other users or on other computers');
    console.log('');

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('User force closed')) {
        console.log('\n✗ Cancelled by user');
        process.exit(0);
      }
      console.error('\n✗ Setup failed:', error.message);

      if (error.message.includes('powershell')) {
        console.error('\nThis tool requires Windows with PowerShell.');
        console.error('DPAPI encryption is only available on Windows systems.');
      }
    } else {
      console.error('\n✗ Setup failed:', error);
    }
    process.exit(1);
  }
}

main();
