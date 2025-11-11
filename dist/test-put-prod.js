import { readFileSync, existsSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { TDXClient } from './client.js';
// Load environment variables from credentials file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const credsFile = 'C:\\Users\\ben.heard\\.config\\tdx\\prod-credentials.json';
if (existsSync(credsFile)) {
    const credsContent = readFileSync(credsFile, 'utf8');
    const creds = JSON.parse(credsContent);
    Object.assign(process.env, creds);
}
const TDX_BASE_URL = process.env.TDX_BASE_URL || '';
const TDX_USERNAME = process.env.TDX_USERNAME || '';
const TDX_PASSWORD = process.env.TDX_PASSWORD || '';
const TDX_APP_ID = process.env.TDX_APP_ID || '';
const appIds = TDX_APP_ID.split(',').map(id => id.trim()).filter(id => id.length > 0);
console.log('🔧 Testing PUT on Production\n');
console.log('Base URL:', TDX_BASE_URL);
console.log('App ID:', appIds[0]);
console.log('---\n');
const client = new TDXClient(TDX_BASE_URL, TDX_USERNAME, TDX_PASSWORD, appIds);
async function testPutUpdate() {
    const ticketId = 29060683;
    console.log(`📝 Step 1: Get current ticket #${ticketId}`);
    try {
        const ticket = await client.getTicket(ticketId, appIds[0]);
        console.log('✅ Retrieved ticket:', ticket.Title);
        console.log('   Current tags:', ticket.Tags?.join(', ') || '(none)');
        console.log('   Responsible:', ticket.ResponsibleFullName);
        console.log('\n📝 Step 2: Modify ticket and PUT back');
        // Add test tag
        const currentTags = ticket.Tags || [];
        if (!currentTags.includes('test')) {
            ticket.Tags = [...currentTags, 'test'];
        }
        const result = await client.editTicket(ticketId, ticket, appIds[0]);
        console.log('✅ PUT succeeded');
        console.log('   New tags:', result.Tags?.join(', '));
        return true;
    }
    catch (error) {
        console.error('❌ PUT failed:', error.response?.status, error.message);
        if (error.response?.data) {
            console.error('   Response:', JSON.stringify(error.response.data).slice(0, 500));
        }
        return false;
    }
}
async function runTest() {
    const success = await testPutUpdate();
    console.log('\n---');
    console.log(`Result: ${success ? '✅ PUT works on production' : '❌ PUT failed on production'}`);
    process.exit(success ? 0 : 1);
}
runTest().catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=test-put-prod.js.map