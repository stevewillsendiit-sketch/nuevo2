#!/bin/bash

# Script para extraer credenciales de Firebase del proyecto iOS
# y configurar automáticamente la app web

echo "🔍 Buscando GoogleService-Info.plist..."

# Buscar el archivo en el proyecto iOS
PLIST_FILE=$(find /Users/alex/Desktop/nuevo -name "GoogleService-Info.plist" 2>/dev/null | head -n 1)

if [ -z "$PLIST_FILE" ]; then
    echo "❌ No se encontró GoogleService-Info.plist"
    echo ""
    echo "📋 Alternativa: Copia manualmente desde Firebase Console"
    echo "   1. Ve a https://console.firebase.google.com"
    echo "   2. Selecciona tu proyecto"
    echo "   3. ⚙️ Project Settings > General > Your apps"
    echo "   4. Selecciona la app web (o añade una nueva)"
    echo "   5. Copia las credenciales"
    exit 1
fi

echo "✅ Encontrado: $PLIST_FILE"
echo ""
echo "📝 Extrayendo credenciales..."

# Extraer valores del plist
API_KEY=$(grep -A 1 "API_KEY" "$PLIST_FILE" | tail -1 | sed 's/.*<string>\(.*\)<\/string>.*/\1/')
PROJECT_ID=$(grep -A 1 "PROJECT_ID" "$PLIST_FILE" | tail -1 | sed 's/.*<string>\(.*\)<\/string>.*/\1/')
STORAGE_BUCKET=$(grep -A 1 "STORAGE_BUCKET" "$PLIST_FILE" | tail -1 | sed 's/.*<string>\(.*\)<\/string>.*/\1/')
SENDER_ID=$(grep -A 1 "GCM_SENDER_ID" "$PLIST_FILE" | tail -1 | sed 's/.*<string>\(.*\)<\/string>.*/\1/')
APP_ID=$(grep -A 1 "GOOGLE_APP_ID" "$PLIST_FILE" | tail -1 | sed 's/.*<string>\(.*\)<\/string>.*/\1/')

# Crear .env.local
ENV_FILE="/Users/alex/Desktop/nuevo/nuevo2/.env.local"

cat > "$ENV_FILE" << EOF
# Credenciales de Firebase (extraídas automáticamente de tu app iOS)
# Este archivo conecta la app web con la misma base de datos que tu app iOS

NEXT_PUBLIC_FIREBASE_API_KEY=$API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$PROJECT_ID.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=$PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=$APP_ID
EOF

echo "✅ Archivo .env.local creado con éxito!"
echo ""
echo "📱 Tu app web ahora está conectada con:"
echo "   - Mismo proyecto Firebase: $PROJECT_ID"
echo "   - Misma base de datos (Firestore)"
echo "   - Mismo sistema de autenticación"
echo "   - Mismo almacenamiento de imágenes"
echo ""
echo "🔄 Reinicia el servidor de desarrollo:"
echo "   cd /Users/alex/Desktop/nuevo/nuevo2"
echo "   npm run dev"
echo ""
echo "🎉 ¡Listo! Ambas apps comparten los mismos datos."
