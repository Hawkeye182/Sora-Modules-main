const fetch = require('node-fetch');

// Simular fetchv2 de Sora
function fetchv2(url, headers = {}) {
    console.log(`📡 Fetching: ${url}`);
    
    return fetch(url, {
        method: 'GET',
        headers: headers
    })
    .then(response => {
        console.log(`📊 Status: ${response.status}`);
        return response.text().then(data => ({
            status: response.status,
            headers: response.headers,
            _data: data
        }));
    })
    .catch(error => {
        console.log(`❌ Error:`, error.message);
        return null;
    });
}

// Función soraFetch del módulo
function soraFetch(url, headers = {}) {
    const defaultHeaders = {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'User-Agent': 'Mozilla/5.0 (compatible; SoraApp/1.0)'
    };
    
    const finalHeaders = { ...defaultHeaders, ...headers };
    
    console.log('🔗 Fetching:', url);
    
    if (typeof fetchv2 !== 'undefined') {
        return fetchv2(url, finalHeaders);
    } else if (typeof fetch !== 'undefined') {
        return fetch(url, {
            method: 'GET',
            headers: finalHeaders
        }).then(response => {
            return response.text().then(data => ({
                status: response.status,
                headers: response.headers,
                _data: data
            }));
        });
    } else {
        console.log('❌ No fetch function available');
        return Promise.reject(new Error('No fetch function available'));
    }
}

// Función de búsqueda del módulo
function searchResults(query) {
    return soraFetch(`https://kaa.to/api/search?query=${encodeURIComponent(query)}`)
        .then(response => {
            if (!response || response.status !== 200) {
                console.log('❌ Search failed:', response ? response.status : 'no response');
                return [];
            }
            
            console.log('✅ Search response received');
            console.log('Response preview:', response._data.substring(0, 200));
            
            const searchData = JSON.parse(response._data);
            console.log('✅ JSON parsed successfully');
            console.log('Search data keys:', Object.keys(searchData));
            
            if (searchData.data && Array.isArray(searchData.data)) {
                console.log('✅ Found search results:', searchData.data.length);
                
                return searchData.data.slice(0, 20).map(anime => {
                    const result = {
                        title: anime.name,
                        url: `https://kaa.to/anime/${anime.slug}`,
                        image: anime.poster?.formats?.thumbnail?.url ? 
                            `https://kaa.to${anime.poster.formats.thumbnail.url}` : 
                            'https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/KaaTo/logo.png'
                    };
                    console.log('Result:', result.title, '|', result.url);
                    return result;
                });
            } else {
                console.log('❌ No data array found in response');
                return [];
            }
        })
        .catch(error => {
            console.log('❌ Search error:', error.message);
            return [];
        });
}

async function testAlternativeModule() {
    console.log('🧪 TESTING ALTERNATIVE MODULE v4.1.0\n');
    
    // Test de búsqueda
    console.log('1️⃣ Testing search...');
    const searchQuery = 'bleach';
    
    try {
        const results = await searchResults(searchQuery);
        
        if (results && results.length > 0) {
            console.log('✅ Search successful!');
            console.log(`📊 Found ${results.length} results`);
            console.log('📝 First result:', results[0]);
            
            // Test de detalles
            console.log('\n2️⃣ Testing details...');
            const firstResult = results[0];
            
            // ... El resto del test aquí
            console.log('🎯 Alternative module search is working!');
            
        } else {
            console.log('❌ No search results found');
        }
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
    }
}

testAlternativeModule().catch(console.error);
