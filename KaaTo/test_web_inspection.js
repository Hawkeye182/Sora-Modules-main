import fetch from 'node-fetch';

console.log('🔍 INSPECCIONANDO PÁGINA WEB PARA ENCONTRAR IMÁGENES\n');

async function inspectWebsite() {
    try {
        // Obtener datos del anime
        const searchResponse = await fetch('https://kaa.to/api/search', {
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

        const data = await searchResponse.json();
        const item = data[0];
        
        console.log('📋 Información del anime:');
        console.log(`   Título: ${item.title}`);
        console.log(`   Slug: ${item.slug}`);
        console.log(`   Poster SM: ${item.poster.sm}`);
        console.log(`   Poster HQ: ${item.poster.hq}`);
        
        // Obtener la página principal para ver las imágenes
        console.log('\n🌐 Inspeccionando página principal...');
        const homeResponse = await fetch('https://kaa.to/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (homeResponse.ok) {
            const html = await homeResponse.text();
            
            // Buscar todas las imágenes
            const imageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
            const images = [];
            let match;
            
            while ((match = imageRegex.exec(html)) !== null) {
                images.push(match[1]);
            }
            
            console.log(`\n🖼️ Imágenes encontradas en la página principal (${images.length}):`);
            
            // Filtrar y mostrar imágenes relevantes
            const relevantImages = images.filter(img => 
                img.includes('webp') || 
                img.includes('jpg') || 
                img.includes('jpeg') ||
                img.includes('image') ||
                img.includes('poster')
            );
            
            relevantImages.slice(0, 10).forEach(img => {
                console.log(`   📸 ${img}`);
            });
            
            // Buscar patrones específicos
            const patterns = [
                /\/image\/[^"'\s]+/g,
                /\/images\/[^"'\s]+/g,
                /\/poster\/[^"'\s]+/g,
                /\/static\/[^"'\s]+\.(webp|jpg|jpeg|png)/g
            ];
            
            console.log('\n🎯 Patrones específicos encontrados:');
            patterns.forEach((pattern, index) => {
                const matches = html.match(pattern);
                if (matches) {
                    console.log(`   Patrón ${index + 1}: ${matches.slice(0, 3).join(', ')}`);
                }
            });
        }
        
        // Probar algunos endpoints comunes de imágenes
        console.log('\n🔍 Probando endpoints de imágenes conocidos...');
        const testUrls = [
            `https://kaa.to/image/${item.poster.hq}.webp`,
            `https://kaa.to/images/${item.poster.hq}.webp`,
            `https://cdn.kaa.to/image/${item.poster.hq}.webp`,
            `https://static.kaa.to/image/${item.poster.hq}.webp`,
            `https://kaa.to/_nuxt/image/${item.poster.hq}.webp`,
            `https://kaa.to/api/image/${item.poster.hq}`
        ];
        
        for (const url of testUrls) {
            try {
                const imgResponse = await fetch(url, { method: 'HEAD', timeout: 5000 });
                console.log(`   ${imgResponse.status === 200 ? '✅' : '❌'} ${url} - Status: ${imgResponse.status}`);
            } catch (e) {
                console.log(`   ❌ ${url} - Error: ${e.message}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

inspectWebsite();
