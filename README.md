![Logo](https://github.com/Stranger11ac/cross_django/blob/main/cross_asistent/static/img/UTC_logo-plano.webp)

# VigIA - Rework

Asistente virtual inteligente para la Universidad Tecnológica de Coahuila (UTC).

---

## Requisitos

- Python 3.10+
- pip

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/Josue0Cg/VigIA-Rework.git
cd VigIA-Rework

# 2. Crear entorno virtual
python -m venv venv

# 3. Activar entorno virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 4. Instalar dependencias
pip install -r requirements.txt

# 5. Crear archivo .env en la raíz del proyecto
# Agregar la siguiente variable:
# OPENAI_API_KEY=tu-api-key-de-openai
```

## Configuración de la base de datos

```bash
# Crear las tablas
python manage.py migrate

# Crear superusuario para el admin
python manage.py createsuperuser

# Poblar la base de datos con información de la UTC
python manage.py poblar_utc

# Si quieres reemplazar TODA la info y empezar desde cero:
python manage.py poblar_utc --limpiar
```

## Ejecutar el servidor

```bash
python manage.py runserver
```

Abre http://127.0.0.1:8000/ en tu navegador.

## Comandos útiles

| Comando | Descripción |
|---|---|
| `python manage.py runserver` | Inicia el servidor de desarrollo |
| `python manage.py migrate` | Aplica las migraciones de la base de datos |
| `python manage.py createsuperuser` | Crea un usuario administrador |
| `python manage.py poblar_utc` | Llena la DB con info de la UTC (no duplica) |
| `python manage.py poblar_utc --limpiar` | Borra todo y vuelve a llenar la DB |

## Estructura del proyecto

```
VigIA-Rework/
├── cross_project/          # Configuración de Django
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── cross_asistent/         # App principal
│   ├── chatbot.py          # Chatbot con OpenAI GPT-4o-mini
│   ├── models.py           # Modelos de la DB
│   ├── views.py            # Vistas
│   ├── urls.py             # Rutas
│   ├── management/
│   │   └── commands/
│   │       └── poblar_utc.py  # Comando para poblar la DB
│   ├── static/
│   │   ├── css/
│   │   │   ├── styles.css
│   │   │   └── dark_theme.css
│   │   └── js/
│   │       └── settings_chatbot.js
│   └── templates/
├── .env                    # Variables de entorno (NO subir al repo)
├── requirements.txt
└── README.md
```

## Variables de entorno (.env)

```env
OPENAI_API_KEY=tu-api-key-de-openai
```

> ⚠️ **IMPORTANTE**: El archivo `.env` NO se sube al repositorio. Cada desarrollador debe crear el suyo.
   