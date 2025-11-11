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
async function testReportDetails() {
    const client = new TDXClient(TDX_BASE_URL, TDX_USERNAME, TDX_PASSWORD, TDX_TICKET_APP_IDS);
    try {
        // Search for the report
        console.log('🔍 Searching for report: "Calcifer\'s Coders - In Progress Tickets"');
        const reports = await client.searchReports('Calcifer', 10);
        console.log(`Found ${reports.length} report(s)\n`);
        if (reports.length > 0) {
            // Show all matching reports
            reports.forEach((report) => {
                console.log(`- ${report.Name} (ID: ${report.ID})`);
            });
            // Get details of the first matching report
            const reportId = reports[0].ID;
            console.log(`\n📊 Getting report details for ID ${reportId}...`);
            const reportDetails = await client.runReport(reportId, undefined, false);
            console.log('\nReport Details (without data):');
            console.log(JSON.stringify(reportDetails, null, 2));
            // Check what properties are available
            console.log('\n📋 Available properties:');
            Object.keys(reportDetails).forEach(key => {
                console.log(`  - ${key}: ${typeof reportDetails[key]}`);
            });
            // Now get ticket 29207761 to see why it's not in the report
            console.log('\n\n🎫 Getting ticket 29207761...');
            const ticket = await client.getTicket(29207761);
            console.log('Ticket Details:');
            console.log(`  - ID: ${ticket.ID}`);
            console.log(`  - Title: ${ticket.Title}`);
            console.log(`  - Status: ${ticket.StatusName} (ID: ${ticket.StatusID})`);
            console.log(`  - Priority: ${ticket.PriorityName} (ID: ${ticket.PriorityID})`);
            console.log(`  - Responsible: ${ticket.ResponsibleFullName} (UID: ${ticket.ResponsibleUid})`);
            console.log(`  - Classification: ${ticket.ClassificationName}`);
            console.log(`  - Modified: ${ticket.ModifiedDate}`);
            // Run the report with data to see what tickets ARE in it
            console.log('\n\n📊 Running report with data (first 10 rows)...');
            const reportWithData = await client.runReport(reportId, undefined, true);
            if (reportWithData.DataRows && reportWithData.DataRows.length > 0) {
                console.log(`Found ${reportWithData.DataRows.length} tickets in report\n`);
                // Check if our ticket is in the report
                const ourTicket = reportWithData.DataRows.find((row) => row.TicketID === 29207761);
                if (ourTicket) {
                    console.log('✅ Ticket 29207761 IS in the report');
                }
                else {
                    console.log('❌ Ticket 29207761 is NOT in the report');
                    console.log('\nFirst 5 tickets in report:');
                    reportWithData.DataRows.slice(0, 5).forEach((row) => {
                        console.log(`  - #${row.TicketID}: ${row.Title} (Status: ${row.StatusName}, Resp: ${row.ResponsibleFullName})`);
                    });
                }
            }
        }
    }
    catch (error) {
        console.error('❌ Error:', error);
    }
}
testReportDetails();
//# sourceMappingURL=test-report-details.js.map