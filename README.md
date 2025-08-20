# Mobile Repair Manager Frontend

## 📋 Descripción

Frontend desarrollado en **Angular 20** con **TypeScript** para gestionar una empresa de reparación de teléfonos móviles. Esta aplicación SPA (Single Page Application) proporciona una interfaz moderna y responsiva para manejar clientes, teléfonos y reparaciones con autenticación completa y gestión de estados.

### 🎯 Prueba Técnica - INNPACTIA

Este proyecto fue desarrollado como parte de una prueba técnica que incluye:
- Sistema de autenticación JWT completo
- Gestión integral de clientes con validaciones
- Registro y seguimiento detallado de teléfonos
- Control completo del ciclo de vida de reparaciones
- Dashboard intuitivo con navegación fluida
- Arquitectura escalable y mantenible

## 🛠️ Stack Tecnológico

### Frontend Core
- **Angular 20** - Framework principal con Zoneless Change Detection
- **TypeScript** - Tipado estático y programación orientada a objetos
- **Angular Signals** - Gestión reactiva del estado
- **RxJS** - Programación reactiva y manejo de streams
- **Angular Router** - Navegación y lazy loading
- **Angular Forms** - Formularios reactivos con validaciones

### UI/UX Framework
- **PrimeNG 20** - Biblioteca de componentes empresariales
- **PrimeFlex/Tailwind CSS** - Utilidades de diseño responsivo
- **PrimeIcons** - Biblioteca de iconos
- **Aura Theme** - Tema moderno con soporte para modo oscuro

### Arquitectura y Patrones
- **Clean Architecture** - Separación clara de responsabilidades
- **Feature-Based Structure** - Organización modular por características
- **Service-Repository Pattern** - Abstracción de acceso a datos
- **Interceptor Pattern** - Manejo centralizado de HTTP
- **Guard Pattern** - Protección de rutas y autorización
- **Custom Components** - Componentes reutilizables y tipados

## 📁 Estructura del Proyecto

```
src/app/
├── core/                           # Funcionalidades centrales
│   ├── constants/                  # Constantes globales
│   │   └── form-errors-messages.ts # Mensajes de error centralizados
│   ├── enum/                       # Enumeraciones
│   │   └── auth/                   # Enums de autenticación
│   ├── guards/                     # Guards de protección
│   │   └── auth-guard.ts          # Protección de rutas
│   ├── interceptors/              # Interceptores HTTP
│   │   ├── auth/                  # Interceptor de autenticación
│   │   ├── error/                 # Interceptor de errores
│   │   └── loading/               # Interceptor de loading
│   ├── interfaces/                # Interfaces globales
│   │   ├── auth/                  # Interfaces de autenticación
│   │   └── error-handler/         # Interfaces de manejo de errores
│   ├── layout/                    # Componentes de layout
│   │   ├── layout.ts             # Layout principal
│   │   ├── navbar/               # Barra de navegación
│   │   └── sidebar/              # Menú lateral
│   └── services/                  # Servicios centrales
│       ├── auth/                 # Servicio de autenticación
│       ├── global-error-handler/ # Manejo global de errores
│       ├── http-service/         # Servicio HTTP personalizado
│       ├── layout/               # Configuración de layout
│       ├── loading/              # Servicio de loading
│       ├── notification/         # Servicio de notificaciones
│       └── storage-service/      # Servicio de almacenamiento
│
├── features/                      # Módulos de características
│   ├── auth/                     # Módulo de autenticación
│   │   └── login/               # Componente de login
│   ├── clients/                  # Módulo de clientes
│   │   ├── components/          # Componentes del módulo
│   │   │   ├── client-list/     # Lista de clientes
│   │   │   ├── client-form-modal/ # Modal de formulario
│   │   │   ├── client-phones/   # Teléfonos por cliente
│   │   │   ├── phone-form-modal/ # Modal de teléfonos
│   │   │   ├── phone-repairs/   # Reparaciones por teléfono
│   │   │   └── repair-form-modal/ # Modal de reparaciones
│   │   ├── enum/                # Enumeraciones específicas
│   │   ├── interfaces/          # Interfaces del dominio
│   │   ├── services/            # Servicios de datos
│   │   └── clients.routes.ts    # Rutas del módulo
│   └── users/                    # Módulo de usuarios (Solo Super Admin)
│       ├── components/          # Componentes de usuarios
│       ├── interfaces/          # Interfaces de usuarios
│       ├── services/            # Servicios de usuarios
│       └── users.routes.ts      # Rutas de usuarios
│
└── shared/                        # Componentes y utilidades compartidas
    ├── components/               # Componentes reutilizables
    │   ├── data-table/          # Tabla de datos genérica
    │   ├── input-custom/        # Input personalizado
    │   └── spinner/             # Componente de loading
    ├── interfaces/              # Interfaces compartidas
    │   ├── menu/               # Interfaces de menú
    │   └── table/              # Interfaces de tabla
    └── utils/                   # Utilidades compartidas
        └── menu.utils.ts       # Utilidades de menú
```

