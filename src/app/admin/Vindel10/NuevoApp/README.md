# NuevoApp - iOS Marketplace

<p align="center">
  <img src="icon.png" alt="Nuevo Logo" width="120" height="120">
</p>

Una aplicación de marketplace profesional para iOS desarrollada con **SwiftUI** y **Firebase**.

## ✨ Características

- 🏠 **Feed de anuncios** - Explora productos destacados y recientes
- 🔍 **Búsqueda avanzada** - Filtra por categoría, precio, ubicación
- 📸 **Publicar anuncios** - Sube fotos y describe tus productos
- 💬 **Chat en tiempo real** - Comunícate con compradores/vendedores
- ❤️ **Favoritos** - Guarda los anuncios que te interesan
- 👤 **Perfil personalizado** - Gestiona tu cuenta y anuncios
- 🌙 **Modo oscuro** - Soporte completo para dark mode
- 🔔 **Notificaciones** - Recibe alertas de nuevos mensajes

## 🛠️ Tecnologías

- **SwiftUI** - Framework de UI declarativo
- **Swift 5.9+** - Lenguaje de programación
- **Firebase Auth** - Autenticación de usuarios
- **Firebase Firestore** - Base de datos en tiempo real
- **Firebase Storage** - Almacenamiento de imágenes
- **Async/Await** - Concurrencia moderna

## 📋 Requisitos

- Xcode 15.0+
- iOS 16.0+
- macOS Sonoma 14.0+
- Cuenta de Firebase (gratuita)

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/NuevoApp.git
cd NuevoApp
```

### 2. Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o usa uno existente
3. Añade una app iOS con el Bundle ID: `com.nuevo.app`
4. Descarga el archivo `GoogleService-Info.plist`
5. Arrastra el archivo a la carpeta `NuevoApp/` en Xcode

### 3. Instalar dependencias de Firebase (Swift Package Manager)

1. Abre el proyecto en Xcode
2. Ve a **File > Add Package Dependencies**
3. Añade el siguiente URL: `https://github.com/firebase/firebase-ios-sdk`
4. Selecciona los siguientes productos:
   - FirebaseAuth
   - FirebaseFirestore
   - FirebaseStorage
   - FirebaseMessaging (opcional, para notificaciones)

### 4. Configurar Firestore Rules

En Firebase Console > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios
    match /usuarios/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Anuncios
    match /anuncios/{anuncioId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Conversaciones
    match /conversaciones/{convId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
    }
    
    // Mensajes
    match /mensajes/{msgId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. Ejecutar la app

1. Selecciona un simulador o dispositivo
2. Presiona `Cmd + R` o haz clic en el botón Play

## 📁 Estructura del Proyecto

```
NuevoApp/
├── NuevoApp.swift          # Entry point
├── ContentView.swift        # Vista principal con TabBar
│
├── Models/
│   ├── User.swift          # Modelo de usuario
│   ├── Listing.swift       # Modelo de anuncio
│   ├── Message.swift       # Modelo de mensaje/conversación
│   └── Category.swift      # Categorías de anuncios
│
├── Views/
│   ├── HomeView.swift      # Feed principal
│   ├── SearchView.swift    # Búsqueda y filtros
│   ├── CreateListingView.swift # Crear anuncio
│   ├── ListingDetailView.swift # Detalle de anuncio
│   ├── MessagesView.swift  # Lista de conversaciones
│   ├── ChatView.swift      # Chat individual
│   ├── ProfileView.swift   # Perfil de usuario
│   └── LoginView.swift     # Autenticación
│
├── ViewModels/
│   ├── AuthViewModel.swift     # Lógica de autenticación
│   ├── ListingViewModel.swift  # Lógica de anuncios
│   └── MessagesViewModel.swift # Lógica de mensajes
│
├── Components/
│   ├── ListingCard.swift   # Tarjeta de anuncio
│   ├── CustomTabBar.swift  # TabBar personalizado
│   ├── CategoryPill.swift  # Píldora de categoría
│   └── PrimaryButton.swift # Botón principal
│
├── Extensions/
│   └── Color+Extensions.swift # Extensiones de Color y View
│
└── Assets.xcassets/        # Recursos visuales
```

## 🎨 Diseño

La app sigue las guías de diseño de Apple con:

- **Sistema de diseño consistente** con colores, tipografía y espaciado definidos
- **Animaciones fluidas** usando `spring()` y `matchedGeometryEffect`
- **Feedback háptico** en interacciones importantes
- **Soporte completo para Dynamic Type**
- **Accesibilidad** con labels y hints

## 🔧 Configuración Adicional

### Notificaciones Push (Opcional)

1. Configura APNs en Apple Developer Portal
2. Sube el certificado a Firebase Console
3. Descomentar código de FirebaseMessaging en `NuevoApp.swift`

### Analytics (Opcional)

Añade `FirebaseAnalytics` en las dependencias de SPM para rastrear eventos.

## 📱 Screenshots

| Home | Búsqueda | Detalle | Chat |
|------|----------|---------|------|
| 📷   | 📷       | 📷      | 📷   |

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

Desarrollado con ❤️ para el marketplace Nuevo.

---

**Nota:** Este proyecto incluye datos mock para desarrollo. En producción, todo se conectará a Firebase.
