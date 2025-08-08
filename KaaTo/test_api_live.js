import fetch from 'node-fetch';

console.log('🔍 PROBANDO API DE KAA.TO EN VIVO\n');

async function testSearch() {
    try {
        console.log('1. 🔎 Probando búsqueda...');
        
        const searchResponse = await fetch('https://kaa.to/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            body: JSON.stringify({
                query: 'dragon'
            })
        });

        console.log(`   Status: ${searchResponse.status}`);
        
        if (!searchResponse.ok) {
            throw new Error(`Error ${searchResponse.status}: ${searchResponse.statusText}`);
        }

        const searchData = await searchResponse.json();
        console.log(`   ✅ Resultados encontrados: ${searchData.results?.length || 0}`);
        
        if (searchData.results && searchData.results.length > 0) {
            const firstResult = searchData.results[0];
            console.log(`   📺 Primer resultado: ${firstResult.title}`);
            console.log(`   🔗 Slug: ${firstResult.slug}`);
            
            // Probar poster
            if (firstResult.poster?.hq) {
                const posterUrl = `https://kaa.to/image/${firstResult.poster.hq}.webp`;
                console.log(`   🖼️ Poster URL: ${posterUrl}`);
                
                const posterResponse = await fetch(posterUrl);
                console.log(`   🖼️ Poster status: ${posterResponse.status}`);
            }
            
            return firstResult.slug;
        } else {
            console.log('   ❌ No se encontraron resultados');
            return null;
        }
        
    } catch (error) {
        console.error('   ❌ Error en búsqueda:', error.message);
        return null;
    }
}

async function testDetails(slug) {
    if (!slug) return null;
    
    try {
        console.log('\n2. 📋 Probando detalles...');
        
        const detailsResponse = await fetch(`https://kaa.to/api/show/${slug}`, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        console.log(`   Status: ${detailsResponse.status}`);
        
        if (!detailsResponse.ok) {
            throw new Error(`Error ${detailsResponse.status}: ${detailsResponse.statusText}`);
        }

        const details = await detailsResponse.json();
        console.log(`   ✅ Título: ${details.title}`);
        console.log(`   📝 Descripción: ${details.description?.substring(0, 100)}...`);
        console.log(`   📅 Año: ${details.aired?.from ? new Date(details.aired.from).getFullYear() : 'N/A'}`);
        
        return slug;
        
    } catch (error) {
        console.error('   ❌ Error en detalles:', error.message);
        return null;
    }
}

async function testEpisodes(slug) {
    if (!slug) return;
    
    try {
        console.log('\n3. 📺 Probando episodios...');
        
        const episodesResponse = await fetch(`https://kaa.to/api/show/${slug}/episodes`, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        console.log(`   Status: ${episodesResponse.status}`);
        
        if (!episodesResponse.ok) {
            throw new Error(`Error ${episodesResponse.status}: ${episodesResponse.statusText}`);
        }

        const episodes = await episodesResponse.json();
        console.log(`   ✅ Episodios encontrados: ${episodes.length}`);
        
        if (episodes.length > 0) {
            const firstEpisode = episodes[0];
            console.log(`   📺 Primer episodio: ${firstEpisode.title}`);
            console.log(`   🔢 Número: ${firstEpisode.number}`);
            console.log(`   🔗 Slug: ${firstEpisode.slug}`);
            
            return { slug, episodeSlug: firstEpisode.slug };
        }
        
    } catch (error) {
        console.error('   ❌ Error en episodios:', error.message);
    }
}

async function testStreaming(slug, episodeSlug) {
    if (!slug || !episodeSlug) return;
    
    try {
        console.log('\n4. 🎥 Probando streaming...');
        
        const streamResponse = await fetch(`https://kaa.to/api/show/${slug}/episode/${episodeSlug}`, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        console.log(`   Status: ${streamResponse.status}`);
        
        if (!streamResponse.ok) {
            throw new Error(`Error ${streamResponse.status}: ${streamResponse.statusText}`);
        }

        const streamData = await streamResponse.json();
        console.log(`   ✅ Datos del episodio obtenidos`);
        
        if (streamData.videos && streamData.videos.length > 0) {
            console.log(`   📹 Videos disponibles: ${streamData.videos.length}`);
            streamData.videos.forEach((video, index) => {
                console.log(`   📹 Video ${index + 1}: ${video.src || video.url || 'URL no disponible'}`);
            });
        } else {
            console.log('   ❌ No se encontraron videos directos');
        }
        
    } catch (error) {
        console.error('   ❌ Error en streaming:', error.message);
    }
}

// Ejecutar todas las pruebas
async function runAllTests() {
    const slug = await testSearch();
    await testDetails(slug);
    const episodeData = await testEpisodes(slug);
    if (episodeData) {
        await testStreaming(episodeData.slug, episodeData.episodeSlug);
    }
    
    console.log('\n🏁 PRUEBAS COMPLETADAS');
}

runAllTests().catch(console.error);
