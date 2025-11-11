import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
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
console.log('🔧 Testing POST /api/627/tickets/554096/feed\n');
async function testFeedWithDifferentFormats() {
    // Authenticate first
    const authResponse = await axios.post(`${TDX_BASE_URL}/api/auth`, {
        username: TDX_USERNAME,
        password: TDX_PASSWORD
    });
    const token = authResponse.data;
    const client = axios.create({
        baseURL: TDX_BASE_URL,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    // Test 1: With just Comments
    console.log('Test 1: Just Comments field');
    try {
        const result = await client.post('/api/627/tickets/554096/feed', {
            Comments: 'Hello from test'
        });
        console.log('✅ Success with just Comments');
        return true;
    }
    catch (error) {
        console.error('❌ Failed:', error.response?.status, error.response?.data?.Message || error.message);
    }
    // Test 2: With Comments and IsPrivate
    console.log('\nTest 2: Comments + IsPrivate');
    try {
        const result = await client.post('/api/627/tickets/554096/feed', {
            Comments: 'Hello from test 2',
            IsPrivate: false
        });
        console.log('✅ Success with Comments + IsPrivate');
        return true;
    }
    catch (error) {
        console.error('❌ Failed:', error.response?.status, error.response?.data?.Message || error.message);
    }
    // Test 3: Minimal - empty object
    console.log('\nTest 3: Check what fields are required');
    try {
        const result = await client.post('/api/627/tickets/554096/feed', {});
        console.log('✅ Success with empty object');
        return true;
    }
    catch (error) {
        console.error('❌ Failed:', error.response?.status);
        console.error('   Message:', error.response?.data?.Message || error.message);
        if (error.response?.data?.Errors) {
            console.error('   Errors:', error.response.data.Errors);
        }
    }
    return false;
}
testFeedWithDifferentFormats().catch(error => {
    console.error('\n💥 Fatal error:', error.message);
    process.exit(1);
});
//# sourceMappingURL=test-post-edit.js.map