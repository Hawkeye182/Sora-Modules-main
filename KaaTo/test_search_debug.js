// Test simple para verificar el search
const fetch = require('node-fetch');

async function testSearch() {
    console.log('🔍 TESTING SEARCH API\n');
    
    try {
        const response = await fetch('https://kaa.to/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Origin': 'https://kaa.to',
                'Referer': 'https://kaa.to/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            body: JSON.stringify({ query: 'bleach' })
        });
        
        console.log(`Status: ${response.status}`);
        const data = await response.text();
        console.log(`Response length: ${data.length}`);
        console.log(`Raw response: ${data.substring(0, 500)}`);
        
        if (response.status === 200) {
            try {
                const parsed = JSON.parse(data);
                console.log('\n✅ JSON parsed successfully');
                console.log('Data structure:', Object.keys(parsed));
                
                if (parsed.result && Array.isArray(parsed.result)) {
                    console.log(`Found ${parsed.result.length} results`);
                    if (parsed.result.length > 0) {
                        console.log('First result:', JSON.stringify(parsed.result[0], null, 2));
                    }
                } else {
                    console.log('❌ No result array found');
                    console.log('Full response:', JSON.stringify(parsed, null, 2));
                }
            } catch (e) {
                console.log('❌ Failed to parse JSON:', e.message);
            }
        }
        
    } catch (error) {
        console.error('❌ Search failed:', error.message);
    }
}

testSearch();