## ⚡ Instalación y Configuración

### Prerequisitos

- **Node.js** (v18 o superior)
- **npm** o **yarn**
- **Angular CLI** (v20 o superior)
- **Git**

### 🚀 Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/mobile-repair-manager-frontend.git
cd mobile-repair-manager-frontend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar entornos**

Editar `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'  // URL del backend
};
```

4. **Ejecutar en modo desarrollo**
```bash
ng serve
```

La aplicación estará disponible en: `http://localhost:4200`

5. **Compilar para producción**
```bash
ng build --configuration production
```

## 🔐 Credenciales de Acceso

### Super Administrador
- **Usuario:** `superadmin`
- **Contraseña:** `admin123`

### Administrador
- **Usuario:** `admin1`
- **Contraseña:** `admin123`

## 🏗️ Arquitectura y Patrones Implementados

### **1. Clean Architecture**
```
Presentation Layer (Components/Pages)
    ↓
Business Logic Layer (Services)
    ↓
Data Access Layer (HTTP/Storage)
```

### **2. Feature-Based Organization**
- Módulos independientes por funcionalidad
- Lazy loading para optimización de carga
- Interfaces y servicios específicos por dominio

### **3. Reactive Programming**
- **Angular Signals** para estado reactivo
- **RxJS Observables** para manejo de datos asincrónicos
- **Computed Signals** para valores derivados

### **4. Component Architecture**
- **Smart/Dumb Components** - Separación de responsabilidades
- **Input/Output Pattern** - Comunicación entre componentes
- **Custom Components** - Componentes reutilizables tipados

## 🚀 Funcionalidades Principales

### ✅ **Sistema de Autenticación Completo**

**Características:**
- Login con JWT tokens
- Protección de rutas con guards
- Manejo automático de expiración de sesión
- Persistencia segura en localStorage
- Redirects inteligentes post-autenticación

**Implementación:**
```typescript
// Guard de autenticación
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  return authService.validateCurrentSession().pipe(
    map(isValid => isValid || redirectToLogin())
  );
};

// Guard de roles
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => authService.hasRole(allowedRoles);
};
```

### ✅ **Gestión Avanzada de Estado**

**Angular Signals:**
```typescript
// Estado reactivo con signals
private _authState = signal<AuthState>({
  isAuthenticated: false,
  user: null,
  token: null
});

// Computed values
readonly isAuthenticated = computed(() => this._authState().isAuthenticated);
readonly currentUser = computed(() => this._authState().user);
```

### ✅ **Sistema de Interceptores HTTP**

**Auth Interceptor:**
- Inyección automática de tokens JWT
- Manejo de renovación de tokens
- Logout automático en errores 401

**Loading Interceptor:**
- Spinner global automático
- Control centralizado de estado de carga

**Error Interceptor:**
- Manejo centralizado de errores HTTP
- Notificaciones automáticas de errores
- Logging estructurado

### ✅ **Componentes Reutilizables**

**Input Custom:**
```typescript
// Input tipado y reutilizable
<app-input-custom
  label="Correo Electrónico"
  type="email"
  placeholder="usuario@ejemplo.com"
  formControlName="email"
  [maxlength]="100"
></app-input-custom>
```

**Data Table Genérica:**
```typescript
// Tabla genérica tipada
<app-data-table
  [data]="clients()"
  [config]="tableConfig()"
  (actionExecuted)="handleAction($event)"
></app-data-table>
```

### ✅ **Gestión Global de Errores**

```typescript
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: Error | HttpErrorResponse): void {
    // Manejo inteligente por tipo de error
    if (error instanceof HttpErrorResponse) {
      this.handleHttpError(error);
    } else {
      this.handleClientError(error);
    }
  }
}
```

### ✅ **Sistema de Notificaciones**

```typescript
// Servicio de notificaciones tipado
success(summary: string, detail: string): void
error(summary: string, detail: string): void
warning(summary: string, detail: string): void
userCreated(entityName?: string): void
sessionExpired(): void
```

