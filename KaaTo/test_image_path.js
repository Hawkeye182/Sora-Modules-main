import fetch from 'node-fetch';

console.log('🔍 ENCONTRANDO LA RUTA CORRECTA DE IMÁGENES\n');

async function findCorrectImagePath() {
    try {
        // Primero obtener datos de un anime
        const response = await fetch('https://kaa.to/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            body: JSON.stringify({
                query: 'naruto'
            })
        });

        const data = await response.json();
        const item = data[0];
        
        console.log('📝 Datos del poster:');
        console.log(`   SM: ${item.poster.sm}`);
        console.log(`   HQ: ${item.poster.hq}`);
        
        // Extraer solo el ID base del poster
        const smId = item.poster.sm.replace('-sm', '');
        const hqId = item.poster.hq.replace('-hq', '');
        
        console.log('\n🎯 IDs extraídos:');
        console.log(`   Base ID (desde SM): ${smId}`);
        console.log(`   Base ID (desde HQ): ${hqId}`);
        
        // Probar diferentes rutas y formatos
        const baseIds = [smId, hqId, item.poster.sm, item.poster.hq];
        const paths = [
            '/image/',
            '/images/',
            '/poster/',
            '/posters/',
            '/static/images/',
            '/assets/images/',
            '/_nuxt/image/',
            '/api/image/'
        ];
        const extensions = ['.webp', '.jpg', '.jpeg', '.png'];
        
        console.log('\n🔍 Probando combinaciones...');
        
        for (const baseId of baseIds) {
            for (const path of paths) {
                for (const ext of extensions) {
                    const testUrl = `https://kaa.to${path}${baseId}${ext}`;
                    
                    try {
                        const imgResponse = await fetch(testUrl, { 
                            method: 'HEAD',
                            timeout: 3000 
                        });
                        
                        if (imgResponse.status === 200) {
                            console.log(`   ✅ ENCONTRADO: ${testUrl}`);
                        }
                    } catch (e) {
                        // Ignorar errores para no saturar la salida
                    }
                }
            }
        }
        
        // Probar también visitando la página del anime para ver las imágenes
        console.log('\n🌐 Verificando página del anime...');
        const animePageResponse = await fetch(`https://kaa.to/${item.slug}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (animePageResponse.ok) {
            const html = await animePageResponse.text();
            
            // Buscar patrones de imágenes en el HTML
            const imgMatches = html.match(/src="[^"]*\.(jpg|jpeg|png|webp)[^"]*"/gi);
            if (imgMatches) {
                console.log('\n🖼️ Imágenes encontradas en la página:');
                imgMatches.slice(0, 5).forEach(match => {
                    const src = match.match(/src="([^"]*)"/)[1];
                    if (src.includes('naruto') || src.includes('4ab6')) {
                        console.log(`   📸 ${src}`);
                    }
                });
            }
            
            // Buscar meta tags de imagen
            const metaImgs = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/gi);
            if (metaImgs) {
                console.log('\n🏷️ Meta imágenes:');
                metaImgs.forEach(meta => {
                    const content = meta.match(/content="([^"]*)"/)[1];
                    console.log(`   🎯 ${content}`);
                });
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

findCorrectImagePath();
