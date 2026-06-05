# Plan&Go 🌍

Plan&Go es una plataforma web colaborativa para la planificación de viajes en grupo. Permite a los usuarios crear viajes, invitar a otros miembros, proponer y votar actividades, gestionar gastos compartidos y comunicarse en tiempo real mediante un chat grupal.

Desarrollado como Trabajo de Fin de Grado (TFG) en Ingeniería Informática por la Universidad de Las Palmas de Gran Canaria (ULPGC).

---

## 🚀 Tecnologías

| Capa                       | Tecnología                          |
| -------------------------- | ----------------------------------- |
| Frontend                   | Angular 17                          |
| Backend                    | Firebase (Auth, Firestore, Storage) |
| IA                         | Groq API (llama-3.3-70b-versatile)  |
| Validación de comprobantes | Google Cloud Vision API             |
| Email                      | Resend                              |
| Pruebas                    | Jasmine + Karma                     |

---

## ✨ Funcionalidades principales

- **Autenticación** — Registro e inicio de sesión con Firebase Auth
- **Gestión de viajes** — Crear, editar, archivar y eliminar viajes
- **Itinerario** — Constructor manual o generado por IA con Groq
- **Invitaciones** — Invitar miembros a unirse al viaje por email con Resend
- **Actividades** — Proponer actividades y votar en grupo
- **Gastos** — Registro de gastos compartidos con división automática
- **Comprobantes** — Validación de tickets y pagos con Google Cloud Vision API
- **Chat** — Mensajería en tiempo real
- **Calendario** — Vista mensual del viaje con el itinerario por día
- **Buscador global** — Filtrado de contenido por sección

---

## ⚙️ Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/plan-and-go.git
cd plan-and-go

# Instalar dependencias
npm install
```

Crea el archivo `src/environments/environment.ts` con tus credenciales:

```typescript
export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "TU_API_KEY",
    authDomain: "TU_AUTH_DOMAIN",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_STORAGE_BUCKET",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID",
    resendApiKey: "TU_RESEND_API_KEY",
    testEmail: "TU_EMAIL_DE_PRUEBA",
  },
  groqApiKey: "TU_GROQ_API_KEY",
  visionApiKey: "TU_VISION_API_KEY",
};
```

---

## 🖥️ Servidor de desarrollo

```bash
ng serve
```

Navega a `http://localhost:4200/`. La aplicación se recargará automáticamente al modificar los archivos fuente.

---

## 🧪 Pruebas

```bash
# Ejecutar pruebas unitarias
ng test
```

El proyecto cuenta con **570 pruebas unitarias** implementadas con Jasmine y Karma, cubriendo componentes, servicios y páginas principales.

---

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── components/       # Componentes reutilizables
│   ├── models/           # Interfaces y modelos de datos
│   ├── pages/            # Páginas de la aplicación
│   │   └── home/
│   │       ├── dashboard/
│   │       ├── expense-detail/
│   │       ├── invite/
│   │       ├── login/
│   │       ├── register/
│   │       └── trip-detail/
│   └── services/         # Servicios de la aplicación
├── environments/         # Variables de entorno
└── assets/               # Recursos estáticos
```

---

## 👩‍💻 Autora

**Silvia González Torres** — Ingeniería Informática, ULPGC  
Trabajo de Fin de Grado — Curso 2025/2026
