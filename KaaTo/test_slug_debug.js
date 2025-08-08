// Test para verificar exactamente qué está pasando con la API
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

async function testSlugExtraction() {
    try {
        console.log('🔍 DEBUGGANDO EXTRACCIÓN DE SLUG Y API');
        console.log('=====================================\n');

        // Test diferentes formatos de URL
        const testUrls = [
            'https://kaa.to/anime/dragon-ball',
            'dragon-ball',
            '/anime/dragon-ball'
        ];

        for (const testUrl of testUrls) {
            console.log(`📍 Probando URL: "${testUrl}"`);
            
            // Extraer slug de diferentes formas
            let slug1 = testUrl.split('/anime/')[1] || testUrl.split('/').pop();
            let slug2 = testUrl.includes('/anime/') ? testUrl.split('/anime/')[1] : testUrl;
            
            console.log(`   Método 1 (actual): "${slug1}"`);
            console.log(`   Método 2 (alternativo): "${slug2}"`);
            console.log('');
        }

        // Probar la API directamente con el slug correcto
        console.log('🌐 PROBANDO API DIRECTAMENTE:');
        console.log('=============================');
        
        const correctSlug = 'dragon-ball';
        const apiUrl = `https://kaa.to/api/show/${correctSlug}`;
        
        console.log('URL de API:', apiUrl);
        
        const response = await fetchv2(apiUrl);
        console.log('Status:', response.status);
        console.log('Headers:', Object.keys(response.headers));
        
        if (response._data) {
            console.log('Tipo de respuesta:', typeof response._data);
            console.log('Longitud de datos:', response._data.length);
            
            // Intentar parsear como JSON
            try {
                const data = JSON.parse(response._data);
                console.log('\n📊 DATOS PARSEADOS:');
                console.log('==================');
                console.log('Título:', data.title);
                console.log('Synopsis:', data.synopsis ? data.synopsis.substring(0, 100) + '...' : 'NO ENCONTRADO');
                console.log('Año:', data.year);
                console.log('Estado:', data.status);
                console.log('Géneros:', data.genres);
                console.log('Poster:', data.poster);
                
                console.log('\n🔑 CAMPOS DISPONIBLES:');
                console.log('=====================');
                console.log(Object.keys(data));
                
            } catch (parseError) {
                console.log('❌ Error parseando JSON:', parseError.message);
                console.log('Primeros 500 caracteres:', response._data.substring(0, 500));
            }
        } else {
            console.log('❌ No hay datos en _data');
        }
        
    } catch (error) {
        console.error('❌ Error en el test:', error.message);
        console.error('Stack:', error.stack);
    }
}

testSlugExtraction();
