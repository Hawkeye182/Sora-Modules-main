// Test búsqueda exactamente como en v11.5.11 que funcionaba
const https = require('https');

async function fetchv2(url, headers = {}, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || 443,
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: headers
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    _data: data
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (body) {
            req.write(body);
        }
        req.end();
    });
}

async function testSearch() {
    console.log('🔍 Testing search exactly like v11.5.11...');
    
    try {
        const response = await fetchv2('https://kaa.to/api/search', {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': 'https://kaa.to',
            'Referer': 'https://kaa.to/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }, 'POST', JSON.stringify({ query: 'naruto' }));
        
        console.log('Status:', response.status);
        
        if (response && response.status === 200 && response._data) {
            let data = response._data;
            if (typeof data === 'string') {
                data = JSON.parse(data);
            }
            
            console.log('Response type:', typeof data);
            console.log('Is array:', Array.isArray(data));
            
            if (Array.isArray(data)) {
                console.log(`✅ Found ${data.length} results`);
                if (data.length > 0) {
                    console.log('First result:', data[0]);
                    
                    const results = data.map(item => ({
                        title: item.title || 'Unknown Title',
                        image: item.poster && item.poster.hq ? 
                               `https://kaa.to/image/poster/${item.poster.hq}.webp` : '',
                        href: `https://kaa.to/anime/${item.slug}`
                    }));
                    
                    console.log('Formatted results:');
                    results.slice(0, 3).forEach((result, i) => {
                        console.log(`${i+1}. ${result.title} - ${result.href}`);
                    });
                } else {
                    console.log('❌ Array is empty');
                }
            } else {
                console.log('❌ Response is not an array');
                console.log('Keys:', Object.keys(data));
            }
        } else {
            console.log('❌ Request failed or no data');
        }
    } catch (error) {
        console.log('❌ Search error:', error.message);
    }
}

testSearch();
