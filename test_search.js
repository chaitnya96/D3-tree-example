// Test search functionality
// Run this in the browser console after loading the application

function testSearchFunctionality() {
    console.log('🔍 Testing Search Functionality...\n');
    
    console.log('1. Search Instructions:');
    console.log('   - Upload the sample_data.json file');
    console.log('   - Go to the Search tab in the property panel');
    console.log('   - Try searching for:');
    console.log('     • Key search: "Name" (should find Name fields)');
    console.log('     • Value search: "Root Service" (should find the service name)');
    console.log('     • Value search: "System" (should find system-related entries)');
    console.log('     • Key search: "Members" (should find Members arrays)');
    
    console.log('\n2. Expected Behavior:');
    console.log('   ✅ Search results should appear in the right panel');
    console.log('   ✅ Current result should be highlighted with orange border');
    console.log('   ✅ Highlighted node should be larger and have shadow effect');
    console.log('   ✅ Parent nodes should auto-expand to show the result');
    console.log('   ✅ Tree should auto-center on the highlighted node');
    console.log('   ✅ Next/Previous buttons should navigate between results');
    console.log('   ✅ Search counter should show "X of Y" format');
    
    console.log('\n3. Test Cases:');
    console.log('   A. Search for "Name" in Key mode');
    console.log('   B. Use Next/Previous buttons to navigate');
    console.log('   C. Search for "System" in Value mode');
    console.log('   D. Check that highlighted nodes are visible');
    console.log('   E. Try searching for non-existent terms');
    
    console.log('\n4. Visual Checks:');
    console.log('   • Highlighted node: Orange (#ff6b35) background');
    console.log('   • Highlighted node: Red (#ff3300) border');
    console.log('   • Highlighted node: Larger size (12px radius vs 8px)');
    console.log('   • Highlighted node: Drop shadow effect');
    console.log('   • Tree centers on highlighted node automatically');
    
    console.log('\n✅ Manual testing required - check the above behaviors in the UI');
    console.log('💡 The search now supports all value types (string, number, boolean, etc.)');
    console.log('🎯 Parent nodes automatically expand to show search results');
}

// Enhanced test with specific search terms for the sample_data.json file
function testWithNestedOutput() {
    console.log('🧪 Testing with sample_data.json file...\n');
    
    const testCases = [
        {
            type: 'key',
            query: 'Name',
            expected: 'Should find Name fields in the JSON structure'
        },
        {
            type: 'value',
            query: 'Root Service',
            expected: 'Should find the root service name'
        },
        {
            type: 'key',
            query: 'Members',
            expected: 'Should find Members arrays'
        },
        {
            type: 'value',
            query: 'System',
            expected: 'Should find system-related entries'
        },
        {
            type: 'key',
            query: '@odata',
            expected: 'Should find OData-related keys'
        },
        {
            type: 'value',
            query: '48',
            expected: 'Should find the Members count value'
        }
    ];\
    
    testCases.forEach((testCase, index) => {\
        console.log(`${index + 1}. Search Type: ${testCase.type.toUpperCase()}`);\
        console.log(`   Query: "${testCase.query}"`);\
        console.log(`   Expected: ${testCase.expected}`);\
        console.log('');\
    });\
    
    console.log('📋 Run these tests manually in the application:');\
    console.log('1. Load sample_data.json file');\
    console.log('2. Go to Search tab');\
    console.log('3. Test each query above');\
    console.log('4. Use Next/Previous buttons for navigation');\
    console.log('5. Verify highlighting and auto-centering');\
}\

// Export for browser use\
if (typeof window !== 'undefined') {\
    window.testSearchFunctionality = testSearchFunctionality;\
    window.testWithNestedOutput = testWithNestedOutput;\
    console.log('📝 Search tests loaded.');\
    console.log('   Run window.testSearchFunctionality() for general tests');\
    console.log('   Run window.testWithNestedOutput() for specific JSON tests');\
}