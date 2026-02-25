from django import template

register = template.Library()

@register.filter(name='eliminar_prefijo')
def eliminar_prefijo(value, arg):
    """Elimina el prefijo de una cadena."""
    return value.replace(arg, '')