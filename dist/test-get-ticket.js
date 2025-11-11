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
const TDX_APP_ID = process.env.TDX_APP_ID || '';
const appIds = TDX_APP_ID.split(',').map(id => id.trim()).filter(id => id.length > 0);
const client = new TDXClient(TDX_BASE_URL, TDX_USERNAME, TDX_PASSWORD, appIds);
async function getTicketData() {
    const ticketId = 29060683;
    console.log(`📋 Getting full data for ticket #${ticketId}\n`);
    try {
        const ticket = await client.getTicket(ticketId, appIds[0]);
        console.log('Full ticket data:');
        console.log(JSON.stringify(ticket, null, 2));
        console.log('\n\n📌 Tags specifically:');
        console.log('Tags field:', ticket.Tags);
        console.log('Type:', typeof ticket.Tags);
        console.log('Is Array?', Array.isArray(ticket.Tags));
        if (ticket.Tags) {
            console.log('Length:', ticket.Tags.length);
            console.log('Contents:', ticket.Tags);
        }
    }
    catch (error) {
        console.error('❌ Failed:', error.message);
        if (error.response?.data) {
            console.error('Response:', JSON.stringify(error.response.data, null, 2));
        }
    }
}
getTicketData().catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=test-get-ticket.js.map