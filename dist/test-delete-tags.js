import { readFileSync, existsSync } from 'fs';
import axios from 'axios';
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
const appId = '129';
const ticketId = 29060683;
console.log('🔧 Testing DELETE /api/{appId}/tickets/{id}/tags\n');
async function testDeleteTags() {
    // Authenticate
    console.log('📝 Authenticating...');
    const authResponse = await axios.post(`${TDX_BASE_URL}/api/auth`, {
        username: TDX_USERNAME,
        password: TDX_PASSWORD
    });
    const token = authResponse.data;
    console.log('✅ Authenticated\n');
    const client = axios.create({
        baseURL: TDX_BASE_URL,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    // Delete tags: test, test1, test2, test3, test4
    const tagsToDelete = ['test', 'test1', 'test2', 'test3', 'test4'];
    console.log(`📝 Deleting tags from ticket #${ticketId}:`);
    console.log(`   Tags to delete: ${tagsToDelete.join(', ')}\n`);
    try {
        const response = await client.delete(`/api/${appId}/tickets/${ticketId}/tags`, {
            data: tagsToDelete
        });
        console.log('✅ DELETE request successful');
        console.log('   Status:', response.status);
        console.log('   Status text:', response.statusText);
        console.log('   Response body:', JSON.stringify(response.data));
        console.log('   Response type:', typeof response.data);
        if (response.status === 200) {
            console.log('\n✅ Tags should now be deleted!');
            console.log('   Check the TeamDynamix UI to verify.');
        }
        else if (response.status === 304) {
            console.log('\n⚠️  Not Modified (304) - Tags may not have existed');
        }
    }
    catch (error) {
        console.error('❌ DELETE failed');
        console.error('   Status:', error.response?.status);
        console.error('   Status text:', error.response?.statusText);
        console.error('   Error message:', error.message);
        if (error.response?.data) {
            console.error('   Response data:', JSON.stringify(error.response.data));
        }
    }
}
testDeleteTags().catch(error => {
    console.error('\n💥 Fatal error:', error.message);
    process.exit(1);
});
//# sourceMappingURL=test-delete-tags.js.map