// Test para ver la estructura exacta del poster
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

async function debugPosterStructure() {
    console.log('🧪 Debugging poster structure...');
    
    try {
        const response = await fetchv2('https://kaa.to/api/search', {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': 'https://kaa.to',
            'Referer': 'https://kaa.to/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }, 'POST', JSON.stringify({ query: 'naruto' }));
        
        if (response && response.status === 200 && response._data) {
            let data = JSON.parse(response._data);
            
            if (data.length > 0) {
                const firstItem = data[0];
                console.log('First item complete:', JSON.stringify(firstItem, null, 2));
                console.log('\n🖼️ Poster structure:');
                console.log('poster:', firstItem.poster);
                console.log('typeof poster:', typeof firstItem.poster);
                
                if (firstItem.poster) {
                    console.log('poster keys:', Object.keys(firstItem.poster));
                    console.log('poster.hq:', firstItem.poster.hq);
                    console.log('poster.md:', firstItem.poster.md);
                    console.log('poster.sm:', firstItem.poster.sm);
                }
            }
        }
    } catch (error) {
        console.log('Error:', error.message);
    }
}

debugPosterStructure().catch(console.error);
