import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { TDXClient } from './client.js';
// Load credentials from production credentials file
const prodCredsFile = process.env.TDX_PROD_CREDENTIALS_FILE || 'C:\\Users\\ben.heard\\.config\\tdx\\prod-credentials.json';
if (!existsSync(prodCredsFile)) {
    console.error(`Credentials file not found: ${prodCredsFile}`);
    process.exit(1);
}
const prodCreds = JSON.parse(readFileSync(prodCredsFile, 'utf8'));
let password = prodCreds.TDX_PASSWORD || '';
// Decrypt DPAPI password if prefixed with "dpapi:"
if (password.startsWith('dpapi:')) {
    const encryptedPassword = password.substring(6);
    const psCommand = `Add-Type -AssemblyName System.Security; [Text.Encoding]::UTF8.GetString([Security.Cryptography.ProtectedData]::Unprotect([Convert]::FromBase64String('${encryptedPassword}'), $null, 'CurrentUser'))`;
    password = execSync(`powershell -Command "${psCommand}"`, { encoding: 'utf8' }).trim();
    console.log('✅ Decrypted DPAPI password\n');
}
const TDX_BASE_URL = prodCreds.TDX_BASE_URL;
const TDX_USERNAME = prodCreds.TDX_USERNAME;
const TDX_PASSWORD = password;
const TDX_TICKET_APP_IDS = prodCreds.TDX_TICKET_APP_IDS;
async function testReportStructure() {
    const client = new TDXClient(TDX_BASE_URL, TDX_USERNAME, TDX_PASSWORD, TDX_TICKET_APP_IDS);
    try {
        const reportId = 280347; // Calcifer's Coders - In Progress Tickets
        console.log('🔍 Testing different API endpoints for report filter data...\n');
        // Test 1: Standard GET with withData=false
        console.log('1️⃣ GET /api/reports/{id} (withData=false)');
        const report1 = await client.runReport(reportId, undefined, false);
        console.log('Keys returned:', Object.keys(report1).join(', '));
        console.log('');
        // Test 2: Standard GET with withData=true
        console.log('2️⃣ GET /api/reports/{id} (withData=true)');
        const report2 = await client.runReport(reportId, undefined, true);
        console.log('Keys returned:', Object.keys(report2).join(', '));
        console.log('');
        // Test 3: Try to access the report via the base client to see raw response
        console.log('3️⃣ Raw GET request to check for hidden properties...');
        const response = await client.client.get(`/api/reports/${reportId}`);
        const allKeys = Object.keys(response.data);
        console.log('All keys in response:', allKeys.join(', '));
        // Look for any properties that might contain filter info
        const filterRelatedKeys = allKeys.filter(key => key.toLowerCase().includes('filter') ||
            key.toLowerCase().includes('search') ||
            key.toLowerCase().includes('criteria') ||
            key.toLowerCase().includes('where') ||
            key.toLowerCase().includes('condition') ||
            key.toLowerCase().includes('parameter'));
        console.log('Filter-related keys:', filterRelatedKeys.length > 0 ? filterRelatedKeys.join(', ') : 'NONE FOUND');
        console.log('');
        // Test 4: Check if there's a different endpoint for report definition
        console.log('4️⃣ Attempting GET /api/reports/{id}/definition (may 404)...');
        try {
            const defResponse = await client.client.get(`/api/reports/${reportId}/definition`);
            console.log('✅ Definition endpoint exists!');
            console.log('Keys:', Object.keys(defResponse.data).join(', '));
        }
        catch (error) {
            if (error.response?.status === 404) {
                console.log('❌ Endpoint does not exist (404)');
            }
            else {
                console.log('❌ Error:', error.response?.status || error.message);
            }
        }
        console.log('');
        // Test 5: Try accessing report builder/designer endpoints
        console.log('5️⃣ Attempting GET /api/reports/{id}/builder (may 404)...');
        try {
            const builderResponse = await client.client.get(`/api/reports/${reportId}/builder`);
            console.log('✅ Builder endpoint exists!');
            console.log('Keys:', Object.keys(builderResponse.data).join(', '));
        }
        catch (error) {
            if (error.response?.status === 404) {
                console.log('❌ Endpoint does not exist (404)');
            }
            else {
                console.log('❌ Error:', error.response?.status || error.message);
            }
        }
        console.log('');
        // Test 6: List all reports and check if they have filter info
        console.log('6️⃣ Checking report list endpoint for filter metadata...');
        const reports = await client.listReports(5);
        if (reports.length > 0) {
            console.log('Keys in report list item:', Object.keys(reports[0]).join(', '));
            const filterKeys = Object.keys(reports[0]).filter(key => key.toLowerCase().includes('filter') ||
                key.toLowerCase().includes('search') ||
                key.toLowerCase().includes('criteria'));
            console.log('Filter-related keys:', filterKeys.length > 0 ? filterKeys.join(', ') : 'NONE FOUND');
        }
        console.log('');
        // Test 7: Deep inspection of the report object
        console.log('7️⃣ Deep inspection of report object...');
        console.log('Full report object structure:');
        console.log(JSON.stringify(report1, null, 2));
    }
    catch (error) {
        console.error('❌ Error:', error);
    }
}
testReportStructure();
//# sourceMappingURL=test-report-structure.js.map