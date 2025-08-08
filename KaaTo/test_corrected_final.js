// Test final del módulo KaaTo_CORRECTED.js arreglado
const { createRequire } = require('module');
const path = require('path');
const fs = require('fs');

// Simular fetchv2 (como en Sora)
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

async function testCorrectedModule() {
    try {
        console.log('🔧 TEST DEL MÓDULO KAATO_CORRECTED.JS ARREGLADO');
        console.log('===============================================\n');

        // Cargar el módulo corregido
        const moduleCode = fs.readFileSync('e:/Proyectos/XD/Sora-Modules-main/KaaTo/subs/KaaTo_CORRECTED.js', 'utf8');
        eval(moduleCode);

        // Test 1: Búsqueda
        console.log('🔎 Paso 1: Probando búsqueda...');
        const searchResult = await searchResults('dragon');
        const searchData = JSON.parse(searchResult);
        
        console.log(`✅ ${searchData.length} resultados encontrados`);
        console.log('Primer resultado:', searchData[0]);
        
        // Verificar que NO hay mensaje informativo
        const hasInfoMessage = searchData.some(item => item.title.includes('resultados de kaa.to'));
        console.log('❌ Mensaje informativo:', hasInfoMessage ? 'PRESENTE (MAL)' : 'AUSENTE (BIEN)');
        
        if (searchData.length > 0 && !hasInfoMessage) {
            const testAnime = searchData[0];
            
            // Test 2: Detalles con formato Sora
            console.log('\n🔍 Paso 2: Probando extracción de detalles...');
            const detailsResult = await extractDetails(testAnime.href);
            const details = JSON.parse(detailsResult);
            
            console.log('📊 DETALLES (formato Sora):');
            console.log('===========================');
            console.log('Es array:', Array.isArray(details));
            console.log('Longitud:', details.length);
            if (details.length > 0) {
                console.log('Description:', details[0]?.description?.substring(0, 100) + '...');
                console.log('Aliases:', details[0]?.aliases);
                console.log('Airdate:', details[0]?.airdate);
            }
            
            // Test 3: Episodios con formato Sora
            console.log('\n🎬 Paso 3: Probando extracción de episodios...');
            const episodesResult = await extractEpisodes(testAnime.href);
            const episodes = JSON.parse(episodesResult);
            
            console.log(`📺 ${episodes.length} episodios encontrados`);
            if (episodes.length > 0) {
                console.log('Primer episodio:', episodes[0]);
                console.log('Tiene href:', !!episodes[0].href);
                console.log('Tiene number:', !!episodes[0].number);
            }
            
            // Verificaciones finales
            console.log('\n✅ VERIFICACIONES FINALES:');
            console.log('==========================');
            const searchOk = searchData.length > 0 && !hasInfoMessage;
            const detailsOk = Array.isArray(details) && details.length > 0 && details[0].description && !details[0].description.includes('Error');
            const episodesOk = Array.isArray(episodes) && episodes.length > 0 && episodes[0].href && episodes[0].number;
            
            console.log('✓ Búsqueda limpia:', searchOk ? '✅ OK' : '❌ FALLA');
            console.log('✓ Detalles (array):', detailsOk ? '✅ OK' : '❌ FALLA');
            console.log('✓ Episodios (format):', episodesOk ? '✅ OK' : '❌ FALLA');
            
            if (searchOk && detailsOk && episodesOk) {
                console.log('\n🟢 ¡MÓDULO COMPLETAMENTE ARREGLADO!');
                console.log('🎯 Listo para usar en Sora sin problemas');
            } else {
                console.log('\n🟡 MÓDULO AÚN TIENE PROBLEMAS');
                if (!searchOk) console.log('  - Búsqueda tiene mensaje informativo');
                if (!detailsOk) console.log('  - Detalles no están en formato array correcto');
                if (!episodesOk) console.log('  - Episodios no tienen formato correcto');
            }
            
        } else {
            console.log('❌ Problema con la búsqueda o mensaje informativo presente');
        }
        
    } catch (error) {
        console.error('❌ Error en el test:', error.message);
        console.error('Stack:', error.stack);
    }
}

testCorrectedModule();
