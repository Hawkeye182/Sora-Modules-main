// Test del módulo con formato Sora
const { createRequire } = require('module');
const path = require('path');
const fs = require('fs');

// Simular soraFetch (similar a fetch pero compatible con Node.js)
const https = require('https');
const http = require('http');

async function soraFetch(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                ...options.headers
            }
        };

        const request = (urlObj.protocol === 'https:' ? https : http).request(requestOptions, (response) => {
            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('end', () => {
                resolve({
                    status: response.statusCode,
                    json: () => Promise.resolve(JSON.parse(data)),
                    text: () => Promise.resolve(data)
                });
            });
        });

        request.on('error', reject);
        if (options.body) request.write(options.body);
        request.end();
    });
}

// Hacer soraFetch global para el módulo
global.soraFetch = soraFetch;

async function testSoraModule() {
    try {
        console.log('🎯 TEST DEL MÓDULO CON FORMATO SORA');
        console.log('==================================\n');

        // Cargar el módulo corregido
        const { readFileSync } = require('fs');
const path = require('path');

// Simular el entorno de Sora 
global.fetchv2 = async function(url, headers = {}, method = 'GET', body = null) {
    console.log(`[SORA FETCH] ${method} ${url}`);
    return {
        status: 200,
        _data: JSON.stringify([
            {
                title: "Test Anime",
                slug: "test-anime-slug"
            }
        ])
    };
};

// Cargar el módulo FIXED_SORA
const moduleCode = readFileSync('e:/Proyectos/XD/Sora-Modules-main/KaaTo/subs/KaaTo_FIXED_SORA.js', 'utf8');
eval(moduleCode);

async function debugSoraFormat() {
    console.log('🔍 DEBUGGING SORA MODULE FORMAT\n');
    
    try {
        // Test 1: Verificar search
        console.log('1️⃣ Testing searchResults...');
        const searchResult = await searchResults('test');
        console.log('Search output:', searchResult);
        console.log('Search type:', typeof searchResult);
        console.log('Is valid JSON:', isValidJSON(searchResult));
        
        // Test 2: Verificar details
        console.log('\n2️⃣ Testing extractDetails...');
        const detailsResult = await extractDetails('https://kaa.to/anime/test-slug');
        console.log('Details output:', detailsResult);
        console.log('Details type:', typeof detailsResult);
        console.log('Is valid JSON:', isValidJSON(detailsResult));
        
        // Test 3: Verificar episodes
        console.log('\n3️⃣ Testing extractEpisodes...');
        const episodesResult = await extractEpisodes('https://kaa.to/anime/test-slug');
        console.log('Episodes output:', episodesResult);
        console.log('Episodes type:', typeof episodesResult);
        console.log('Is valid JSON:', isValidJSON(episodesResult));
        
        // Test 4: Verificar stream (EL MÁS IMPORTANTE)
        console.log('\n4️⃣ Testing extractStreamUrl...');
        const streamResult = await extractStreamUrl('https://kaa.to/test-slug/ep-1-test');
        console.log('Stream output:', streamResult);
        console.log('Stream type:', typeof streamResult);
        console.log('Is valid JSON:', isValidJSON(streamResult));
        
        if (isValidJSON(streamResult)) {
            const stream = JSON.parse(streamResult);
            console.log('\n📋 Stream Analysis:');
            console.log('- streamUrl:', stream.streamUrl);
            console.log('- quality:', stream.quality);
            console.log('- type:', stream.type);
            console.log('- headers:', stream.headers);
            
            // Verificar que todos los campos requeridos están presentes
            const requiredFields = ['streamUrl', 'quality', 'type'];
            const missingFields = requiredFields.filter(field => !stream[field]);
            
            if (missingFields.length > 0) {
                console.log('❌ Missing required fields:', missingFields);
            } else {
                console.log('✅ All required fields present');
            }
            
            // Verificar que streamUrl no esté vacía
            if (!stream.streamUrl || stream.streamUrl.trim() === '') {
                console.log('❌ streamUrl is empty or null');
            } else {
                console.log('✅ streamUrl has value');
            }
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

function isValidJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}

debugSoraFormat();
        eval(moduleCode);

        // Test 1: Búsqueda
        console.log('🔎 Paso 1: Probando búsqueda...');
        const searchResult = await searchResults('dragon');
        const searchData = JSON.parse(searchResult);
        
        console.log(`✅ ${searchData.length} resultados encontrados`);
        console.log('Primer resultado:', searchData[0]);
        
        if (searchData.length > 0) {
            const testAnime = searchData[0];
            
            // Test 2: Detalles
            console.log('\n🔍 Paso 2: Probando extracción de detalles...');
            const detailsResult = await extractDetails(testAnime.href);
            const details = JSON.parse(detailsResult);
            
            console.log('📊 DETALLES (formato Sora):');
            console.log('===========================');
            console.log('Description:', details[0]?.description?.substring(0, 100) + '...');
            console.log('Aliases:', details[0]?.aliases);
            console.log('Airdate:', details[0]?.airdate);
            
            // Test 3: Episodios
            console.log('\n🎬 Paso 3: Probando extracción de episodios...');
            const episodesResult = await extractEpisodes(testAnime.href);
            const episodes = JSON.parse(episodesResult);
            
            console.log(`📺 ${episodes.length} episodios encontrados`);
            if (episodes.length > 0) {
                console.log('Primer episodio:', episodes[0]);
            }
            
            // Verificaciones
            console.log('\n✅ VERIFICACIONES:');
            console.log('==================');
            const searchOk = searchData.length > 0 && searchData[0].title && searchData[0].href;
            const detailsOk = details.length > 0 && details[0].description && !details[0].description.includes('Error');
            const episodesOk = episodes.length > 0 && episodes[0].href && episodes[0].number;
            
            console.log('✓ Búsqueda:', searchOk ? '✅ OK' : '❌ FALLA');
            console.log('✓ Detalles:', detailsOk ? '✅ OK' : '❌ FALLA');
            console.log('✓ Episodios:', episodesOk ? '✅ OK' : '❌ FALLA');
            
            if (searchOk && detailsOk && episodesOk) {
                console.log('\n🟢 ¡MÓDULO TOTALMENTE FUNCIONAL PARA SORA!');
                console.log('🎯 Formato correcto: sin mensajes informativos, detalles como array');
            } else {
                console.log('\n🟡 MÓDULO PARCIALMENTE FUNCIONAL');
            }
            
        } else {
            console.log('❌ No se encontraron resultados para probar');
        }
        
    } catch (error) {
        console.error('❌ Error en el test:', error.message);
        console.error('Stack:', error.stack);
    }
}

testSoraModule();
