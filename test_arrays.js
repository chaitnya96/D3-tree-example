// Test enhanced array functionality for Redfish JSON
// Run this in the browser console after loading sample_data.json

function testArrayEnhancements() {
    console.log('🔧 Testing Enhanced Array Functionality...\n');
    
    console.log('1. Load sample_data.json and check array visualizations:');
    console.log('   ✅ Members arrays should show as "Members [48] (Collection)"');
    console.log('   ✅ @Message.ExtendedInfo should show as "@Message.ExtendedInfo [1] (Messages)"');
    console.log('   ✅ Array elements should show as "[0] → /1/redfish/v1/System"');
    console.log('   ✅ Different array types should have different colors:');
    console.log('      - Collection: Green (#2ecc71)');
    console.log('      - Messages: Purple (#9b59b6)');
    console.log('      - References: Blue (#3498db)');
    console.log('      - Generic: Teal (#4ecdc4)');
    
    console.log('\n2. Test Array Selection and Property Panel:');
    console.log('   ✅ Click on a "Members" array node');
    console.log('   ✅ Property panel should show array metadata:');
    console.log('      - Array Type: collection');
    console.log('      - Item Count: 48');
    console.log('      - Count Property: Members@odata.count');
    console.log('   ✅ Array Operations section should appear');
    console.log('   ✅ "Add Reference" and "Validate References" buttons should be visible');
    
    console.log('\n3. Test Collection Operations:');
    console.log('   ✅ Click "Add Reference" button');
    console.log('   ✅ New reference should be added with template @odata.id');
    console.log('   ✅ Click "Validate References" button');
    console.log('   ✅ Should validate all @odata.id paths');
    
    console.log('\n4. Test Message Arrays:');
    console.log('   ✅ Click on "@Message.ExtendedInfo" array');
    console.log('   ✅ Should show as Messages type');
    console.log('   ✅ "Add Message" button should be available');
    console.log('   ✅ Click "Add Message" to add new message template');
    
    console.log('\n5. Test Count Synchronization:');
    console.log('   ✅ Add or remove items from Members array');
    console.log('   ✅ Click "Sync Count" button');
    console.log('   ✅ Members@odata.count should update to match actual array length');
    
    console.log('\n6. Visual Verification:');
    console.log('   ✅ Legend should show new array types');
    console.log('   ✅ Array nodes should have proper color coding');
    console.log('   ✅ Array element display should show reference paths');
    console.log('   ✅ Array operations should be responsive on mobile');
    
    console.log('\n📋 Specific Test Cases for sample_data.json:');
    console.log('1. Systems.Members [48] - Collection of system references');
    console.log('2. Systems.@Message.ExtendedInfo [1] - Message array');
    console.log('3. AccountService.Accounts.ManagerAccounts.Members [2] - Account references');
    console.log('4. AccountService.Roles.Members [3] - Role references');
    console.log('5. SessionService.Sessions.Members [1] - Session references');
}

function testArrayTypes() {
    console.log('🎨 Testing Array Type Detection...\n');
    
    const testCases = [
        {
            name: 'Systems.Members',
            expected: 'Collection (Green)',
            description: 'Should detect as collection with @odata.id references'
        },
        {
            name: 'Systems.@Message.ExtendedInfo',
            expected: 'Messages (Purple)',
            description: 'Should detect as message array with OEM structure'
        },
        {
            name: 'AccountService.Accounts.ManagerAccounts.Members',
            expected: 'Collection (Green)',
            description: 'Should detect as collection with account references'
        },
        {
            name: 'AccountService.Roles.Members',
            expected: 'Collection (Green)',
            description: 'Should detect as collection with role references'
        }
    ];
    
    testCases.forEach((testCase, index) => {
        console.log(`${index + 1}. ${testCase.name}`);
        console.log(`   Expected: ${testCase.expected}`);
        console.log(`   Test: ${testCase.description}`);
        console.log('');
    });
}

function testArrayOperations() {
    console.log('⚙️ Testing Array Operations...\n');
    
    console.log('Collection Operations:');
    console.log('1. Add Reference:');
    console.log('   - Creates new object with @odata.id template');
    console.log('   - Uses next available index as name');
    console.log('   - Template: { "@odata.id": "/redfish/v1/NewResource" }');
    
    console.log('\n2. Validate References:');
    console.log('   - Checks all @odata.id values');
    console.log('   - Validates Redfish path format (/redfish/v1/...)');
    console.log('   - Reports invalid references');
    
    console.log('\n3. Sync Count:');
    console.log('   - Updates Members@odata.count property');
    console.log('   - Matches actual array length');
    console.log('   - Maintains JSON structure integrity');
    
    console.log('\nMessage Operations:');
    console.log('1. Add Message:');
    console.log('   - Creates OEM message template');
    console.log('   - Includes Microsoft OCS structure');
    console.log('   - Sets CompletionCode to Success');
    
    console.log('\n🎯 Manual Testing Instructions:');
    console.log('1. Load sample_data.json file');
    console.log('2. Navigate to Systems → Members');
    console.log('3. Click on Members array node');
    console.log('4. Try each operation button');
    console.log('5. Verify results in tree visualization');
    console.log('6. Test undo/redo functionality');
}

// Export for browser use
if (typeof window !== 'undefined') {
    window.testArrayEnhancements = testArrayEnhancements;
    window.testArrayTypes = testArrayTypes;
    window.testArrayOperations = testArrayOperations;
    
    console.log('📝 Array enhancement tests loaded.');
    console.log('   Run window.testArrayEnhancements() for overview');
    console.log('   Run window.testArrayTypes() for type detection tests');
    console.log('   Run window.testArrayOperations() for operation tests');
}