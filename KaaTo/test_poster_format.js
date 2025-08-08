import fetch from 'node-fetch';

console.log('🔍 ANALIZANDO FORMATO DE POSTERS EN KAA.TO\n');

async function analyzePosterFormat() {
    try {
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
        
        if (Array.isArray(data) && data.length > 0) {
            console.log('📊 ANÁLISIS DEL PRIMER RESULTADO:');
            const firstResult = data[0];
            
            console.log('\n🔍 Estructura completa:');
            console.log(JSON.stringify(firstResult, null, 2));
            
            console.log('\n🖼️ Análisis del campo poster:');
            if (firstResult.poster) {
                console.log('Poster object:', JSON.stringify(firstResult.poster, null, 2));
                
                // Probar diferentes formatos de URL
                const posterFormats = [
                    firstResult.poster.hq,
                    firstResult.poster.sm,
                    firstResult.poster.md,
                    firstResult.poster.lg,
                    firstResult.poster.id,
                    firstResult.poster.formats?.[0]
                ];
                
                console.log('\n🔗 Probando URLs de posters:');
                for (const format of posterFormats) {
                    if (format) {
                        const testUrls = [
                            `https://kaa.to/image/${format}.webp`,
                            `https://kaa.to/image/${format}.jpg`,
                            `https://kaa.to/images/${format}.webp`,
                            `https://kaa.to/poster/${format}.webp`
                        ];
                        
                        for (const url of testUrls) {
                            try {
                                const imgResponse = await fetch(url, { method: 'HEAD' });
                                console.log(`   ${imgResponse.status === 200 ? '✅' : '❌'} ${url} - ${imgResponse.status}`);
                                if (imgResponse.status === 200) {
                                    console.log(`   🎯 FORMATO CORRECTO ENCONTRADO: ${url}`);
                                }
                            } catch (e) {
                                console.log(`   ❌ ${url} - Error: ${e.message}`);
                            }
                        }
                    }
                }
            } else {
                console.log('❌ No hay campo poster en el resultado');
            }
            
            // Analizar otros campos que podrían tener imágenes
            console.log('\n🔍 Otros campos de imagen:');
            const imageFields = ['image', 'thumbnail', 'cover', 'banner', 'backdrop'];
            imageFields.forEach(field => {
                if (firstResult[field]) {
                    console.log(`   ${field}:`, firstResult[field]);
                }
            });
            
        } else {
            console.log('❌ No se encontraron resultados');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

analyzePosterFormat();
