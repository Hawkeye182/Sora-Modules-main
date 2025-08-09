// Test completo de APIs exactamente como en v11.5.11
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

async function testCompleteFlow() {
    console.log('🔍 Testing complete flow exactly like v11.5.11...');
    
    // 1. Search
    console.log('\n1. TESTING SEARCH:');
    try {
        const searchResponse = await fetchv2('https://kaa.to/api/search', {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': 'https://kaa.to',
            'Referer': 'https://kaa.to/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }, 'POST', JSON.stringify({ query: 'dandadan' }));
        
        console.log('Search Status:', searchResponse.status);
        
        if (searchResponse && searchResponse.status === 200 && searchResponse._data) {
            let searchData = searchResponse._data;
            if (typeof searchData === 'string') {
                searchData = JSON.parse(searchData);
            }
            
            if (Array.isArray(searchData) && searchData.length > 0) {
                const firstResult = searchData[0];
                console.log('✅ Search works! First result:', firstResult.title);
                console.log('Slug:', firstResult.slug);
                
                // 2. Details
                console.log('\n2. TESTING DETAILS:');
                const slug = firstResult.slug;
                const detailsResponse = await fetchv2(`https://kaa.to/api/show/${slug}`);
                console.log('Details Status:', detailsResponse.status);
                
                if (detailsResponse.status === 200) {
                    console.log('✅ Details API works!');
                } else {
                    console.log('❌ Details API failed');
                }
                
                // 3. Episodes
                console.log('\n3. TESTING EPISODES:');
                
                // Primero probar language API
                const languageResponse = await fetchv2(`https://kaa.to/api/show/${slug}/language`);
                console.log('Language Status:', languageResponse.status);
                
                if (languageResponse.status === 200 && languageResponse._data) {
                    let langData = JSON.parse(languageResponse._data);
                    console.log('✅ Language API works!');
                    console.log('Available languages:', langData.result);
                    
                    // Probar episodes API
                    const episodesResponse = await fetchv2(`https://kaa.to/api/show/${slug}/episodes?ep=1&lang=ja-JP`);
                    console.log('Episodes Status:', episodesResponse.status);
                    
                    if (episodesResponse.status === 200 && episodesResponse._data) {
                        let epData = JSON.parse(episodesResponse._data);
                        console.log('✅ Episodes API works!');
                        console.log('Episodes found:', epData.result?.length || 0);
                        
                        if (epData.result && epData.result.length > 0) {
                            const firstEp = epData.result[0];
                            console.log('First episode:', firstEp.episode_number);
                            console.log('Watch URL would be:', `https://kaa.to/watch/${slug}/${firstEp.episode_number}?lang=ja-JP`);
                        }
                    } else {
                        console.log('❌ Episodes API failed');
                    }
                } else {
                    console.log('❌ Language API failed');
                }
                
            } else {
                console.log('❌ Search returned no results');
            }
        } else {
            console.log('❌ Search failed');
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

testCompleteFlow();
