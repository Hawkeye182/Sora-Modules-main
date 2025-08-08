// Test final con el módulo corregido usando un slug real
const { createRequire } = require('module');
const path = require('path');
const fs = require('fs');

// Simular el entorno de Sora con fetchv2
const https = require('https');
const http = require('http');

async function fetchv2(url, headers = {}, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                ...headers
            }
        };

        const request = (urlObj.protocol === 'https:' ? https : http).request(options, (response) => {
            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('end', () => {
                resolve({
                    status: response.statusCode,
                    headers: response.headers,
                    _data: data
                });
            });
        });

        request.on('error', reject);
        if (body) request.write(body);
        request.end();
    });
}

// Hacer fetchv2 global para el módulo
global.fetchv2 = fetchv2;

async function testFinalModule() {
    try {
        console.log('🎯 TEST FINAL DEL MÓDULO CORREGIDO');
        console.log('==================================\n');

        // Cargar el módulo corregido
        const moduleCode = fs.readFileSync('e:/Proyectos/XD/Sora-Modules-main/KaaTo/subs/KaaTo_CORRECTED.js', 'utf8');
        eval(moduleCode);

        // Primero hacer una búsqueda para obtener URLs reales
        console.log('🔎 Paso 1: Haciendo búsqueda...');
        const searchResult = await searchResults('dragon');
        const searchData = JSON.parse(searchResult);
        
        console.log(`✅ ${searchData.length} resultados encontrados\n`);
        
        // Buscar un resultado real (saltar el mensaje informativo)
        const realResults = searchData.filter(item => !item.href.startsWith('info://'));
        
        if (realResults.length > 0) {
            const testAnime = realResults[0];
            console.log('📍 Probando con:', testAnime.title);
            console.log('🔗 URL:', testAnime.href);
            console.log('🖼️ Imagen:', testAnime.image);
            
            // Probar extracción de detalles
            console.log('\n🔍 Paso 2: Extrayendo detalles...');
            const detailsResult = await extractDetails(testAnime.href);
            const details = JSON.parse(detailsResult);
            
            console.log('\n📊 DETALLES EXTRAÍDOS:');
            console.log('======================');
            console.log('Título:', details.title);
            console.log('Descripción:', details.description?.substring(0, 100) + (details.description?.length > 100 ? '...' : ''));
            console.log('Año:', details.releaseDate);
            console.log('Estado:', details.status);
            console.log('Géneros:', details.genres);
            console.log('Otros títulos:', details.otherTitles);
            console.log('Imagen:', details.image);
            
            // Verificaciones
            console.log('\n✅ VERIFICACIONES:');
            console.log('==================');
            const titleOk = details.title && details.title !== "Sin título" && !details.title.includes("Error");
            const descOk = details.description && details.description !== "Sin descripción disponible" && !details.description.includes("Error");
            const yearOk = details.releaseDate && details.releaseDate !== "Desconocido" && details.releaseDate !== "2024";
            const genresOk = Array.isArray(details.genres) && details.genres.length > 0 && !details.genres.includes("Error");
            
            console.log('✓ Título válido:', titleOk ? '✅ SÍ' : '❌ NO');
            console.log('✓ Descripción válida:', descOk ? '✅ SÍ' : '❌ NO');
            console.log('✓ Año válido:', yearOk ? '✅ SÍ' : '❌ NO');
            console.log('✓ Géneros válidos:', genresOk ? '✅ SÍ' : '❌ NO');
            
            // Probar episodios
            console.log('\n🎬 Paso 3: Extrayendo episodios...');
            const episodesResult = await extractEpisodes(testAnime.href);
            const episodes = JSON.parse(episodesResult);
            
            console.log('Total episodios:', episodes.length);
            if (episodes.length > 0) {
                console.log('Primer episodio:', episodes[0]);
            }
            
            // Resultado final
            console.log('\n🎉 RESULTADO FINAL:');
            console.log('==================');
            const allOk = titleOk && descOk && yearOk && genresOk;
            
            if (allOk) {
                console.log('🟢 ¡MÓDULO FUNCIONANDO PERFECTAMENTE!');
                console.log('🎯 Los detalles ahora se cargan correctamente en Sora');
            } else {
                console.log('🟡 MÓDULO PARCIALMENTE FUNCIONAL');
                console.log('⚠️  Algunos campos aún tienen problemas');
            }
            
        } else {
            console.log('❌ No se encontraron resultados reales para probar');
        }
        
    } catch (error) {
        console.error('❌ Error en el test:', error.message);
        console.error('Stack:', error.stack);
    }
}

testFinalModule();
