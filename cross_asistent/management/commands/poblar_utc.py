"""
Comando para poblar la base de datos con información de la UTC.
Uso: python manage.py poblar_utc
"""
from django.core.management.base import BaseCommand
from cross_asistent.models import Database, Categorias
import random
import string


def gen_uuid():
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=15))


# Datos de la UTC organizados por categoría
UTC_DATA = {
    "Información General": [
        {
            "titulo": "¿Qué es la UTC?",
            "informacion": """La Universidad Tecnológica de Coahuila (UTC) es una institución de educación superior pública ubicada en Saltillo, Coahuila, México. Fue fundada con el objetivo de formar profesionales técnicos competentes para el sector industrial y de servicios de la región sureste del estado de Coahuila.

La UTC ofrece programas educativos a nivel Técnico Superior Universitario (TSU), Ingeniería y Maestría, con un enfoque práctico orientado a las necesidades del sector productivo.

Dirección: Carretera Saltillo-Monterrey Km 1.3, Col. El Águila, CP 25710, Monclova, Coahuila, México.
Teléfono: (844) 411-6400
Página web: https://utc.edu.mx/
Facebook: https://www.facebook.com/UniversidadTecnologicadeCoahuila
Instagram: https://www.instagram.com/utcoahuila
TikTok: https://www.tiktok.com/@utdecoahuila""",
            "redirigir": "https://utc.edu.mx/",
        },
        {
            "titulo": "Rector de la UTC",
            "informacion": """El rector actual de la Universidad Tecnológica de Coahuila es el Mtro. Sergio Alberto Guadarrama Cortés.

Bajo su dirección, la UTC ha firmado convenios de colaboración con organismos como la Comisión de Derechos Humanos del Estado de Coahuila (CDHEC) y ha impulsado programas de innovación tecnológica y vinculación con la industria.""",
            "redirigir": "https://utc.edu.mx/index.php/sobre-nosotros/",
        },
        {
            "titulo": "Misión de la UTC",
            "informacion": """La misión de la Universidad Tecnológica de Coahuila es formar profesionistas e investigadores aptos para la aplicación y generación de conocimientos, capaces de contribuir al desarrollo tecnológico, económico y social de la región y del país, mediante programas educativos de calidad con un enfoque de competencias profesionales.""",
            "redirigir": "https://utc.edu.mx/index.php/sobre-nosotros/#politica",
        },
        {
            "titulo": "Visión de la UTC",
            "informacion": """La visión de la Universidad Tecnológica de Coahuila es ser una institución de educación superior reconocida por la calidad de sus programas educativos, su vinculación con el sector productivo y su contribución al desarrollo sustentable de la región, formando egresados competitivos a nivel nacional e internacional.""",
            "redirigir": "https://utc.edu.mx/index.php/sobre-nosotros/#politica",
        },
        {
            "titulo": "Ubicación y cómo llegar a la UTC",
            "informacion": """La Universidad Tecnológica de Coahuila se encuentra ubicada en:
- Dirección: Carretera Saltillo-Monterrey Km 1.3, Col. El Águila, CP 25710, Monclova, Coahuila, México
- Se puede llegar en transporte público o vehículo particular
- El campus cuenta con estacionamiento para estudiantes y visitantes

Para ubicar edificios específicos dentro del campus (biblioteca, papelería, cafetería, laboratorios, etc.) puedes usar el mapa interactivo de la página.""",
        },
        {
            "titulo": "Contacto UTC",
            "informacion": """Datos de contacto de la Universidad Tecnológica de Coahuila:
- Teléfono: (844) 411-6400
- Página web: https://utc.edu.mx/
- Facebook: https://www.facebook.com/UniversidadTecnologicadeCoahuila
- Instagram: https://www.instagram.com/utcoahuila
- TikTok: https://www.tiktok.com/@utdecoahuila
- Correo electrónico: consultar directamente en la página web""",
            "redirigir": "https://utc.edu.mx/",
        },
        {
            "titulo": "Calendario Escolar UTC",
            "informacion": """El calendario escolar de la UTC se actualiza cada año y se puede consultar y descargar desde la página oficial de la universidad. El calendario incluye las fechas de inicio y fin de cuatrimestres, periodos de inscripción, días festivos, exámenes y eventos institucionales.

Descarga el Calendario Escolar: https://utc.edu.mx/wp-content/uploads/2025/12/CALENDARIO-2026-scaled.png""",
            "redirigir": "https://utc.edu.mx/wp-content/uploads/2025/12/CALENDARIO-2026-scaled.png",
        },
        {
            "titulo": "Modelo Educativo UTC",
            "informacion": """El Modelo Educativo Nacional de las Universidades Tecnológicas se basa en competencias profesionales, con un enfoque práctico donde el 70% es práctica y 30% teoría. Los estudiantes realizan estadías en empresas como parte fundamental de su formación.

Descarga el Modelo Educativo: https://utc.edu.mx/wp-content/uploads/2024/11/men24.jpg""",
            "redirigir": "https://utc.edu.mx/wp-content/uploads/2024/11/men24.jpg",
        },
    ],
    "Oferta Educativa": [
        {
            "titulo": "Carreras TSU (Técnico Superior Universitario)",
            "informacion": """La UTC ofrece las siguientes carreras a nivel TSU (duración de 2 años / 6 cuatrimestres):

- TSU en Desarrollo y Gestión de Software
- TSU en Mecatrónica, área Automatización
- TSU en Procesos Productivos (Metal Mecánica)
- TSU en Procesos Industriales
- TSU en Redes Inteligentes y Ciberseguridad
- TSU en Seguridad Ambiental Sustentable
- TSU en Nanotecnología

Al terminar el TSU, los egresados pueden continuar con la Ingeniería (2 años más) para obtener el título de Ingeniero.""",
            "redirigir": "https://utc.edu.mx/",
        },
        {
            "titulo": "Ingenierías",
            "informacion": """La UTC ofrece las siguientes ingenierías (continuidad del TSU, 2 años adicionales):

- Ingeniería en Desarrollo y Gestión de Software
- Ingeniería en Mecatrónica
- Ingeniería en Metal Mecánica
- Ingeniería en Procesos y Operaciones Industriales
- Ingeniería en Redes Inteligentes y Ciberseguridad
- Ingeniería en Seguridad Ambiental Sustentable
- Ingeniería en Nanotecnología

El modelo educativo es 70% práctico y 30% teórico, con estadías en empresas.""",
            "redirigir": "https://utc.edu.mx/",
        },
        {
            "titulo": "Maestría en Ingeniería para la Manufactura Inteligente",
            "informacion": """La UTC ofrece la Maestría en Ingeniería para la Manufactura Inteligente, un programa de posgrado enfocado en la industria 4.0, automatización avanzada y manufactura inteligente.

Este programa está diseñado para profesionistas que desean especializarse en tecnologías de manufactura de vanguardia.""",
            "redirigir": "https://utc.edu.mx/",
        },
        {
            "titulo": "Desarrollo y Gestión de Software",
            "informacion": """La carrera de Desarrollo y Gestión de Software forma profesionales capaces de diseñar, desarrollar y gestionar software y aplicaciones tecnológicas.

Áreas de trabajo: desarrollo web, aplicaciones móviles, bases de datos, inteligencia artificial, ciberseguridad, y administración de proyectos de software.

Disponible como TSU (2 años) e Ingeniería (4 años total).""",
        },
        {
            "titulo": "Mecatrónica",
            "informacion": """La carrera de Mecatrónica, área Automatización, forma profesionales en la integración de sistemas mecánicos, electrónicos e informáticos para la automatización de procesos industriales.

Áreas de trabajo: automatización industrial, robótica, control de procesos, mantenimiento de sistemas automatizados, diseño de sistemas mecatrónicos.

Disponible como TSU (2 años) e Ingeniería (4 años total).""",
        },
        {
            "titulo": "Procesos Industriales",
            "informacion": """La carrera de Procesos Industriales forma profesionales en la optimización y mejora de procesos de producción industrial.

Áreas de trabajo: control de calidad, mejora continua, logística, gestión de producción, seguridad industrial.

Disponible como TSU (2 años) e Ingeniería en Procesos y Operaciones Industriales (4 años total).""",
        },
        {
            "titulo": "Metal Mecánica",
            "informacion": """La carrera de Metal Mecánica (Procesos Productivos) forma profesionales en procesos de manufactura, maquinado, soldadura y diseño de piezas metálicas.

Áreas de trabajo: industria automotriz, manufactura, maquinado CNC, soldadura, diseño mecánico.

Disponible como TSU (2 años) e Ingeniería (4 años total).""",
        },
        {
            "titulo": "Redes Inteligentes y Ciberseguridad",
            "informacion": """La carrera de Redes Inteligentes y Ciberseguridad forma profesionales en diseño, implementación y seguridad de redes de comunicación y sistemas informáticos.

Áreas de trabajo: administración de redes, seguridad informática, telecomunicaciones, ethical hacking, infraestructura de TI.

Disponible como TSU (2 años) e Ingeniería (4 años total).""",
        },
        {
            "titulo": "Seguridad Ambiental Sustentable",
            "informacion": """La carrera de Seguridad Ambiental Sustentable forma profesionales en la gestión ambiental, seguridad industrial y desarrollo sustentable.

Áreas de trabajo: gestión ambiental, auditorías ambientales, seguridad e higiene industrial, manejo de residuos, energías renovables.

Disponible como TSU (2 años) e Ingeniería (4 años total).""",
        },
        {
            "titulo": "Nanotecnología",
            "informacion": """La carrera de Nanotecnología forma profesionales en el estudio y aplicación de materiales a escala nanométrica.

Áreas de trabajo: investigación y desarrollo, industria de materiales avanzados, sector energético, sector biomédico, control de calidad de nanomateriales.

Disponible como TSU (2 años) e Ingeniería (4 años total).""",
        },
    ],
    "Trámites y Servicios": [
        {
            "titulo": "Inscripción y admisión a la UTC",
            "informacion": """Para inscribirte en la UTC necesitas seguir estos pasos:

1. ACREDITAR EL BACHILLERATO: Es el requisito principal para ingresar
2. PRESENTAR EL EXAMEN DE INGRESO: Pagar la ficha para el examen de admisión (costo aproximado: $500) y presentar el examen
3. PROCESO DE INCORPORACIÓN: Si eres aceptado, realizar la inscripción con los siguientes documentos:
   - Acta de nacimiento actualizada (original y dos copias)
   - Certificado de Bachillerato (original y dos copias)
   - Constancia de Autenticidad del Certificado de Bachillerato (original y dos copias)
   - CURP
   - Examen médico (Biometría Hemática, Glucosa y Grupo sanguíneo, original y dos copias)
   - Número de Afiliación al IMSS
   - INE
   - 6 fotografías tamaño infantil

El costo por cuatrimestre para nuevo ingreso es de aproximadamente $3,100.""",
            "redirigir": "https://utc.edu.mx/",
        },
        {
            "titulo": "Costos y cuotas UTC",
            "informacion": """Costos aproximados en la Universidad Tecnológica de Coahuila:

- Ficha de examen de admisión: $500 MXN
- Inscripción cuatrimestral (nuevo ingreso): $3,100 MXN aproximadamente
- Reinscripción cuatrimestral: consultar directamente con la universidad, ya que puede variar

La UTC es una universidad pública, por lo que los costos son accesibles. Además, existen programas de becas para estudiantes con buen desempeño académico o que requieran apoyo económico.

Para información actualizada sobre costos, contacta directamente a la UTC al teléfono (844) 411-6400.""",
        },
        {
            "titulo": "Becas en la UTC",
            "informacion": """La Universidad Tecnológica de Coahuila ofrece diferentes tipos de becas para sus estudiantes:

- Becas académicas por promedio
- Becas socioeconómicas
- Becas deportivas
- Becas de la Jóvenes Escribiendo el Futuro (gobierno federal)
- Becas estatales

Para solicitar una beca, acude al departamento de servicios escolares o consulta la página oficial de la UTC para conocer las convocatorias vigentes.""",
        },
        {
            "titulo": "Servicio social y estadías",
            "informacion": """En la UTC, los estudiantes deben realizar:

SERVICIO SOCIAL: Es un requisito para la titulación. Consiste en 480 horas de trabajo en una institución pública o empresa.

ESTADÍAS: Son periodos de práctica profesional en empresas reales durante el último cuatrimestre de cada nivel (TSU e Ingeniería). Las estadías son parte fundamental del modelo educativo de las universidades tecnológicas, permitiendo al estudiante aplicar sus conocimientos en un entorno laboral real.""",
        },
        {
            "titulo": "Titulación en la UTC",
            "informacion": """Para titularte en la UTC necesitas:

Nivel TSU:
- Haber aprobado todas las materias del plan de estudios
- Completar la estadía profesional
- Presentar el reporte de estadía
- Haber realizado servicio social

Nivel Ingeniería:
- Haber aprobado todas las materias del plan de estudios
- Completar la estadía profesional
- Presentar el proyecto de estadía/tesis
- Haber realizado servicio social
- Aprobación del EGEL o requisito equivalente según la carrera""",
        },
    ],
    "Instalaciones": [
        {
            "titulo": "Campus UTC instalaciones",
            "informacion": """El campus de la Universidad Tecnológica de Coahuila cuenta con las siguientes instalaciones:

- Edificios de aulas y laboratorios
- Biblioteca
- Papelería
- Cafetería
- Laboratorios especializados (cómputo, mecatrónica, metal mecánica, nanotecnología, redes)
- Auditorio
- Canchas deportivas (fútbol, básquetbol, sóftbol)
- Estacionamiento
- Áreas verdes
- Centro de idiomas
- Gimnasio

Puedes ver la ubicación de cada instalación en el mapa interactivo de la página.""",
        },
        {
            "titulo": "Biblioteca UTC",
            "informacion": """La Biblioteca de la UTC ofrece servicios de:
- Préstamo de libros y material bibliográfico
- Sala de lectura
- Acceso a bases de datos digitales
- Computadoras para consulta
- Asesoría en búsqueda de información

Horario de atención: Lunes a viernes de 8:00 a 20:00 horas
Ubicación: Dentro del campus universitario""",
        },
        {
            "titulo": "Papelería UTC",
            "informacion": """La Papelería de la UTC ofrece:
- Material escolar (cuadernos, plumas, lápices)
- Impresiones y copias
- Engargolados
- Artículos diversos

Ubicación: Dentro del campus universitario""",
        },
        {
            "titulo": "Cafetería UTC",
            "informacion": """La Cafetería de la UTC ofrece:
- Alimentos y bebidas
- Snacks y comida rápida
- Menú del día a precios accesibles

Horario: Lunes a viernes durante el horario escolar
Ubicación: Dentro del campus universitario""",
        },
    ],
    "Vida Universitaria": [
        {
            "titulo": "Halcones UTC - Deportes",
            "informacion": """Los Halcones es el equipo representativo de la Universidad Tecnológica de Coahuila en diferentes disciplinas deportivas. La UTC promueve el deporte entre sus estudiantes como parte integral de su formación.

Logros recientes:
- Jonathan Samuel Berlanga Rangel, alumno de Mecatrónica, fue seleccionado para la Selección Nacional Sub-18 de la Liga TDP.

Deportes disponibles: fútbol, básquetbol, sóftbol, entre otros.""",
        },
        {
            "titulo": "Eventos y actividades UTC",
            "informacion": """La UTC organiza diversos eventos y actividades para la comunidad universitaria:

- Cine bajo las estrellas: Evento de entretenimiento en el campo de sóftbol con proyección de películas al aire libre. En su última edición contó con más de mil asistentes.
- Premio a la Innovación: La UTC ganó el primer y segundo lugar en el Premio a la Innovación 2025. El primer lugar fue para el proyecto "Sistema de Detección de EPP mediante visión por computadora" y el segundo para "Sistema móvil de inspección remota".
- Semana cultural y deportiva
- Conferencias y talleres
- Ferias de empleo y vinculación""",
        },
        {
            "titulo": "Logros y reconocimientos UTC",
            "informacion": """Logros recientes de la Universidad Tecnológica de Coahuila:

- DOBLE PREMIO A LA INNOVACIÓN 2025: Primer y segundo lugar en el Premio a la Innovación organizado por el Comité de Innovación del Consejo de Vinculación Universidad-Empresa Coahuila Sureste.
  - 1er lugar: "Sistema de Detección de EPP mediante visión por computadora" por Leonardo Villalobos López (TSU en Procesos Productivos)
  - 2do lugar: "Sistema móvil de inspección remota" por estudiantes de Ingeniería en Mecatrónica
  - La UTC participó con 10 de los 67 proyectos presentados.

- CONVENIO CDHEC-UTC: Convenio de colaboración con la Comisión de Derechos Humanos del Estado de Coahuila para capacitación y promoción de derechos humanos.

- PROGRAMA INTERNACIONAL: El alumno Saúl Gutiérrez Chaper de Ingeniería en Procesos Industriales viajó a Corea del Sur para capacitación con la empresa Posco International Mexico e-Mobility.""",
            "redirigir": "https://utc.edu.mx/index.php/reconocimientos/",
        },
    ],
}


