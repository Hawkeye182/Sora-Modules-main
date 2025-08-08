// Validador de módulo KaaTo para Sora
const fs = require('fs');

function validateModule() {
    console.log("🔍 VALIDANDO MÓDULO KAATO PARA SORA");
    console.log("================================");
    
    try {
        // Leer archivo JavaScript
        const jsContent = fs.readFileSync('./subs/KaaTo.js', 'utf8');
        
        // Verificar funciones requeridas
        const requiredFunctions = [
            'searchResults',
            'extractDetails', 
            'extractEpisodes',
            'extractStreamUrl',
            'soraFetch'
        ];
        
        console.log("📋 Verificando funciones requeridas:");
        
        let allFunctionsFound = true;
        requiredFunctions.forEach(func => {
            const found = jsContent.includes(`async function ${func}`) || jsContent.includes(`function ${func}`);
            if (found) {
                console.log(`   ✅ ${func} - ENCONTRADA`);
            } else {
                console.log(`   ❌ ${func} - NO ENCONTRADA`);
                allFunctionsFound = false;
            }
        });
        
        // Verificar JSON
        console.log("\n📋 Verificando JSON:");
        const jsonContent = fs.readFileSync('./subs/KaaTo.json', 'utf8');
        const jsonData = JSON.parse(jsonContent);
        
        const requiredFields = [
            'sourceName', 'iconUrl', 'author', 'version', 
            'language', 'streamType', 'quality', 'type',
            'baseUrl', 'scriptUrl', 'asyncJS'
        ];
        
        let allFieldsFound = true;
        requiredFields.forEach(field => {
            if (jsonData.hasOwnProperty(field)) {
                console.log(`   ✅ ${field} - PRESENTE`);
            } else {
                console.log(`   ❌ ${field} - FALTANTE`);
                allFieldsFound = false;
            }
        });
        
        console.log("\n🎯 RESULTADO:");
        if (allFunctionsFound && allFieldsFound) {
            console.log("   ✅ MÓDULO VÁLIDO - Listo para Sora");
            console.log("   📋 PRÓXIMO PASO: Subir archivos a GitHub");
            console.log("");
            console.log("   📤 COMANDOS PARA SUBIR:");
            console.log("   git add .");
            console.log("   git commit -m \"Add KaaTo extension for Sora\"");
            console.log("   git push origin main");
            console.log("");
            console.log("   🔗 DESPUÉS USA ESTA URL EN SORA:");
            console.log("   https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/KaaTo/subs/KaaTo.json");
        } else {
            console.log("   ❌ MÓDULO INVÁLIDO - Requiere correcciones");
        }
        
    } catch (error) {
        console.log(`   💥 ERROR: ${error.message}`);
    }
}

validateModule();
