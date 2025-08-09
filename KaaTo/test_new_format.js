const { readFileSync } = require('fs');
const path = require('path');

// Cargar el módulo SIMPLE_TEST actualizado
const moduleCode = readFileSync(path.join(__dirname, 'subs', 'KaaTo_SIMPLE_TEST.js'), 'utf8');

// Simular fetchv2
global.fetchv2 = async function() {
    return { status: 200, _data: '[]' };
};

eval(moduleCode);

async function testNewFormat() {
    console.log('🔍 TESTING NEW STREAM FORMAT (like AnimeFlv)\n');
    
    try {
        const streamResult = await extractStreamUrl('https://kaa.to/test/ep-1');
        
        console.log('Stream result:', streamResult);
        console.log('Type:', typeof streamResult);
        console.log('Is string?', typeof streamResult === 'string');
        console.log('Is URL?', streamResult.startsWith('http'));
        
        if (typeof streamResult === 'string' && streamResult.startsWith('http')) {
            console.log('✅ CORRECT FORMAT: Stream URL as string');
            console.log('✅ URL:', streamResult);
        } else {
            console.log('❌ WRONG FORMAT: Should be URL string');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testNewFormat();
