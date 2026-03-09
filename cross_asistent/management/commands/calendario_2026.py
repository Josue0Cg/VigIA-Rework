"""
Comando para insertar el Calendario Escolar UTC 2026 en la base de datos.
Uso: python manage.py calendario_2026
"""
from django.core.management.base import BaseCommand
from cross_asistent.models import Database, Categorias
from datetime import datetime
from zoneinfo import ZoneInfo
import random
import string


def gen_uuid():
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=15))


tz = ZoneInfo('America/Mexico_City')


def fecha(year, month, day, hour=8, minute=0):
    return datetime(year, month, day, hour, minute, tzinfo=tz)


# Calendario Escolar UTC 2026
EVENTOS_2026 = [
    # ─── CUATRIMESTRE ENERO - ABRIL 2026 ─────────────────────────────
    {
        "titulo": "Inicio de cuatrimestre Enero-Abril 2026",
        "informacion": "Inicio del cuatrimestre Enero-Abril 2026. Primer día de clases.",
        "inicio": fecha(2026, 1, 7),
        "fin": fecha(2026, 1, 7, 17),
        "className": "bg_calendar_orange",
        "allDay": True,
    },
    {
        "titulo": "Suspensión de actividades - Día de la Constitución",
        "informacion": "Suspensión de actividades por el Día de la Constitución Mexicana.",
        "inicio": fecha(2026, 2, 2),
        "fin": fecha(2026, 2, 2, 17),
        "className": "bg_calendar_yellow",
        "allDay": True,
    },
    {
        "titulo": "Examen de ingreso T.S.U.",
        "informacion": "Examen de ingreso para aspirantes a nivel Técnico Superior Universitario (TSU).",
        "inicio": fecha(2026, 2, 24),
        "fin": fecha(2026, 2, 24, 17),
        "className": "bg_calendar_red",
        "allDay": True,
    },
    {
        "titulo": "Suspensión de actividades - Natalicio de Benito Juárez",
        "informacion": "Suspensión de actividades por el Natalicio de Benito Juárez.",
        "inicio": fecha(2026, 3, 16),
        "fin": fecha(2026, 3, 16, 17),
        "className": "bg_calendar_yellow",
        "allDay": True,
    },
    {
        "titulo": "Resultados de examen de ingreso",
        "informacion": "Publicación de los resultados del examen de ingreso.",
        "inicio": fecha(2026, 3, 30),
        "fin": fecha(2026, 3, 31, 17),
        "className": "bg_calendar_pink",
        "allDay": True,
    },
    {
        "titulo": "Periodo de incorporación nuevo ingreso TSU e ING",
        "informacion": "Periodo de incorporación (inscripción) para estudiantes de nuevo ingreso a nivel TSU e Ingeniería.",
        "inicio": fecha(2026, 4, 1),
        "fin": fecha(2026, 4, 3, 17),
        "className": "bg_calendar_green",
        "allDay": True,
    },
    {
        "titulo": "Fin de cuatrimestre Enero-Abril 2026",
        "informacion": "Último día del cuatrimestre Enero-Abril 2026.",
        "inicio": fecha(2026, 4, 30),
        "fin": fecha(2026, 4, 30, 17),
        "className": "bg_calendar_purple",
        "allDay": True,
    },

    # ─── CUATRIMESTRE MAYO - AGOSTO 2026 ─────────────────────────────
    {
        "titulo": "Suspensión de actividades - Día del Trabajo",
        "informacion": "Suspensión de actividades por el Día del Trabajo.",
        "inicio": fecha(2026, 5, 1),
        "fin": fecha(2026, 5, 1, 17),
        "className": "bg_calendar_yellow",
        "allDay": True,
    },
    {
        "titulo": "Inicio de cuatrimestre Mayo-Agosto 2026",
        "informacion": "Inicio del cuatrimestre Mayo-Agosto 2026. Primer día de clases.",
        "inicio": fecha(2026, 5, 4),
        "fin": fecha(2026, 5, 5, 17),
        "className": "bg_calendar_orange",
        "allDay": True,
    },
    {
        "titulo": "Suspensión de actividades - Día del Maestro",
        "informacion": "Suspensión de actividades por el Día del Maestro.",
        "inicio": fecha(2026, 5, 15),
        "fin": fecha(2026, 5, 15, 17),
        "className": "bg_calendar_yellow",
        "allDay": True,
    },
    {
        "titulo": "Inicio de estadías empresariales",
        "informacion": "Inicio del periodo de estadías empresariales para estudiantes de último cuatrimestre.",
        "inicio": fecha(2026, 6, 8),
        "fin": fecha(2026, 6, 13, 17),
        "className": "bg_calendar_teal",
        "allDay": True,
    },
    {
        "titulo": "Examen de ingreso Ingeniería",
        "informacion": "Examen de ingreso para aspirantes a nivel Ingeniería.",
        "inicio": fecha(2026, 6, 19),
        "fin": fecha(2026, 6, 19, 17),
        "className": "bg_blue-green",
        "allDay": True,
    },
    {
        "titulo": "Resultados de examen de ingreso - periodo Mayo-Agosto",
        "informacion": "Publicación de resultados del examen de ingreso.",
        "inicio": fecha(2026, 6, 22),
        "fin": fecha(2026, 6, 26, 17),
        "className": "bg_calendar_pink",
        "allDay": True,
    },
    {
        "titulo": "Periodo de incorporación nuevo ingreso TSU e ING - Mayo-Agosto",
        "informacion": "Periodo de incorporación (inscripción) para estudiantes de nuevo ingreso.",
        "inicio": fecha(2026, 6, 29),
        "fin": fecha(2026, 7, 4, 17),
        "className": "bg_calendar_green",
        "allDay": True,
    },
    {
        "titulo": "Receso institucional - Verano 2026",
        "informacion": "Periodo de receso institucional de verano. No hay actividades académicas.",
        "inicio": fecha(2026, 7, 6),
        "fin": fecha(2026, 7, 31, 17),
        "className": "bg_calendar_blue",
        "allDay": True,
    },
    {
        "titulo": "Receso institucional - Agosto 2026",
        "informacion": "Continuación del receso institucional de verano.",
        "inicio": fecha(2026, 8, 3),
        "fin": fecha(2026, 8, 7, 17),
        "className": "bg_calendar_blue",
        "allDay": True,
    },
    {
        "titulo": "Graduación T.S.U. y Maestría",
        "informacion": "Ceremonia de graduación para egresados de TSU y Maestría.",
        "inicio": fecha(2026, 8, 31),
        "fin": fecha(2026, 8, 31, 17),
        "className": "bg_calendar_brown",
        "allDay": True,
        "lugar": "Auditorio UTC",
    },

    # ─── CUATRIMESTRE SEPTIEMBRE - DICIEMBRE 2026 ────────────────────
    {
        "titulo": "Inicio de cuatrimestre Septiembre-Diciembre 2026",
        "informacion": "Inicio del cuatrimestre Septiembre-Diciembre 2026. Primer día de clases.",
        "inicio": fecha(2026, 9, 1),
        "fin": fecha(2026, 9, 1, 17),
        "className": "bg_calendar_orange",
        "allDay": True,
    },
    {
        "titulo": "Suspensión de actividades - Día de la Independencia",
        "informacion": "Suspensión de actividades por el Día de la Independencia de México.",
        "inicio": fecha(2026, 9, 16),
        "fin": fecha(2026, 9, 16, 17),
        "className": "bg_calendar_yellow",
        "allDay": True,
    },
    {
        "titulo": "Examen de ingreso T.S.U. - Septiembre",
        "informacion": "Examen de ingreso para aspirantes a nivel TSU, periodo Septiembre-Diciembre.",
        "inicio": fecha(2026, 10, 12),
        "fin": fecha(2026, 10, 16, 17),
        "className": "bg_calendar_red",
        "allDay": True,
    },
    {
        "titulo": "Suspensión de actividades - Día de la Revolución",
        "informacion": "Suspensión de actividades por el Día de la Revolución Mexicana.",
        "inicio": fecha(2026, 11, 16),
        "fin": fecha(2026, 11, 16, 17),
        "className": "bg_calendar_yellow",
        "allDay": True,
    },
    {
        "titulo": "Periodo de incorporación nuevo ingreso - Noviembre",
        "informacion": "Periodo de incorporación para estudiantes de nuevo ingreso.",
        "inicio": fecha(2026, 11, 23),
        "fin": fecha(2026, 11, 28, 17),
        "className": "bg_calendar_green",
        "allDay": True,
    },
    {
        "titulo": "Graduación T.S.U. - ING - LIC y Maestría",
        "informacion": "Ceremonia de graduación para egresados de TSU, Ingeniería, Licenciatura y Maestría.",
        "inicio": fecha(2026, 12, 2),
        "fin": fecha(2026, 12, 2, 17),
        "className": "bg_calendar_black",
        "allDay": True,
        "lugar": "Auditorio UTC",
    },
    {
        "titulo": "Fin de cuatrimestre Septiembre-Diciembre 2026",
        "informacion": "Último día del cuatrimestre Septiembre-Diciembre 2026.",
        "inicio": fecha(2026, 12, 18),
        "fin": fecha(2026, 12, 18, 17),
        "className": "bg_calendar_purple",
        "allDay": True,
    },
    {
        "titulo": "Receso institucional - Navidad y Año Nuevo",
        "informacion": "Periodo de receso institucional por fiestas de Navidad y Año Nuevo.",
        "inicio": fecha(2026, 12, 25),
        "fin": fecha(2026, 12, 31, 17),
        "className": "bg_calendar_blue",
        "allDay": True,
    },
]


