import { readFileSync, existsSync } from 'fs';
import { TDXClient } from './client.js';
import { decodePassword, validateEnvVars } from './utils.js';
import { homedir } from 'os';
import { join } from 'path';

// Load development credentials from JSON file
const credPath = join(homedir(), '.config', 'tdx-mcp', 'dev-credentials.json');

if (!existsSync(credPath)) {
  console.error('❌ Development credentials file not found:', credPath);
  process.exit(1);
}

const credentials = JSON.parse(readFileSync(credPath, 'utf8'));

const TDX_BASE_URL = credentials.TDX_BASE_URL || '';
const TDX_USERNAME = credentials.TDX_USERNAME || '';
const TDX_PASSWORD = credentials.TDX_PASSWORD || '';
const TDX_TICKET_APP_IDS = credentials.TDX_TICKET_APP_IDS || '';

// Validate required fields
try {
  validateEnvVars(
    { TDX_BASE_URL, TDX_USERNAME, TDX_PASSWORD, TDX_TICKET_APP_IDS },
    ['TDX_BASE_URL', 'TDX_USERNAME', 'TDX_PASSWORD', 'TDX_TICKET_APP_IDS']
  );
} catch (error) {
  console.error('❌ Missing required fields in credentials file');
  console.error('   TDX_BASE_URL:', TDX_BASE_URL ? '✓' : '✗');
  console.error('   TDX_USERNAME:', TDX_USERNAME ? '✓' : '✗');
  console.error('   TDX_PASSWORD:', TDX_PASSWORD ? '✓' : '✗');
  console.error('   TDX_TICKET_APP_IDS:', TDX_TICKET_APP_IDS ? '✓' : '✗');
  process.exit(1);
}

// Decode password
const decodedPassword = decodePassword(TDX_PASSWORD);

// Parse comma-separated app IDs
const appIds = TDX_TICKET_APP_IDS.split(',').map((id: string) => id.trim()).filter((id: string) => id.length > 0);

console.log('🧪 TeamDynamix Development API Test 4\n');
console.log('Base URL:', TDX_BASE_URL);
console.log('Username:', TDX_USERNAME);
console.log('App IDs:', appIds.join(', '));
console.log('---\n');

const client = new TDXClient(TDX_BASE_URL, TDX_USERNAME, decodedPassword, appIds);

async function testGetCurrentUser() {
  console.log('👤 Testing: Get Current User');
  console.log('   URL: GET', TDX_BASE_URL + '/api/people/me');
  try {
    const user = await client.getCurrentUser();
    console.log(`✅ Retrieved current user: ${user.FullName}`);
    console.log(`   UID: ${user.UID}`);
    console.log(`   Username: ${user.UserName}`);
    console.log(`   Email: ${user.PrimaryEmail}`);
    console.log(`   Is Active: ${user.IsActive}`);
    return true;
  } catch (error: any) {
    console.error('❌ Error:', error.response?.status, error.message);
    if (error.response?.data) {
      console.error('   Response:', JSON.stringify(error.response.data).slice(0, 200));
    }
    return false;
  }
}

async function testSearchUsers() {
  console.log('\n👥 Testing: Search Users');
  console.log('   URL: GET', TDX_BASE_URL + '/api/people/lookup');
  try {
    const results = await client.searchUsers('ben', 3);
    const count = Array.isArray(results) ? results.length : 0;

    console.log(`✅ Found ${count} users`);
    if (count > 0) {
      console.log(`   First result: ${results[0].FullName} (${results[0].PrimaryEmail})`);
    }
    return true;
  } catch (error: any) {
    console.error('❌ Error:', error.response?.status, error.message);
    if (error.response?.data) {
      console.error('   Response:', JSON.stringify(error.response.data).slice(0, 200));
    }
    return false;
  }
}

async function testSearchGroups() {
  console.log('\n👨‍👩‍👧‍👦 Testing: Search Groups');
  console.log('   URL: POST', TDX_BASE_URL + '/api/groups/search');
  try {
    const results = await client.searchGroups('', 5);
    const count = Array.isArray(results) ? results.length : 0;

    console.log(`✅ Found ${count} groups`);
    if (count > 0) {
      console.log(`   First group: ${results[0].Name}`);
      console.log(`   ID: ${results[0].ID}`);
    }
    return true;
  } catch (error: any) {
    console.error('❌ Error:', error.response?.status, error.message);
    if (error.response?.data) {
      console.error('   Response:', JSON.stringify(error.response.data).slice(0, 200));
    }
    return false;
  }
}

async function runTests() {
  console.log('Starting test 4 (People & Groups)...\n');

  const results = {
    getCurrentUser: await testGetCurrentUser(),
    searchUsers: await testSearchUsers(),
    searchGroups: await testSearchGroups(),
  };

  console.log('\n---');
  console.log('📈 Test Results:');
  console.log(`   Get Current User:  ${results.getCurrentUser ? '✅' : '❌'}`);
  console.log(`   Search Users:      ${results.searchUsers ? '✅' : '❌'}`);
  console.log(`   Search Groups:     ${results.searchGroups ? '✅' : '❌'}`);

  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.values(results).length;
  console.log(`\n${passed}/${total} tests passed`);

  process.exit(passed === total ? 0 : 1);
}

runTests().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