## 🎨 **Funcionalidades de UI/UX**

### **1. Modo Oscuro Automático**
- Toggle dinámico entre tema claro y oscuro
- Persistencia de preferencias
- Transiciones suaves

### **2. Diseño Responsivo**
- Mobile-first approach
- Breakpoints optimizados
- Componentes adaptativos

### **3. Navegación Intuitiva**
- Sidebar colapsible
- Breadcrumbs automáticos
- Indicadores de estado

### **4. Validaciones en Tiempo Real**
- Validación reactiva de formularios
- Mensajes de error contextuales
- Feedback visual inmediato

## 📊 **Rutas y Navegación**

### **Estructura de Rutas:**
```typescript
const routes: Routes = [
  {
    path: 'auth',
    canActivate: [noAuthGuard],
    children: [
      { path: 'login', component: LoginComponent }
    ]
  },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      {
        path: 'users',
        canActivate: [roleGuard([UserRole.SUPER_ADMIN])],
        loadChildren: () => import('./users/users.routes')
      },
      {
        path: 'clients',
        loadChildren: () => import('./clients/clients.routes')
      }
    ]
  }
];
```

### **Lazy Loading Implementado:**
- Carga diferida por módulos
- Optimización de bundle size
- Mejora de performance inicial

## 🔒 **Seguridad Implementada**

### **1. Guards de Protección**
- **authGuard**: Protección de rutas autenticadas
- **noAuthGuard**: Prevención de acceso a auth si ya está logueado
- **roleGuard**: Control de acceso por roles

### **2. Validación de Tokens**
- Verificación automática de expiración
- Logout automático en tokens inválidos
- Renovación transparente de sesiones

### **3. Sanitización de Datos**
- Validación de inputs en formularios
- Escape de contenido dinámico
- Protección contra XSS

## 📱 **Funcionalidades por Módulo**

### **🔐 Autenticación**
- Login con credenciales
- Validación de formularios
- Manejo de errores de autenticación
- Redirects inteligentes

### **👥 Gestión de Clientes**
- ✅ **Listar clientes** con paginación y búsqueda
- ✅ **Crear cliente** con validaciones completas
- ✅ **Editar cliente** con preservación de datos
- ✅ **Activar/Desactivar** clientes
- ✅ **Eliminar cliente** con confirmaciones
- 📱 **Ver teléfonos** por cliente

### **📱 Gestión de Teléfonos**
- ✅ **Registrar teléfono** con validación de IMEI
- ✅ **Editar información** del dispositivo
- ✅ **Control de condición** y garantías
- ✅ **Historial completo** de reparaciones
- 🔧 **Navegar a reparaciones** por teléfono

### **🔧 Gestión de Reparaciones**
- ✅ **Crear reparación** con prioridades y estados
- ✅ **Timeline visual** de reparaciones
- ✅ **Actualizar estado** del progreso
- ✅ **Gestión de costos** estimados y finales
- ✅ **Notas técnicas** y del cliente
- ✅ **Filtros y búsqueda** avanzada

### **👤 Gestión de Usuarios** (Solo Super Admin)
- ✅ **Crear administradores**
- ✅ **Gestionar permisos**
- ✅ **Activar/Desactivar usuarios**
- ✅ **Control de acceso** por roles

## ⚙️ **Scripts Disponibles**

```json
{
  "scripts": {
    "ng": "ng",
    "start": "ng serve",              // Desarrollo en http://localhost:4200
    "build": "ng build",              // Build de producción
    "watch": "ng build --watch",      // Build con watch mode
    "test": "ng test",                // Ejecutar pruebas unitarias
    "lint": "ng lint"                 // Linting del código
  }
}
```

## 🧪 **Testing y Calidad**

### **Herramientas de Testing:**
- **Jasmine & Karma** - Testing unitario
- **Angular Testing Utilities** - Testing de componentes
- **ESLint** - Linting y estándares de código
- **TypeScript Strict Mode** - Tipado estricto

### **Estándares de Código:**
- **Prettier** - Formateo consistente
- **ESLint + Angular Rules** - Reglas específicas de Angular
- **Path Mapping** - Imports organizados con aliases

## 🔄 Próximas Mejoras

### **Deployment y CI/CD**
- **CI/CD** con GitHub Actions o AWS CodePipeline
- **Deployment** en AWS Elastic Beanstalk


## 👨‍💻 Autor

**Heider Rey Hernández** - Desarrollador Full Stack

---

**¡Gracias por revisar este proyecto!** 🚀