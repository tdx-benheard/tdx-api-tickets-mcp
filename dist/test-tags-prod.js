import { readFileSync, existsSync } from 'fs';
import { TDXClient } from './client.js';
// Load production credentials
const credsFile = 'C:\\Users\\ben.heard\\.config\\tdx\\prod-credentials.json';
if (existsSync(credsFile)) {
    const credsContent = readFileSync(credsFile, 'utf8');
    const creds = JSON.parse(credsContent);
    Object.assign(process.env, creds);
}
const TDX_BASE_URL = process.env.TDX_BASE_URL || '';
const TDX_USERNAME = process.env.TDX_USERNAME || '';
const TDX_PASSWORD = process.env.TDX_PASSWORD || '';
const TDX_TICKET_APP_IDS = process.env.TDX_TICKET_APP_IDS || '';
const appIds = TDX_TICKET_APP_IDS.split(',').map(id => id.trim()).filter(id => id.length > 0);
console.log('🔧 Testing POST /api/{appId}/tickets/{id}/tags\n');
const client = new TDXClient(TDX_BASE_URL, TDX_USERNAME, TDX_PASSWORD, appIds);
async function testAddTags() {
    const ticketId = 29060683;
    console.log(`📝 Test 1: Adding single tag "test2" to ticket #${ticketId}`);
    try {
        const result1 = await client.addTicketTags(ticketId, ['test2'], appIds[0]);
        console.log('✅ Response status: 200');
        console.log('   Response type:', typeof result1);
        console.log('   Response value:', JSON.stringify(result1));
        console.log('   Response length (if string):', typeof result1 === 'string' ? result1.length : 'N/A');
    }
    catch (error) {
        console.error('❌ Failed:', error.response?.status, error.message);
    }
    console.log(`\n📝 Test 2: Adding multiple tags to ticket #${ticketId}`);
    try {
        const result2 = await client.addTicketTags(ticketId, ['test3', 'test4'], appIds[0]);
        console.log('✅ Response status: 200');
        console.log('   Response type:', typeof result2);
        console.log('   Response value:', JSON.stringify(result2));
    }
    catch (error) {
        console.error('❌ Failed:', error.response?.status, error.message);
    }
    console.log(`\n📝 Test 3: Checking if tags appear in ticket data`);
    try {
        const ticket = await client.getTicket(ticketId, appIds[0]);
        console.log('   Tags field exists?', 'Tags' in ticket);
        console.log('   Tags value:', ticket.Tags);
        console.log('   All fields with "tag" in name:');
        Object.keys(ticket).filter(k => k.toLowerCase().includes('tag')).forEach(k => {
            console.log(`     - ${k}:`, ticket[k]);
        });
        return true;
    }
    catch (error) {
        console.error('❌ Failed:', error.message);
        return false;
    }
}
testAddTags().catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=test-tags-prod.js.map