class Command(BaseCommand):
    help = 'Pobla la base de datos con información de la UTC obtenida de utc.edu.mx'

    def add_arguments(self, parser):
        parser.add_argument(
            '--limpiar',
            action='store_true',
            help='Elimina TODOS los datos existentes antes de insertar',
        )

    def handle(self, *args, **options):
        if options['limpiar']:
            self.stdout.write(self.style.WARNING('Eliminando datos existentes...'))
            Database.objects.all().delete()
            Categorias.objects.all().delete()

        total_insertados = 0

        for categoria_nombre, entradas in UTC_DATA.items():
            # Crear o obtener la categoría
            cat, created = Categorias.objects.get_or_create(
                categoria=categoria_nombre,
                defaults={'descripcion': f'Información sobre {categoria_nombre} de la UTC'}
            )
            if created:
                self.stdout.write(f'  + Categoría creada: {categoria_nombre}')

            for entrada in entradas:
                # Verificar si ya existe por título
                if Database.objects.filter(titulo=entrada['titulo']).exists():
                    self.stdout.write(f'  ~ Ya existe: {entrada["titulo"]}')
                    continue

                Database.objects.create(
                    categoria=cat,
                    titulo=entrada['titulo'],
                    informacion=entrada.get('informacion', ''),
                    redirigir=entrada.get('redirigir', ''),
                    uuid=gen_uuid(),
                )
                total_insertados += 1
                self.stdout.write(self.style.SUCCESS(f'  + {entrada["titulo"]}'))

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(f'Completado: {total_insertados} entradas insertadas.'))
        self.stdout.write(f'Total en la DB: {Database.objects.count()} entradas')
