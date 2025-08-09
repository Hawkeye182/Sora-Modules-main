# KaaTo v11.5.12 - F12 DEBUGGING INSTRUCTIONS

## 🚨 PROBLEMAS IDENTIFICADOS
1. **extractDetails**: Formato incorrecto - v11.4 devuelve ARRAY, nuevas versiones devuelven OBJECT
2. **extractStreamUrl**: No encuentra video ID - necesitamos análisis F12 de la página real

## ✅ CORRECCIONES v11.5.12

### extractDetails - FORMATO EXACTO v11.4
```javascript
// ❌ VERSIONES NUEVAS (INCORRECTO):
return JSON.stringify({title: "...", summary: "..."});

// ✅ v11.4 FUNCIONANDO (CORRECTO):
return JSON.stringify([{description: "...", aliases: "...", airdate: "..."}]);
```

### F12 DEBUGGING MODE ACTIVADO
La nueva versión v11.5.12 incluye **DEBUGGING COMPLETO** que mostrará en los logs:

1. **HTML COMPLETO**: Primeros 2000 caracteres de la página
2. **TODOS LOS SCRIPTS**: Cada `<script>` tag individualmente
3. **URLS ENCONTRADAS**: Todas las URLs, especialmente con m3u8/manifest/stream
4. **VARIABLES JS**: Variables de JavaScript que puedan contener video IDs
5. **HEX IDs**: Todos los IDs hexadecimales de 24 caracteres

## 🔧 INSTRUCCIONES F12

### URL PARA PROBAR:
```
https://raw.githubusercontent.com/Hawkeye182/Sora-Modules-main/refs/heads/main/KaaTo/subs/KaaTo_UNIVERSAL_FIXED_v11_5_12.json
```

### PROCESO:
1. **Usar v11.5.12** en Sora iOS
2. **Buscar "Dandadan"** 
3. **Click en un episodio** para reproducir
4. **Revisar los logs** - verás todo el debugging con prefijo `🔧 F12 MODE:`

### QUÉ BUSCAR EN LOS LOGS:
- `🔧 F12 MODE: Full HTML preview` - HTML completo de la página
- `🔧 F12 SCRIPT X:` - Contenido de cada script
- `🎯 F12 POTENTIAL STREAM URL:` - URLs que podrían ser streams
- `🎯 F12 SCRIPT X HEX IDs:` - IDs hexadecimales encontrados

## 🎯 BUSCAR EN LOS LOGS:

### PATRONES A IDENTIFICAR:
1. **Video Player Setup**: Scripts que inicializan reproductores
2. **Manifest URLs**: URLs que contengan "manifest" o "m3u8"
3. **Video IDs**: Strings de 24 caracteres hexadecimales
4. **API Calls**: Llamadas a APIs de KaaTo para obtener streams

### EJEMPLO DE LO QUE ENCONTRAREMOS:
```
🎯 F12 SCRIPT 3 contains MANIFEST!
🎯 F12 POTENTIAL STREAM URL: https://hls.krussdomi.com/manifest/abc123def456.../master.m3u8
🎯 F12 SCRIPT 5 HEX IDs: ['abc123def456789012345678']
```

## 📋 PRÓXIMOS PASOS:

1. **Ejecutar v11.5.12** y revisar logs F12
2. **Identificar el patrón real** de cómo KaaTo obtiene video IDs
3. **Crear v11.5.13** con la extracción correcta basada en hallazgos F12
4. **Probar datos corregidos** (descripción, año, etc.)

¡Los logs F12 nos mostrarán exactamente dónde está oculto el video ID real!
