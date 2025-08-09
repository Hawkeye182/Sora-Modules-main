// Test detalles del anime exactamente como en v11.5.11
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

async function testDetails() {
    console.log('📄 Testing details exactly like v11.5.11...');
    
    try {
        const slug = 'naruto-f3cf';
        console.log('📝 Using slug for details:', slug);
        
        const response = await fetchv2(`https://kaa.to/api/show/${slug}`);
        console.log('Status:', response.status);
        
        if (response && response.status === 200 && response._data) {
            let data = response._data;
            if (typeof data === 'string') {
                data = JSON.parse(data);
            }
            
            console.log('Response keys:', Object.keys(data));
            
            if (data && data.result) {
                const anime = data.result;
                const details = {
                    id: slug,
                    title: anime.name || 'Unknown Title',
                    summary: anime.description || 'No description available',
                    status: anime.status || 'Unknown',
                    poster: anime.poster ? `https://kaa.to${anime.poster}` : null,
                    backdrop: anime.backdrop ? `https://kaa.to${anime.backdrop}` : null,
                    releaseDate: anime.first_air_date || null,
                    genres: anime.categories ? anime.categories.map(cat => cat.name) : [],
                    rating: anime.vote_average || 0,
                    episodeCount: anime.episode_count || 0,
                    year: anime.first_air_date ? new Date(anime.first_air_date).getFullYear() : null
                };
                
                console.log('✅ Details extracted:');
                console.log('Title:', details.title);
                console.log('Year:', details.year);
                console.log('Episodes:', details.episodeCount);
                console.log('Status:', details.status);
                console.log('Genres:', details.genres.join(', '));
                console.log('Summary:', details.summary.substring(0, 150) + '...');
            } else {
                console.log('❌ No result field in response');
            }
        } else {
            console.log('❌ Request failed or no data');
        }
    } catch (error) {
        console.log('❌ Details error:', error.message);
    }
}

testDetails();
