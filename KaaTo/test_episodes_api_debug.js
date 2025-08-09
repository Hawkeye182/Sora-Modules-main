// Test directo de la API de episodios para diagnosticar el problema
// Basado en los logs de v11.5.7

const test_episodes_api_debug = async () => {
    console.log('🔍 Testing Episodes API - Debugging v11.5.7 issue');
    
    const slug = 'bleach-f24c';
    
    try {
        console.log('\n1️⃣ Testing Language API first...');
        console.log(`URL: https://kaa.to/api/show/${slug}/language`);
        
        console.log('\n2️⃣ Testing Episodes API...');
        console.log(`URL: https://kaa.to/api/show/${slug}/episodes?limit=2000&page=1&language=ja-JP`);
        
        console.log('\n3️⃣ Key diagnostics from logs:');
        console.log('✅ extractDetails API works - shows description and year');
        console.log('❌ extractEpisodes API - returns empty response keys');
        console.log('❌ Only 1 episode found instead of 366');
        console.log('❌ Episode URL wrong: https://kaa.to/anime/bleach-f24c (should be episode-specific)');
        
        console.log('\n4️⃣ Problem Analysis:');
        console.log('The episodes API call is made but response is empty or malformed');
        console.log('This suggests either:');
        console.log('- API endpoint changed format');
        console.log('- Headers/auth required');
        console.log('- JSON structure different');
        console.log('- Language parameter wrong');
        
        console.log('\n5️⃣ Solution Strategy:');
        console.log('🔧 Need to add more debug logging to extractEpisodes');
        console.log('🔧 Check if API requires different parameters');
        console.log('🔧 Test with the working UNIVERSAL v11.4 parameters');
        console.log('🔧 Add fallback to HTML parsing if API fails');
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
};

test_episodes_api_debug();
