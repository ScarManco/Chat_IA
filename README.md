# RFID Management System

Sistema de gestión de inventario RFID con React, TypeScript y Tailwind CSS.

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Pasos para ejecutar en local

1. **Clonar o descargar el proyecto**
   ```bash
   # Si tienes el código en un repositorio
   git clone <tu-repositorio>
   cd rfid-management-system
   
   # O simplemente descomprime el archivo ZIP en una carpeta
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**
   - Ve a: `http://localhost:5173`
   - Credenciales por defecto: 
     - Email: `admin@rfid.com`
     - Contraseña: `admin123`

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── auth/           # Componentes de autenticación
│   ├── layout/         # Layout y navegación
│   └── ui/             # Componentes UI base
├── pages/              # Páginas principales
│   ├── locations/      # Gestión de ubicaciones
│   ├── antennas/       # Gestión de antenas
│   ├── sensors/        # Gestión de sensores
│   └── readings/       # Gestión de lecturas
├── lib/                # Utilidades y servicios
│   ├── auth.ts         # Servicio de autenticación
│   ├── database.ts     # Base de datos local
│   └── utils.ts        # Utilidades generales
└── App.tsx             # Componente principal
```

## 🔧 Funcionalidades

### 🔐 Autenticación
- Sistema de login/registro
- Gestión de sesiones
- Usuario administrador por defecto

### 📍 Ubicaciones
- Crear, editar y eliminar ubicaciones
- Descripción y metadatos

### 📡 Antenas
- Gestión completa de antenas RFID
- Configuración de IP y puerto
- Vinculación con ubicaciones

### 🔧 Sensores
- 8 tipos de sensores predefinidos
- Estados activo/inactivo
- Vinculación con antenas

### 📊 Lecturas RFID
- Tabla avanzada con filtros
- Exportación a CSV
- Estadísticas en tiempo real
- Vista detallada de lecturas

## 🛠️ Tecnologías Utilizadas

- **React 18** - Framework principal
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **Radix UI** - Componentes accesibles
- **React Router** - Navegación
- **LocalForage** - Almacenamiento local
- **React Hot Toast** - Notificaciones
- **Lucide React** - Iconos

## 📝 Scripts Disponibles

```bash
npm run dev      # Ejecutar en desarrollo
npm run build    # Construir para producción
npm run preview  # Vista previa de producción
npm run lint     # Linter de código
```

## 🗄️ Base de Datos

El sistema utiliza **LocalForage** para almacenamiento local persistente:
- Los datos se guardan en IndexedDB del navegador
- Incluye usuario administrador por defecto
- Datos de ejemplo para pruebas

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt
- Autenticación basada en tokens
- Validación de formularios
- Sanitización de datos

## 🎨 Diseño

- Diseño responsive para móvil y desktop
- Tema moderno con Tailwind CSS
- Componentes accesibles con Radix UI
- Iconos consistentes con Lucide

## 📞 Soporte

Si tienes problemas:
1. Verifica que Node.js esté instalado correctamente
2. Borra `node_modules` y ejecuta `npm install` nuevamente
3. Verifica que el puerto 5173 esté disponible
4. Revisa la consola del navegador para errores

## 🚀 Despliegue

Para desplegar en producción:

```bash
npm run build
```

Los archivos se generarán en la carpeta `dist/` listos para servir.