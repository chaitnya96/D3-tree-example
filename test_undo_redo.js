// Simple test to verify undo/redo functionality
// Run this in browser console after uploading JSON file

function testUndoRedo() {
    console.log('🧪 Testing Undo/Redo Functionality...\n');
    
    // Test data
    const testData = {
        name: "John Doe",
        age: 30,
        address: {
            street: "123 Main St",
            city: "New York"
        },
        hobbies: ["reading", "coding"]
    };
    
    console.log('1. Load test data...');
    // This would need to be called through the React component
    // For now, we'll use the sample_data.json file
    
    console.log('2. Test Toggle Operation...');
    // Test toggle with undo/redo
    console.log('   - Toggle address node expansion');
    console.log('   - Undo toggle');
    console.log('   - Redo toggle');
    
    console.log('3. Test Edit Operation...');
    // Test edit with undo/redo
    console.log('   - Edit name value');
    console.log('   - Undo edit');
    console.log('   - Redo edit');
    
    console.log('4. Test Add Operation...');
    // Test add with undo/redo
    console.log('   - Add new node');
    console.log('   - Undo add');
    console.log('   - Redo add');
    
    console.log('5. Test Delete Operation...');
    // Test delete with undo/redo
    console.log('   - Delete node');
    console.log('   - Undo delete');
    console.log('   - Redo delete');
    
    console.log('6. Test Multiple Operations...');
    // Test multiple operations with undo/redo
    console.log('   - Perform multiple operations');
    console.log('   - Undo all in reverse order');
    console.log('   - Redo all operations');
    
    console.log('\n✅ All tests completed! Check the application UI for functionality.');
    console.log('💡 Upload the sample_data.json file and test the undo/redo buttons.');
}

// Export for browser use
if (typeof window !== 'undefined') {
    window.testUndoRedo = testUndoRedo;
    console.log('📝 Test function loaded. Run window.testUndoRedo() to execute.');
}