import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { TDXClient } from './client.js';
import { loadEnvFile, decodePassword, validateEnvVars } from './utils.js';
// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');
if (existsSync(envPath)) {
    const envVars = loadEnvFile(envPath);
    // Merge with process.env (don't override existing values)
    for (const [key, value] of Object.entries(envVars)) {
        if (!process.env[key]) {
            process.env[key] = value;
        }
    }
}
const TDX_BASE_URL = process.env.TDX_BASE_URL || '';
const TDX_USERNAME = process.env.TDX_USERNAME || '';
const TDX_PASSWORD = process.env.TDX_PASSWORD || '';
const TDX_TICKET_APP_IDS = process.env.TDX_TICKET_APP_IDS || '';
// Validate required variables
try {
    validateEnvVars({ TDX_BASE_URL, TDX_USERNAME, TDX_PASSWORD, TDX_TICKET_APP_IDS }, ['TDX_BASE_URL', 'TDX_USERNAME', 'TDX_PASSWORD', 'TDX_TICKET_APP_IDS']);
}
catch (error) {
    console.error('❌ Missing required environment variables');
    console.error('   TDX_BASE_URL:', TDX_BASE_URL ? '✓' : '✗');
    console.error('   TDX_USERNAME:', TDX_USERNAME ? '✓' : '✗');
    console.error('   TDX_PASSWORD:', TDX_PASSWORD ? '✓' : '✗');
    console.error('   TDX_TICKET_APP_IDS:', TDX_TICKET_APP_IDS ? '✓' : '✗');
    process.exit(1);
}
// Decode password
const decodedPassword = decodePassword(TDX_PASSWORD);
// Parse comma-separated app IDs
const appIds = TDX_TICKET_APP_IDS.split(',').map(id => id.trim()).filter(id => id.length > 0);
console.log('🔧 TeamDynamix API Test\n');
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
    }
    catch (error) {
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
    }
    catch (error) {
        console.error('❌ Error:', error.response?.status, error.message);
        if (error.response?.data) {
            console.error('   Response:', JSON.stringify(error.response.data).slice(0, 200));
        }
        return false;
    }
}
async function testGetTicket(ticketId) {
    if (!ticketId) {
        console.log('\n🎫 Skipping: Get Ticket (no ticket ID provided)');
        return true;
    }
    console.log(`\n🎫 Testing: Get Ticket #${ticketId}`);
    try {
        const ticket = await client.getTicket(ticketId);
        console.log(`✅ Retrieved ticket: ${ticket.Title}`);
        console.log(`   Status: ${ticket.StatusName}`);
        console.log(`   Priority: ${ticket.PriorityName}`);
        return true;
    }
    catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : error);
        return false;
    }
}
async function testGetTicketFeed(ticketId) {
    if (!ticketId) {
        console.log('\n💬 Skipping: Get Ticket Feed (no ticket ID provided)');
        return true;
    }
    console.log(`\n💬 Testing: Get Ticket Feed #${ticketId}`);
    try {
        const feed = await client.getTicketFeed(ticketId, 5);
        const count = Array.isArray(feed) ? feed.length : 0;
        console.log(`✅ Retrieved ${count} feed entries`);
        if (count > 0) {
            console.log(`   Latest: "${feed[0].Body?.slice(0, 50)}..."`);
            console.log(`   By: ${feed[0].CreatedFullName}`);
            console.log(`   Date: ${feed[0].CreatedDate}`);
        }
        return true;
    }
    catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : error);
        return false;
    }
}
async function testAuth() {
    console.log('\n🔐 Testing: Authentication');
    console.log('   URL: POST', TDX_BASE_URL + '/api/auth');
    try {
        // This will trigger authentication automatically
        await client.searchTickets({ MaxResults: 1 });
        console.log('✅ Authentication successful');
        return true;
    }
    catch (error) {
        console.error('❌ Error:', error.response?.status, error.message);
        if (error.response?.data) {
            console.error('   Response:', JSON.stringify(error.response.data).slice(0, 200));
        }
        return false;
    }
}
async function runTests() {
    console.log('Starting tests...\n');
    const results = {
        auth: await testAuth(),
        searchTickets: await testSearchTickets(),
        listReports: await testListReports(),
        getTicket: await testGetTicket(555058),
        getTicketFeed: await testGetTicketFeed(555058),
    };
    console.log('\n---');
    console.log('📈 Test Results:');
    console.log(`   Authentication:    ${results.auth ? '✅' : '❌'}`);
    console.log(`   Search Tickets:    ${results.searchTickets ? '✅' : '❌'}`);
    console.log(`   List Reports:      ${results.listReports ? '✅' : '❌'}`);
    console.log(`   Get Ticket:        ${results.getTicket ? '✅' : '⏭️  (skipped)'}`);
    console.log(`   Get Ticket Feed:   ${results.getTicketFeed ? '✅' : '⏭️  (skipped)'}`);
    const passed = Object.values(results).filter(Boolean).length;
    const total = Object.values(results).length;
    console.log(`\n${passed}/${total} tests passed`);
    if (!results.auth) {
        console.log('\n💡 Hint: Check if auth endpoint should be /api/auth/login instead of /api/auth');
    }
    process.exit(passed === total ? 0 : 1);
}
runTests().catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=test.js.map