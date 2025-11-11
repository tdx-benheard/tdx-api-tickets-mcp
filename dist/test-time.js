import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { TDXClient } from './client.js';
// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
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
const TDX_BASE_URL = process.env.TDX_BASE_URL || '';
const TDX_USERNAME = process.env.TDX_USERNAME || '';
const TDX_PASSWORD = process.env.TDX_PASSWORD || '';
const TDX_TICKET_APP_IDS = process.env.TDX_TICKET_APP_IDS || '';
if (!TDX_BASE_URL || !TDX_USERNAME || !TDX_PASSWORD || !TDX_TICKET_APP_IDS) {
    console.error('❌ Missing required environment variables');
    console.error('   TDX_BASE_URL:', TDX_BASE_URL ? '✓' : '✗');
    console.error('   TDX_USERNAME:', TDX_USERNAME ? '✓' : '✗');
    console.error('   TDX_PASSWORD:', TDX_PASSWORD ? '✓' : '✗');
    console.error('   TDX_TICKET_APP_IDS:', TDX_TICKET_APP_IDS ? '✓' : '✗');
    process.exit(1);
}
// Parse comma-separated app IDs
const appIds = TDX_TICKET_APP_IDS.split(',').map(id => id.trim()).filter(id => id.length > 0);
console.log('⏱️  TeamDynamix Time API Test\n');
console.log('Base URL:', TDX_BASE_URL);
console.log('Username:', TDX_USERNAME);
console.log('---\n');
const client = new TDXClient(TDX_BASE_URL, TDX_USERNAME, TDX_PASSWORD, appIds);
async function testListTimeTypes() {
    console.log('📋 Testing: List Time Types');
    console.log('   URL: GET', TDX_BASE_URL + '/api/time/types');
    try {
        const results = await client.listTimeTypes();
        const count = Array.isArray(results) ? results.length : 0;
        if (count === 0) {
            console.log('⚠️  No time types found (this may be expected if time tracking is not configured)');
            return true; // Don't fail if no time types exist
        }
        console.log(`✅ Found ${count} time types`);
        if (results[0]) {
            console.log(`   First time type: ${results[0].Name} (ID: ${results[0].ID})`);
        }
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
async function testSearchTimeEntries() {
    console.log('\n⏱️  Testing: Search Time Entries');
    console.log('   URL: POST', TDX_BASE_URL + '/api/time/search');
    try {
        // Get current date and 30 days ago
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        const results = await client.searchTimeEntries({
            StartDate: startDate.toISOString().split('T')[0],
            EndDate: endDate.toISOString().split('T')[0],
            MaxResults: 5
        });
        const count = Array.isArray(results) ? results.length : 0;
        if (count === 0) {
            console.log('⚠️  No time entries found in the last 30 days (this may be expected)');
            return true; // Don't fail if no time entries exist
        }
        console.log(`✅ Found ${count} time entries`);
        if (results[0]) {
            console.log(`   First entry: ${results[0].Minutes || 0} minutes on ${results[0].DateWorked || 'N/A'}`);
        }
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
async function testGetTimeReport() {
    console.log('\n📊 Testing: Get Time Report');
    const reportDate = new Date().toISOString().split('T')[0];
    console.log('   URL: GET', TDX_BASE_URL + `/api/time/report/${reportDate}`);
    try {
        const result = await client.getTimeReport(reportDate);
        console.log('✅ Retrieved time report successfully');
        if (result) {
            const entryCount = result.TimeEntries?.length || 0;
            console.log(`   Report contains ${entryCount} time entries`);
        }
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
async function testAuth() {
    console.log('🔐 Testing: Authentication');
    console.log('   URL: POST', TDX_BASE_URL + '/api/auth');
    try {
        // This will trigger authentication automatically
        await client.listTimeTypes();
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
    console.log('Starting Time API tests...\n');
    const results = {
        auth: await testAuth(),
        listTimeTypes: await testListTimeTypes(),
        searchTimeEntries: await testSearchTimeEntries(),
        getTimeReport: await testGetTimeReport(),
    };
    console.log('\n---');
    console.log('📈 Test Results:');
    console.log(`   Authentication:      ${results.auth ? '✅' : '❌'}`);
    console.log(`   List Time Types:     ${results.listTimeTypes ? '✅' : '❌'}`);
    console.log(`   Search Time Entries: ${results.searchTimeEntries ? '✅' : '❌'}`);
    console.log(`   Get Time Report:     ${results.getTimeReport ? '✅' : '❌'}`);
    const passed = Object.values(results).filter(Boolean).length;
    const total = Object.values(results).length;
    console.log(`\n${passed}/${total} tests passed`);
    if (!results.auth) {
        console.log('\n💡 Hint: Authentication failed. Check your credentials.');
    }
    else if (!results.listTimeTypes && !results.searchTimeEntries) {
        console.log('\n💡 Hint: Time API endpoints may not be available in your TeamDynamix instance.');
        console.log('   Time & Expense module may not be enabled or configured.');
    }
    process.exit(passed === total ? 0 : 1);
}
runTests().catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=test-time.js.map