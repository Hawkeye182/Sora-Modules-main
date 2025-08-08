// Test detallado de estructura de respuestas
const https = require('https');

async function testDetailedStructure() {
    // Test búsqueda primero
    console.log("🔍 1. Probando búsqueda...");
    const searchResults = await searchKaaTo('naruto');
    
    if (searchResults.length > 0) {
        const firstAnime = searchResults[0];
        console.log(`\n📋 Primer anime encontrado:`);
        console.log(`- Título: ${firstAnime.title}`);
        console.log(`- Slug: ${firstAnime.slug}`);
        console.log(`- Poster: ${JSON.stringify(firstAnime.poster)}`);
        
        // Test detalles
        console.log(`\n📖 2. Probando detalles para: ${firstAnime.slug}`);
        const details = await getDetails(firstAnime.slug);
        console.log(`\n📊 Estructura completa de detalles:`);
        console.log(JSON.stringify(details, null, 2));
        
        // Test episodios
        console.log(`\n📺 3. Probando episodios para: ${firstAnime.slug}`);
        const episodes = await getEpisodes(firstAnime.slug);
        console.log(`\n📊 Estructura completa de episodios:`);
        console.log(JSON.stringify(episodes, null, 2));
        
        // Verificar campos específicos
        console.log(`\n🔍 4. Análisis de campos específicos:`);
        console.log(`- Descripción: ${details.description || details.synopsis || details.summary || 'NO ENCONTRADA'}`);
        console.log(`- Año: ${details.year || details.releaseDate || details.aired || 'NO ENCONTRADO'}`);
        console.log(`- Estado: ${details.status || 'NO ENCONTRADO'}`);
        console.log(`- Géneros: ${details.genres ? details.genres.join(', ') : 'NO ENCONTRADOS'}`);
        console.log(`- Títulos alternativos: ${details.alt_titles || details.alternativeTitles || 'NO ENCONTRADOS'}`);
        
        if (Array.isArray(episodes)) {
            console.log(`\n📺 5. Análisis de episodios (total: ${episodes.length}):`);
            if (episodes.length > 0) {
                const firstEp = episodes[0];
                console.log(`- Primer episodio:`, JSON.stringify(firstEp, null, 2));
                console.log(`- Campos disponibles: ${Object.keys(firstEp).join(', ')}`);
            }
        } else {
            console.log(`\n📺 5. Episodios no es un array:`, typeof episodes);
        }
    }
}

function searchKaaTo(query) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({ query });
        const options = {
            hostname: 'kaa.to',
            port: 443,
            path: '/api/search',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': postData.length,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data) || []);
                } catch (error) {
                    reject(error);
                }
            });
        });
        
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

function getDetails(slug) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'kaa.to',
            port: 443,
            path: `/api/show/${slug}`,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (error) {
                    reject(error);
                }
            });
        });
        
        req.on('error', reject);
        req.end();
    });
}

function getEpisodes(slug) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'kaa.to',
            port: 443,
            path: `/api/show/${slug}/episodes`,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (error) {
                    reject(error);
                }
            });
        });
        
        req.on('error', reject);
        req.end();
    });
}

testDetailedStructure();
