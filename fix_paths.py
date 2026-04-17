"""
Run on PythonAnywhere:  python fix_paths.py
Fixes absolute paths stored in the database for image fields.
"""
import os, sys, django

os.environ['DJANGO_SETTINGS_MODULE'] = 'cross_project.settings'
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from cross_asistent import models

fixed = 0

# Fix Articulos.encabezado
for a in models.Articulos.objects.all():
    val = str(a.encabezado) if a.encabezado else ''
    if val.startswith('/') and '/media/' in val:
        new_val = val.split('/media/', 1)[-1]
        print(f"  Blog '{a.titulo}': {val} -> {new_val}")
        a.encabezado.name = new_val
        a.save(update_fields=['encabezado'])
        fixed += 1

# Fix Database.imagen
for d in models.Database.objects.all():
    val = str(d.imagen) if d.imagen else ''
    if val.startswith('/') and '/media/' in val:
        new_val = val.split('/media/', 1)[-1]
        print(f"  DB '{d.uuid}': {val} -> {new_val}")
        d.imagen.name = new_val
        d.save(update_fields=['imagen'])
        fixed += 1

# Fix galeria.imagen
for g in models.galeria.objects.all():
    val = str(g.imagen) if g.imagen else ''
    if val.startswith('/') and '/media/' in val:
        new_val = val.split('/media/', 1)[-1]
        print(f"  Galeria {g.id}: {val} -> {new_val}")
        g.imagen.name = new_val
        g.save(update_fields=['imagen'])
        fixed += 1

# Fix ArticuloAlbum.imagen if exists
try:
    for album in models.ArticuloAlbum.objects.all():
        val = str(album.imagen) if album.imagen else ''
        if val.startswith('/') and '/media/' in val:
            new_val = val.split('/media/', 1)[-1]
            print(f"  Album {album.id}: {val} -> {new_val}")
            album.imagen.name = new_val
            album.save(update_fields=['imagen'])
            fixed += 1
except Exception:
    pass

print(f"\n✅ Fixed {fixed} paths total.")