class Command(BaseCommand):
    help = 'Inserta los eventos del Calendario Escolar UTC 2026 en la base de datos'

    def add_arguments(self, parser):
        parser.add_argument(
            '--limpiar',
            action='store_true',
            help='Elimina los eventos del calendario 2026 antes de insertar',
        )

    def handle(self, *args, **options):
        # Crear categoría si no existe
        cat, _ = Categorias.objects.get_or_create(
            categoria='Calendario',
            defaults={'descripcion': 'Eventos del calendario escolar de la UTC'}
        )

        if options['limpiar']:
            deleted = Database.objects.filter(
                categoria=cat,
                evento_fecha_inicio__year=2026
            ).delete()
            self.stdout.write(self.style.WARNING(f'Eliminados {deleted[0]} eventos del calendario 2026'))

        insertados = 0
        for evento in EVENTOS_2026:
            # Verificar si ya existe
            if Database.objects.filter(titulo=evento['titulo'], evento_fecha_inicio__year=2026).exists():
                self.stdout.write(f'  ~ Ya existe: {evento["titulo"]}')
                continue

            Database.objects.create(
                categoria=cat,
                titulo=evento['titulo'],
                informacion=evento['informacion'],
                uuid=gen_uuid(),
                evento_fecha_inicio=evento['inicio'],
                evento_fecha_fin=evento['fin'],
                evento_allDay=evento.get('allDay', True),
                evento_lugar=evento.get('lugar', 'Campus UTC'),
                evento_className=evento.get('className', 'event_detail'),
            )
            insertados += 1
            self.stdout.write(self.style.SUCCESS(f'  + {evento["titulo"]}'))

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(f'Completado: {insertados} eventos insertados.'))
