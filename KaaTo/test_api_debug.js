// Test para debugging de KaaTo API
async function testKaaToAPI() {
    console.log('🧪 Testing KaaTo API for Bleach...');
    
    try {
        // Test the exact same URL as the logs
        const testUrl = 'https://kaa.to/api/show/bleach-f24c';
        console.log('🌐 Testing URL:', testUrl);
        
        const response = await fetch(testUrl);
        const data = await response.json();
        
        console.log('📋 API Response keys:', Object.keys(data));
        console.log('📄 Full data:', JSON.stringify(data, null, 2));
        
        // Test specific fields
        console.log('🎯 Fields analysis:');
        console.log('  - synopsis:', data.synopsis);
        console.log('  - description:', data.description);
        console.log('  - title_en:', data.title_en);
        console.log('  - title_original:', data.title_original);
        console.log('  - year:', data.year);
        console.log('  - alternative_names:', data.alternative_names);
        console.log('  - aired_from:', data.aired_from);
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
    }
}

testKaaToAPI();
