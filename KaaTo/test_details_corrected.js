// Test para verificar que los detalles ahora funcionan correctamente
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

async function testDetailsExtraction() {
    try {
        console.log('🧪 PROBANDO EXTRACCIÓN DE DETALLES CORREGIDA');
        console.log('================================================\n');

        // Cargar el módulo corregido
        const moduleCode = fs.readFileSync('e:/Proyectos/XD/Sora-Modules-main/KaaTo/subs/KaaTo_CORRECTED.js', 'utf8');
        eval(moduleCode);

        // Test URL real (usaremos dragon-ball desde el test anterior)
        const testUrl = 'https://kaa.to/anime/dragon-ball';
        
        console.log('📍 Probando URL:', testUrl);
        
        // Obtener detalles usando la función corregida
        console.log('\n🔍 Extrayendo detalles...');
        const detailsResult = await extractDetails(testUrl);
        const details = JSON.parse(detailsResult);
        
        console.log('\n📊 RESULTADO DE DETALLES:');
        console.log('=====================================');
        console.log('Título:', details.title);
        console.log('Descripción:', details.description ? details.description.substring(0, 200) + '...' : 'NO ENCONTRADA');
        console.log('Año:', details.releaseDate);
        console.log('Estado:', details.status);
        console.log('Géneros:', details.genres);
        console.log('Otros títulos:', details.otherTitles);
        console.log('Imagen:', details.image);
        
        // Verificar que los datos importantes están presentes
        console.log('\n✅ VERIFICACIONES:');
        console.log('=====================================');
        console.log('✓ Título presente:', details.title !== "Sin título" ? 'SÍ' : 'NO');
        console.log('✓ Descripción presente:', details.description !== "Sin descripción disponible" ? 'SÍ' : 'NO');
        console.log('✓ Año presente:', details.releaseDate !== "Desconocido" ? 'SÍ' : 'NO');
        console.log('✓ Géneros presentes:', Array.isArray(details.genres) && details.genres.length > 0 ? 'SÍ' : 'NO');
        
        console.log('\n🎯 PRUEBA DE EPISODIOS:');
        console.log('=====================================');
        const episodesResult = await extractEpisodes(testUrl);
        const episodes = JSON.parse(episodesResult);
        
        console.log('Total episodios encontrados:', episodes.length);
        if (episodes.length > 0) {
            console.log('Primer episodio:', episodes[0]);
            if (episodes.length > 1) {
                console.log('Último episodio:', episodes[episodes.length - 1]);
            }
        }
        
        console.log('\n🎉 RESULTADO FINAL:');
        console.log('=====================================');
        const working = details.title !== "Sin título" && 
                       details.description !== "Sin descripción disponible" && 
                       details.releaseDate !== "Desconocido";
        
        console.log(working ? '✅ DETALLES FUNCIONANDO CORRECTAMENTE' : '❌ TODAVÍA HAY PROBLEMAS');
        
        if (!working) {
            console.log('\n🔧 DEBUG - Respuesta completa:');
            console.log(JSON.stringify(details, null, 2));
        }
        
    } catch (error) {
        console.error('❌ Error en el test:', error.message);
        console.error('Stack:', error.stack);
    }
}

testDetailsExtraction();
