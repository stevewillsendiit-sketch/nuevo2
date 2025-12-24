# Nuevo - Plataforma Web de Compra y Venta

Versión web de la aplicación Nuevo creada con Next.js, React, TypeScript, Firebase y Tailwind CSS.

## 🚀 Características

- ✅ Autenticación con Firebase Auth
- ✅ Base de datos Firestore
- ✅ Almacenamiento de imágenes con Firebase Storage
- ✅ Diseño responsive con Tailwind CSS
- ✅ TypeScript para type safety
- ✅ Navegación con TabBar personalizado
- ✅ Búsqueda y filtros por categoría
- ✅ Vista detalle de anuncios
- ✅ Sistema de favoritos

## 📋 Requisitos previos

- Node.js 18.x o superior
- npm o yarn
- Proyecto de Firebase

## 🔧 Instalación

1. **Navegar al directorio del proyecto**

```bash
cd nuevo2
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar Firebase**

   a. Crea un archivo `.env.local` en la raíz del proyecto:

   ```bash
   cp .env.local.example .env.local
   ```

   b. Ve a la [Consola de Firebase](https://console.firebase.google.com)
   
   c. Crea un nuevo proyecto o selecciona uno existente
   
   d. Ve a **Project Settings** > **General** > **Your apps**
   
   e. Copia las credenciales de configuración web y pégalas en `.env.local`:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
   ```

4. **Habilitar servicios en Firebase**

   En la consola de Firebase:
   
   - **Authentication**: Habilita el método de Email/Password
   - **Firestore Database**: Crea una base de datos en modo de prueba
   - **Storage**: Crea un bucket de almacenamiento

## 🏃 Ejecución

### Modo desarrollo

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

### Modo producción

```bash
npm run build
npm start
```

## 📁 Estructura del proyecto

```
nuevo2/
├── src/
│   ├── app/                    # Páginas de Next.js (App Router)
│   │   ├── layout.tsx         # Layout principal
│   │   ├── page.tsx           # Página de inicio
│   │   ├── ad/[id]/           # Detalle de anuncio
│   │   ├── explore/           # Explorar anuncios
│   │   ├── publish/           # Publicar anuncio
│   │   ├── messages/          # Mensajes
│   │   ├── profile/           # Perfil de usuario
│   │   ├── login/             # Inicio de sesión
│   │   └── register/          # Registro
│   ├── components/            # Componentes reutilizables
│   │   ├── AnuncioCard.tsx
│   │   ├── AnuncioHorizontalView.tsx
│   │   ├── SearchBar.tsx
│   │   ├── CategoryChips.tsx
│   │   └── CustomTabBar.tsx
│   ├── contexts/              # Contextos de React
│   │   └── AuthContext.tsx
│   ├── lib/                   # Librerías y servicios
│   │   ├── firebase.ts        # Configuración de Firebase
│   │   ├── auth.service.ts    # Servicios de autenticación
│   │   └── anuncios.service.ts # Servicios de anuncios
│   └── types/                 # Definiciones de TypeScript
│       └── index.ts
├── .env.local                 # Variables de entorno (crear)
├── .env.local.example         # Plantilla de variables
├── package.json
└── README.md
```

## 🎨 Componentes principales

### AnuncioCard
Tarjeta de anuncio con dos modos:
- `soloImagen={true}`: Solo muestra imagen y precio (vista grid)
- `soloImagen={false}`: Muestra imagen, título, ubicación y estadísticas

### AnuncioHorizontalView
Vista horizontal de anuncio con imagen cuadrada (140x140), título, categoría, descripción y precio.

### SearchBar
Barra de búsqueda con icono.

### CategoryChips
Pills horizontales para filtrar por categoría.

### CustomTabBar
TabBar fijo en la parte inferior con 5 tabs: Inicio, Explorar, Publicar (verde), Mensajes y Perfil.

## 🔐 Autenticación

El contexto `AuthContext` proporciona:

```typescript
const { user, usuario, loading, signIn, signUp, signOut } = useAuth();
```

## 📱 Páginas

- **/** - Home: Grid de anuncios con búsqueda y filtros
- **/ad/[id]** - Detalle del anuncio con galería de imágenes
- **/explore** - Explorar anuncios (en construcción)
- **/publish** - Publicar nuevo anuncio (en construcción)
- **/messages** - Mensajes entre usuarios (en construcción)
- **/profile** - Perfil del usuario (en construcción)
- **/login** - Inicio de sesión
- **/register** - Registro de usuario

## 🛠️ Tecnologías

- **Next.js 14+** - Framework React con App Router
- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de estilos
- **Firebase** - Authentication, Firestore, Storage
- **React Icons** - Iconos
- **date-fns** - Manejo de fechas

