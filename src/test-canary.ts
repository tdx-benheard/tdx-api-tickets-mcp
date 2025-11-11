import { readFileSync, existsSync } from 'fs';
import { TDXClient } from './client.js';
import { decodePassword, validateEnvVars } from './utils.js';
import { homedir } from 'os';
import { join } from 'path';

// Load canary credentials from JSON file
const credPath = join(homedir(), '.config', 'tdx-mcp', 'canary-credentials.json');

if (!existsSync(credPath)) {
  console.error('❌ Canary credentials file not found:', credPath);
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

console.log('🐤 TeamDynamix Canary API Test\n');
console.log('Base URL:', TDX_BASE_URL);
console.log('Username:', TDX_USERNAME);
console.log('App IDs:', appIds.join(', '));
console.log('---\n');

const client = new TDXClient(TDX_BASE_URL, TDX_USERNAME, decodedPassword, appIds);

async function testSearchTickets() {
  console.log('📋 Testing: Search Tickets');
  console.log('   URL: POST', TDX_BASE_URL + `/api/${appIds[0]}/tickets/search`);
  try {
    const results = await client.searchTickets({
      MaxResults: 5
    });
    const count = Array.isArray(results) ? results.length : 0;

    if (count === 0) {
      console.error('❌ No tickets found (expected at least 1)');
      return false;
    }

    console.log(`✅ Found ${count} tickets`);
    console.log(`   First ticket: #${results[0].ID} - ${results[0].Title}`);
    return true;
  } catch (error: any) {
    console.error('❌ Error:', error.response?.status, error.message);
    if (error.response?.data) {
      console.error('   Response:', JSON.stringify(error.response.data).slice(0, 200));
    }
    return false;
  }
}

async function testListReports() {
  console.log('\n📊 Testing: List Reports');
  console.log('   URL: GET', TDX_BASE_URL + '/api/reports');
  try {
    const results = await client.listReports(5);
    const count = Array.isArray(results) ? results.length : 0;

    if (count === 0) {
      console.error('❌ No reports found (expected at least 1)');
      return false;
    }

    console.log(`✅ Found ${count} reports`);
    console.log(`   First report: ${results[0].Name} (ID: ${results[0].ID})`);
    return true;
  } catch (error: any) {
    console.error('❌ Error:', error.response?.status, error.message);
    if (error.response?.data) {
      console.error('   Response:', JSON.stringify(error.response.data).slice(0, 200));
    }
    return false;
  }
}

async function testGetTicket() {
  console.log('\n🎫 Testing: Get Ticket (will search for first available)');
  try {
    // Search for a ticket first
    const tickets = await client.searchTickets({ MaxResults: 1 });
    if (!Array.isArray(tickets) || tickets.length === 0) {
      console.log('⏭️  Skipping: No tickets found');
      return true;
    }

    const ticketId = tickets[0].ID;
    console.log(`   Getting ticket #${ticketId}`);

    const ticket = await client.getTicket(ticketId);
    console.log(`✅ Retrieved ticket: ${ticket.Title}`);
    console.log(`   Status: ${ticket.StatusName}`);
    console.log(`   Priority: ${ticket.PriorityName}`);
    return true;
  } catch (error: any) {
    console.error('❌ Error:', error.response?.status, error.message);
    if (error.response?.data) {
      console.error('   Response:', JSON.stringify(error.response.data).slice(0, 200));
    }
    return false;
  }
}

async function testAuth() {
  console.log('🔐 Testing: Authentication');
  console.log('   URL: POST', TDX_BASE_URL + '/api/auth');
  try {
    // This will trigger authentication automatically
    await client.searchTickets({ MaxResults: 1 });
    console.log('✅ Authentication successful');
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
  console.log('Starting canary tests...\n');

  const results = {
    auth: await testAuth(),
    searchTickets: await testSearchTickets(),
    listReports: await testListReports(),
    getTicket: await testGetTicket(),
  };

  console.log('\n---');
  console.log('📈 Test Results:');
  console.log(`   Authentication:    ${results.auth ? '✅' : '❌'}`);
  console.log(`   Search Tickets:    ${results.searchTickets ? '✅' : '❌'}`);
  console.log(`   List Reports:      ${results.listReports ? '✅' : '❌'}`);
  console.log(`   Get Ticket:        ${results.getTicket ? '✅' : '❌'}`);

  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.values(results).length;
  console.log(`\n${passed}/${total} tests passed`);

  process.exit(passed === total ? 0 : 1);
}

runTests().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
