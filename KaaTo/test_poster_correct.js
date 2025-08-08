import fetch from 'node-fetch';

async function testCorrectPosterFormat() {
    console.log('🔍 PROBANDO FORMATO CORRECTO DE POSTERS');
    console.log('====================================');
    
    try {
        // Buscar bleach para obtener datos similares a tus ejemplos
        const searchResponse = await fetch('https://kaa.to/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            body: JSON.stringify({
                query: "bleach"
            })
        });
        
        const searchData = await searchResponse.json();
        console.log(`✅ Encontrados ${searchData.length} resultados para "bleach"`);
        
        if (searchData.length > 0) {
            const firstResult = searchData[0];
            console.log('\n📋 PRIMER RESULTADO:');
            console.log(`Título: ${firstResult.title || firstResult.name}`);
            console.log(`Slug: ${firstResult.slug}`);
            console.log(`Poster:`, firstResult.poster);
            
            if (firstResult.poster) {
                const posterSm = firstResult.poster.sm;
                const posterHq = firstResult.poster.hq;
                
                // Según tus ejemplos, el formato es:
                // https://kaa.to/image/poster/bleach-memories-in-the-rain-2fab-sm.webp
                const posterUrlSm = `https://kaa.to/image/poster/${posterSm}.webp`;
                const posterUrlHq = `https://kaa.to/image/poster/${posterHq}.webp`;
                
                console.log(`\n🔗 Probando URL SM: ${posterUrlSm}`);
                try {
                    const testSm = await fetch(posterUrlSm, { 
                        method: 'HEAD',
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });
                    console.log(`✅ SM Status: ${testSm.status}`);
                    if (testSm.status === 200) {
                        console.log(`🎯 ¡FORMATO CORRECTO ENCONTRADO!`);
                        return posterUrlSm;
                    }
                } catch (e) {
                    console.log(`❌ SM Error: ${e.message}`);
                }
                
                console.log(`\n🔗 Probando URL HQ: ${posterUrlHq}`);
                try {
                    const testHq = await fetch(posterUrlHq, { 
                        method: 'HEAD',
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });
                    console.log(`✅ HQ Status: ${testHq.status}`);
                    if (testHq.status === 200) {
                        console.log(`🎯 ¡FORMATO CORRECTO ENCONTRADO!`);
                        return posterUrlHq;
                    }
                } catch (e) {
                    console.log(`❌ HQ Error: ${e.message}`);
                }
            }
        }
        
        // Probar también con naruto que obtuvimos antes
        console.log('\n🔍 Probando también con formato naruto...');
        const narutoUrlSm = `https://kaa.to/image/poster/naruto-4ab6-sm.webp`;
        const narutoUrlHq = `https://kaa.to/image/poster/naruto-4ab6-hq.webp`;
        
        for (const url of [narutoUrlSm, narutoUrlHq]) {
            console.log(`🔗 Probando: ${url}`);
            try {
                const test = await fetch(url, { 
                    method: 'HEAD',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                console.log(`✅ Status: ${test.status}`);
                if (test.status === 200) {
                    console.log(`🎯 ¡FORMATO CORRECTO!`);
                    return url;
                }
            } catch (e) {
                console.log(`❌ Error: ${e.message}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error general:', error.message);
    }
}

testCorrectPosterFormat();
