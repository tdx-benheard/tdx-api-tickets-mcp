import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { TDXClient } from './client.js';
// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Check for credentials file
const credsFile = process.env.TDX_CREDENTIALS_FILE;
if (credsFile && existsSync(credsFile)) {
    const credsContent = readFileSync(credsFile, 'utf8');
    const creds = JSON.parse(credsContent);
    Object.assign(process.env, creds);
}
else {
    const envPath = join(__dirname, '..', '.env');
    if (existsSync(envPath)) {
        const envFile = readFileSync(envPath, 'utf8');
        for (const line of envFile.split('\n')) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#'))
                continue;
            const equalIndex = trimmed.indexOf('=');
            if (equalIndex === -1)
                continue;
            const key = trimmed.slice(0, equalIndex).trim();
            let value = trimmed.slice(equalIndex + 1).trim();
            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            if (!process.env[key]) {
                process.env[key] = value;
            }
        }
    }
}
const TDX_BASE_URL = process.env.TDX_BASE_URL || '';
const TDX_USERNAME = process.env.TDX_USERNAME || '';
const TDX_PASSWORD = process.env.TDX_PASSWORD || '';
const TDX_APP_ID = process.env.TDX_APP_ID || '';
const appIds = TDX_APP_ID.split(',').map(id => id.trim()).filter(id => id.length > 0);
console.log('🔧 Testing PUT (Full Edit)\n');
console.log('Base URL:', TDX_BASE_URL);
console.log('---\n');
const client = new TDXClient(TDX_BASE_URL, TDX_USERNAME, TDX_PASSWORD, appIds);
async function testPutUpdate() {
    console.log('📝 Step 1: Get current ticket data');
    try {
        const ticket = await client.getTicket(554096, '627');
        console.log('✅ Retrieved ticket:', ticket.Title);
        console.log('   Current responsible:', ticket.ResponsibleFullName);
        console.log('   Current tags:', ticket.Tags?.join(', '));
        console.log('\n📝 Step 2: Modify and PUT back');
        // Modify the ticket
        ticket.ResponsibleUid = 'a5a5fde1-f337-ec11-981e-0003ff5034fa';
        ticket.Tags = ['1-day', 'add', 'accounts', 'Analyzed by claude'];
        const result = await client.editTicket(554096, ticket, '627');
        console.log('✅ PUT succeeded');
        console.log('   New responsible:', result.ResponsibleFullName);
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
    console.log(`Result: ${success ? '✅ PUT works' : '❌ PUT failed'}`);
    process.exit(success ? 0 : 1);
}
runTest().catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=test-put.js.map