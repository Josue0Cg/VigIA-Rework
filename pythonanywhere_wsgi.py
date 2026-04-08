# ================================================================================
# PLANTILLA WSGI PARA PYTHONANYWHERE
# ================================================================================
# Este archivo NO se usa directamente. Copia su contenido en el editor WSGI
# de PythonAnywhere (pestaña "Web" → "WSGI configuration file").
#
# IMPORTANTE: Reemplaza <TU-USUARIO> con tu nombre de usuario de PythonAnywhere.
# ================================================================================

import os
import sys

# Ruta a tu proyecto
path = '/home/<TU-USUARIO>/VigIA-Rework'
if path not in sys.path:
    sys.path.append(path)

# Ruta al virtualenv
VIRTUALENV_PATH = '/home/<TU-USUARIO>/.virtualenvs/vigia-env'
python_version = '3.10'  # Ajusta según la versión de Python que uses
activate_this = os.path.join(
    VIRTUALENV_PATH,
    f'lib/python{python_version}/site-packages'
)
sys.path.insert(0, activate_this)

# Variables de entorno para producción
os.environ['DJANGO_SETTINGS_MODULE'] = 'cross_project.settings'
os.environ['DJANGO_SECRET_KEY'] = 'GENERA-UNA-CLAVE-SECRETA-UNICA-AQUI'
os.environ['DJANGO_DEBUG'] = 'False'
os.environ['DJANGO_ALLOWED_HOSTS'] = '<TU-USUARIO>.pythonanywhere.com'

# Cargar la aplicación WSGI
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
