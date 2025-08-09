// Test de la función extractDetails de v11.5.8
const https = require('https');

function fetchData(url, options = {}) {
    return new Promise((resolve, reject) => {
        const requestOptions = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
                'Referer': 'https://kaa.to/',
                'Origin': 'https://kaa.to',
                ...options.headers
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
        req.end();
    });
}

async function testDetailsV11_5_8() {
    console.log('🧪 Testing extractDetails v11.5.8...');
    
    // Test con diferentes animes
    const testAnimes = [
        'dandadan-da3b',
        'bleach-sennen-kessen-hen-soukoku-tan',
        'one-piece'
    ];
    
    for (const slug of testAnimes) {
        console.log(`\n📄 Testing details for: ${slug}`);
        try {
            const response = await fetchData(`https://kaa.to/api/show/${slug}`);
            console.log(`Status: ${response.status}`);
            
            if (response.status === 200 && response._data) {
                let details = JSON.parse(response._data);
                console.log('📋 Raw API response keys:', Object.keys(details));
                
                // Extraer datos como en v11.5.8
                const result = {
                    description: details.synopsis || details.description || "Sin descripción disponible",
                    aliases: [details.title_en, details.title_original].filter(title => title && title !== details.title).join(', ') || '',
                    airdate: details.year ? `Año: ${details.year}` : 'Aired: Unknown'
                };
                
                console.log('✅ Extracted details:');
                console.log('- Description:', result.description.substring(0, 100) + '...');
                console.log('- Aliases:', result.aliases);
                console.log('- Airdate:', result.airdate);
                
                // Mostrar algunos campos adicionales disponibles
                console.log('\n📊 Additional fields available:');
                console.log('- title:', details.title);
                console.log('- year:', details.year);
                console.log('- status:', details.status);
                console.log('- type:', details.type);
                console.log('- studios:', details.studios);
                console.log('- genres:', details.genres);
            } else {
                console.log('❌ Failed to get details');
            }
        } catch (error) {
            console.log('❌ Error:', error.message);
        }
    }
}

testDetailsV11_5_8().catch(console.error);
