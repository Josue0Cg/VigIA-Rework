# 🚀 Deploy VigIA en PythonAnywhere

Guía paso a paso para desplegar el proyecto VigIA (Django + SQLite) en PythonAnywhere.

---

## 1. Crear cuenta en PythonAnywhere

1. Ve a [pythonanywhere.com](https://www.pythonanywhere.com/) y crea una cuenta
2. Anota tu **nombre de usuario** (lo usarás en todos los paths)

---

## 2. Subir el código

### Opción A: Desde GitHub (recomendado)

En la consola Bash de PythonAnywhere:

```bash
cd ~
git clone https://github.com/TU-REPO/VigIA-Rework.git
```

### Opción B: Upload manual

1. Ve a la pestaña **Files**
2. Sube un `.zip` de tu proyecto
3. Descomprímelo desde la consola Bash:

```bash
cd ~
unzip VigIA-Rework.zip
```

---

## 3. Crear virtualenv

En la consola Bash de PythonAnywhere:

```bash
mkvirtualenv vigia-env --python=/usr/bin/python3.10
```

Instalar dependencias:

```bash
cd ~/VigIA-Rework
pip install -r requirements.txt
```

> ⚠️ **Si `psycopg2` da error**, edita `requirements.txt` y comenta/elimina las líneas de `psycopg2` y `psycopg2-binary` (no los necesitas con SQLite).

Instalar el modelo de spaCy:

```bash
python -m spacy download es_core_news_sm
```

---

## 4. Crear el archivo `.env`

En la consola Bash:

```bash
cd ~/VigIA-Rework
nano .env
```

Agrega el contenido:

```env
OPENAI_API_KEY=tu-api-key-de-openai-aqui
DJANGO_SECRET_KEY=genera-una-clave-secreta-larga-y-unica
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=<TU-USUARIO>.pythonanywhere.com
```

> 💡 Para generar una SECRET_KEY puedes ejecutar:
> ```bash
> python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
> ```

---

## 5. Configurar la Web App

1. Ve a la pestaña **Web** en el dashboard
2. Click en **"Add a new web app"**
3. Selecciona **"Manual configuration"** (NO Django)
4. Selecciona **Python 3.10**

### Configurar Virtualenv

En la sección "Virtualenv":
```
/home/<TU-USUARIO>/.virtualenvs/vigia-env
```

### Configurar WSGI

Click en el enlace del **WSGI configuration file** y reemplaza TODO su contenido con el contenido de `pythonanywhere_wsgi.py`:

```python
import os
import sys

# Ruta a tu proyecto
path = '/home/<TU-USUARIO>/VigIA-Rework'
if path not in sys.path:
    sys.path.append(path)

# Variables de entorno
os.environ['DJANGO_SETTINGS_MODULE'] = 'cross_project.settings'

# Cargar la aplicación
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

> ⚠️ **Reemplaza `<TU-USUARIO>`** con tu nombre de usuario real de PythonAnywhere.

---

## 6. Configurar archivos estáticos

En la sección **"Static files"** de la pestaña Web:

| URL | Directory |
|---|---|
| `/static/` | `/home/<TU-USUARIO>/VigIA-Rework/static/` |
| `/media/` | `/home/<TU-USUARIO>/VigIA-Rework/media/` |

---

## 7. Ejecutar migraciones y collectstatic

En la consola Bash:

```bash
cd ~/VigIA-Rework
workon vigia-env

# Aplicar migraciones
python manage.py migrate

# Recolectar archivos estáticos
python manage.py collectstatic --noinput

# (Opcional) Crear superusuario
python manage.py createsuperuser
```

---

## 8. ¡Lanzar!

1. Ve a la pestaña **Web**
2. Click en **"Reload"** (botón verde)
3. Visita `https://<TU-USUARIO>.pythonanywhere.com`

---

## 🔧 Troubleshooting

### Error "ModuleNotFoundError"
- Verifica que el virtualenv esté configurado correctamente
- Revisa que el path del proyecto sea correcto en el WSGI

### Los estilos/JS no cargan
- Verifica la configuración de **Static files** en la pestaña Web
- Ejecuta `python manage.py collectstatic` de nuevo

### Error de memoria (spaCy)
- El plan gratuito tiene 512 MB RAM. Si spaCy consume demasiado, considera el plan Hacker ($5/mes)

### Error "DisallowedHost"
- Agrega tu dominio a `DJANGO_ALLOWED_HOSTS` en el `.env`

### Error con psycopg2
- Elimina `psycopg2` y `psycopg2-binary` del `requirements.txt` (no los necesitas con SQLite)

---

## 📋 Checklist final

- [ ] Código subido a PythonAnywhere
- [ ] Virtualenv creado con dependencias instaladas
- [ ] Archivo `.env` creado con API keys
- [ ] WSGI configurado con paths correctos
- [ ] Static files configurados (URL + Directory)
- [ ] `migrate` ejecutado
- [ ] `collectstatic` ejecutado
- [ ] Web app recargada
- [ ] Sitio accesible en `https://<TU-USUARIO>.pythonanywhere.com`
