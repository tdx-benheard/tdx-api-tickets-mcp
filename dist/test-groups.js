import { TDXClient } from './client.js';
import { readFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Load credentials from dev-credentials.json
const credentialsPath = 'C:\\Users\\ben.heard\\.config\\tdx\\dev-credentials.json';
const credentials = JSON.parse(readFileSync(credentialsPath, 'utf8'));
const TDX_BASE_URL = credentials.TDX_BASE_URL;
const TDX_USERNAME = credentials.TDX_USERNAME;
const TDX_PASSWORD = credentials.TDX_PASSWORD;
const TDX_TICKET_APP_IDS = credentials.TDX_TICKET_APP_IDS;
// Parse app IDs
const appIds = TDX_TICKET_APP_IDS.split(',').map((id) => id.trim()).filter((id) => id.length > 0);
console.log('\n🧪 Testing TeamDynamix Groups API');
console.log('='.repeat(50));
console.log(`Environment: ${TDX_BASE_URL}`);
console.log(`User: ${TDX_USERNAME}`);
console.log(`App IDs: ${appIds.join(', ')}`);
console.log('='.repeat(50));
async function testGroupsAPI() {
    try {
        const client = new TDXClient(TDX_BASE_URL, TDX_USERNAME, TDX_PASSWORD, appIds);
        // Test 1: List all groups
        console.log('\n1️⃣  Testing listGroups()...');
        const allGroups = await client.listGroups(10); // Limit to 10 for readability
        console.log(`✅ Found ${allGroups.length} groups`);
        if (allGroups.length > 0) {
            console.log('   First group:', {
                ID: allGroups[0].ID,
                Name: allGroups[0].Name,
                IsActive: allGroups[0].IsActive
            });
        }
        else {
            console.warn('⚠️  Warning: No groups returned from listGroups()');
        }
        // Test 2: Search groups
        console.log('\n2️⃣  Testing searchGroups()...');
        const searchResults = await client.searchGroups('', 5); // Empty search to get first 5
        console.log(`✅ Found ${searchResults.length} groups via search`);
        if (searchResults.length > 0) {
            console.log('   First search result:', {
                ID: searchResults[0].ID,
                Name: searchResults[0].Name
            });
        }
        else {
            console.warn('⚠️  Warning: No groups returned from searchGroups()');
        }
        // Test 3: Get group by ID (if we have any groups)
        if (allGroups.length > 0) {
            const testGroupId = allGroups[0].ID;
            console.log(`\n3️⃣  Testing getGroup(${testGroupId})...`);
            const group = await client.getGroup(testGroupId);
            console.log('✅ Retrieved group:', {
                ID: group.ID,
                Name: group.Name,
                Description: group.Description,
                IsActive: group.IsActive
            });
        }
        else {
            console.log('\n3️⃣  Skipping getGroup() - no groups available');
        }
        console.log('\n' + '='.repeat(50));
        console.log('✅ All Groups API tests completed successfully!');
        console.log('='.repeat(50) + '\n');
    }
    catch (error) {
        console.error('\n❌ Test failed:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Stack trace:', error.stack);
        }
        process.exit(1);
    }
}
testGroupsAPI();
//# sourceMappingURL=test-groups.js.map