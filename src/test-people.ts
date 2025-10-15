import { TDXClient } from './client.js';

// Load environment variables
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load dev credentials
const credentialsFile = 'C:/Users/ben.heard/.config/tdx/dev-credentials.json';
const credentials = JSON.parse(readFileSync(credentialsFile, 'utf8'));

const TDX_BASE_URL = credentials.TDX_BASE_URL;
const TDX_USERNAME = credentials.TDX_USERNAME;
const TDX_PASSWORD = credentials.TDX_PASSWORD;
const TDX_APP_ID = credentials.TDX_APP_ID;

const appIds = TDX_APP_ID.split(',').map((id: string) => id.trim());

console.log('🔧 TeamDynamix People API Test Suite (Development Environment)');
console.log('='.repeat(60));
console.log(`Base URL: ${TDX_BASE_URL}`);
console.log(`Username: ${TDX_USERNAME}`);
console.log(`App IDs: ${appIds.join(', ')}`);
console.log('='.repeat(60));
console.log();

const client = new TDXClient(TDX_BASE_URL, TDX_USERNAME, TDX_PASSWORD, appIds);

async function runTests() {
  let passed = 0;
  let failed = 0;

  // Test 1: Get current user
  try {
    console.log('Test 1: Get current authenticated user...');
    const currentUser = await client.getCurrentUser();
    console.log(`✅ SUCCESS: Retrieved current user`);
    console.log(`   - Name: ${currentUser.FirstName} ${currentUser.LastName}`);
    console.log(`   - Username: ${currentUser.UserName}`);
    console.log(`   - UID: ${currentUser.UID}`);
    console.log(`   - Email: ${currentUser.PrimaryEmail}`);
    passed++;
  } catch (error: any) {
    console.log(`❌ FAILED: ${error.message}`);
    failed++;
  }
  console.log();

  // Test 2: Get user by username
  try {
    console.log(`Test 2: Get user by username (${TDX_USERNAME})...`);
    const user = await client.getUser(undefined, TDX_USERNAME);
    console.log(`✅ SUCCESS: Retrieved user by username`);
    console.log(`   - Name: ${user.FirstName} ${user.LastName}`);
    console.log(`   - UID: ${user.UID}`);
    passed++;
  } catch (error: any) {
    console.log(`❌ FAILED: ${error.message}`);
    failed++;
  }
  console.log();

  // Test 3: Get user UID by username
  try {
    console.log(`Test 3: Get user UID by username (${TDX_USERNAME})...`);
    const uid = await client.getUserUid(TDX_USERNAME);
    console.log(`✅ SUCCESS: Retrieved UID`);
    console.log(`   - UID: ${uid}`);
    passed++;
  } catch (error: any) {
    console.log(`❌ FAILED: ${error.message}`);
    failed++;
  }
  console.log();

  // Test 4: Search users
  try {
    console.log('Test 4: Search users (search for "admin")...');
    const users = await client.searchUsers('admin', 5);
    console.log(`✅ SUCCESS: Found ${users.length} users`);
    if (users.length > 0) {
      users.forEach((user: any, index: number) => {
        console.log(`   ${index + 1}. ${user.FullName} (${user.UserName})`);
      });
    }
    passed++;
  } catch (error: any) {
    console.log(`❌ FAILED: ${error.message}`);
    failed++;
  }
  console.log();

  console.log('='.repeat(60));
  console.log(`✅ Tests Passed: ${passed}`);
  console.log(`❌ Tests Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);
  console.log('='.repeat(60));

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
