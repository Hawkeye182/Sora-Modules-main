# FIXES v11.5.9 - ENHANCED STREAM EXTRACTION

## 🎯 PROBLEMA IDENTIFICADO
- ✅ extractDetails: Funcionando correctamente
- ✅ extractEpisodes: Funcionando correctamente 
- ❌ extractStreamUrl: **NO REPRODUCE EL VIDEO**

## 🔧 CORRECCIONES v11.5.9

### extractStreamUrl - COMPLETAMENTE REESCRITO
1. **PATTERN 1: Video ID Windows Pattern**
   - Busca: `video_id`, `video-id`, etc.
   - Regex: `/video[_-]?id['":\s]*['"]?([a-f0-9]{24})['"]?/i`

2. **PATTERN 2: JavaScript Scripts Analysis**
   - Extrae todos los `<script>` tags
   - Busca IDs hexadecimales de 24 caracteres en scripts

3. **PATTERN 3: Source.php Patterns** 
   - Busca: `source.php?id=VIDEOID`
   - Construye: `https://hls.krussdomi.com/manifest/${videoId}/master.m3u8`

4. **PATTERN 4: Hex ID Detection**
   - Busca cualquier string de 24 caracteres hexadecimales
   - Filtra para evitar claves JSON falsas

5. **PATTERN 5: Direct M3U8 URLs**
   - Busca URLs .m3u8 directas en el HTML

6. **PATTERN 6: API Fallback**
   - Si falla todo, intenta API: `/api/show/{slug}/episodes/{episodeNum}`
   - Busca `video_id` en respuesta de API

### Headers Mejorados
- User-Agent iPhone para mejor compatibilidad
- Headers de navegador móvil reales
- Proper Referer y Connection headers

### Logging Detallado
- 🚨 Indicadores visuales claros en logs
- 📍 URL tracking completo
- 🎯 Pattern matching results
- 🚀 Return value confirmation

## 🌐 URL DE PRUEBA
Usar esta URL en Sora iOS:
```
https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/KaaTo/subs/KaaTo_UNIVERSAL_FIXED_v11_5_9.json
```

## ✅ RESULTADO ESPERADO
- ✅ Búsqueda funcionando
- ✅ Detalles del anime cargando
- ✅ Lista de episodios completa (366 para Bleach)
- ✅ **REPRODUCCIÓN DE VIDEO FUNCIONAL**

## 🔍 DEBUGGING
Si aún no funciona el video:
1. Verificar logs de extractStreamUrl
2. Buscar patrones 🎯 FOUND en los logs
3. Confirmar que se devuelve URL master.m3u8
4. Verificar que iOS player puede reproducir HLS
