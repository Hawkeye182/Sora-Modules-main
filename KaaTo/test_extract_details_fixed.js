// Test de la función extractDetails actualizada
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
async function extractDetails(url) {
    console.log('📄 [v11.5.8 STYLE] extractDetails CALLED with URL:', url);
    try {
        const slug = url.split('/anime/')[1] || url.split('/').pop();
        const response = await fetchv2(`https://kaa.to/api/show/${slug}`);
        
        if (response && response._data) {
            let details = response._data;
            if (typeof details === 'string') {
                details = JSON.parse(details);
            }
            
            const result = {
                description: details.synopsis || details.description || "Sin descripción disponible",
                aliases: [details.title_en, details.title_original].filter(title => title && title !== details.title).join(', ') || '',
                airdate: details.year ? `Año: ${details.year}` : 'Aired: Unknown'
            };
            
            return JSON.stringify([result]);
        }
        return JSON.stringify([{description: "Error obteniendo detalles", aliases: "", airdate: "Aired: Unknown"}]);
    } catch (error) {
        return JSON.stringify([{description: 'Error: ' + error.message, aliases: '', airdate: 'Aired: Unknown'}]);
    }
}

async function testDetails() {
    console.log('🧪 Testing extractDetails function...');
    
    const testUrls = [
        'https://kaa.to/anime/dandadan-da3b',
        'https://kaa.to/anime/one-piece',
        'https://kaa.to/anime/naruto'
    ];
    
    for (const url of testUrls) {
        console.log(`\n📄 Testing: ${url}`);
        try {
            const result = await extractDetails(url);
            const parsed = JSON.parse(result);
            console.log('✅ Result:', parsed[0]);
        } catch (error) {
            console.log('❌ Error:', error.message);
        }
    }
}

testDetails().catch(console.error);
