// Test de la función searchResults de v11.5.8
const https = require('https');

function fetchv2(url, headers = {}, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const requestOptions = {
            method: method,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
                'Referer': 'https://kaa.to/',
                'Origin': 'https://kaa.to',
                ...headers
            }
        };

        const req = https.request(url, requestOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    _data: data
                });
            });
        });

        req.on('error', reject);
        
        if (body) {
            req.write(body);
        }
        req.end();
    });
}

// Función exacta de v11.5.8
async function searchResults(keyword) {
    console.log('🔍 [v11.5.8] searchResults CALLED with keyword:', keyword);
    try {
        const response = await fetchv2('https://kaa.to/api/search', {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': 'https://kaa.to',
            'Referer': 'https://kaa.to/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }, 'POST', JSON.stringify({ query: keyword }));
        
        console.log('Response status:', response.status);
        console.log('Response data length:', response._data ? response._data.length : 0);
        
        if (response && response.status === 200 && response._data) {
            let data = response._data;
            if (typeof data === 'string') {
                data = JSON.parse(data);
            }
            
            console.log('Parsed data type:', typeof data);
            console.log('Is array:', Array.isArray(data));
            if (Array.isArray(data)) {
                console.log('Array length:', data.length);
                if (data.length > 0) {
                    console.log('First item keys:', Object.keys(data[0]));
                }
            }
            
            if (Array.isArray(data)) {
                const results = data.map(item => ({
                    title: item.title || 'Unknown Title',
                    image: item.poster && item.poster.hq ? 
                           `https://kaa.to/image/poster/${item.poster.hq}.webp` : '',
                    href: `https://kaa.to/anime/${item.slug}`
                }));
                
                return JSON.stringify(results);
            } else {
                return JSON.stringify([]);
            }
        } else {
            return JSON.stringify([]);
        }
    } catch (error) {
        console.log('Error:', error.message);
        return JSON.stringify([]);
    }
}

async function testSearch() {
    console.log('🧪 Testing searchResults v11.5.8...');
    
    const keywords = ['naruto', 'one piece', 'bleach'];
    
    for (const keyword of keywords) {
        console.log(`\n🔍 Searching for: ${keyword}`);
        try {
            const result = await searchResults(keyword);
            const parsed = JSON.parse(result);
            console.log(`✅ Found ${parsed.length} results`);
            if (parsed.length > 0) {
                console.log('First result:', parsed[0]);
            }
        } catch (error) {
            console.log('❌ Error:', error.message);
        }
    }
}

testSearch().catch(console.error);
