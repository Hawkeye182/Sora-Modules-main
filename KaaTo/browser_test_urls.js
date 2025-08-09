console.log('🧪 MANUAL URL TEST FOR BROWSER\n');

// URLs para probar directamente en el navegador
const urlsToTest = [
    // M3U8 URLs conocidas que funcionaron en tests anteriores
    {
        name: 'Bleach Ep 1 M3U8',
        url: 'https://hls.krussdomi.com/manifest/64cd832e44c6d04c12186497/master.m3u8',
        type: 'M3U8 Playlist'
    },
    {
        name: 'Bleach Ep 1 Player',
        url: 'https://krussdomi.com/player.php?v=64cd832e44c6d04c12186497',
        type: 'Video Player Page'
    },
    // Otros IDs de video que pueden funcionar
    {
        name: 'Alternative M3U8 #1',
        url: 'https://hls.krussdomi.com/manifest/64cd832c44c6d04c12186496/master.m3u8',
        type: 'M3U8 Playlist'
    },
    {
        name: 'Alternative Player #1',
        url: 'https://krussdomi.com/player.php?v=64cd832c44c6d04c12186496',
        type: 'Video Player Page'
    },
    // URLs de diferentes animes
    {
        name: 'Naruto M3U8',
        url: 'https://hls.krussdomi.com/manifest/64cd83f344c6d04c121966d8/master.m3u8',
        type: 'M3U8 Playlist'
    },
    {
        name: 'Naruto Player',
        url: 'https://krussdomi.com/player.php?v=64cd83f344c6d04c121966d8',
        type: 'Video Player Page'
    }
];

console.log('🌐 URLs TO TEST IN BROWSER:');
console.log('=' .repeat(70));

urlsToTest.forEach((item, index) => {
    console.log(`\n${index + 1}. ${item.name} (${item.type})`);
    console.log(`   ${item.url}`);
});

console.log('\n' + '=' .repeat(70));

console.log('\n💡 HOW TO TEST EACH URL:');
console.log('\n📺 For M3U8 URLs:');
console.log('  1. Copy URL');
console.log('  2. Open VLC Media Player');
console.log('  3. Media > Open Network Stream');
console.log('  4. Paste URL and click Play');
console.log('  5. OR try in browser (might download .m3u8 file)');

console.log('\n🎬 For Player URLs:');
console.log('  1. Copy URL');
console.log('  2. Open in new browser tab');
console.log('  3. Should show video player');
console.log('  4. Right-click video > "Copy video address" for direct URL');

console.log('\n🔍 WHAT TO LOOK FOR:');
console.log('✅ M3U8 URLs: Should play video in VLC or download playlist file');
console.log('✅ Player URLs: Should show embedded video player');
console.log('❌ If you get Cloudflare errors, the protection is blocking access');
console.log('❌ If you get 404/403, the video ID might be invalid');

console.log('\n📋 REPORT BACK:');
console.log('Tell me which URLs work so we can fix the Sora module accordingly!');

// También generar comando curl para test desde terminal
console.log('\n🖥️  TERMINAL CURL TEST:');
console.log('Copy and paste this in your terminal to test M3U8 access:');
console.log('\ncurl -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \\');
console.log('     -H "Referer: https://krussdomi.com/player.php?v=64cd832e44c6d04c12186497" \\');
console.log('     "https://hls.krussdomi.com/manifest/64cd832e44c6d04c12186497/master.m3u8"');

console.log('\n🎯 Expected result: Should show M3U8 playlist content starting with #EXTM3U');
