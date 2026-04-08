import django, os, sys
sys.path.insert(0, r'c:\Users\jhonn\OneDrive\Documentos\VIGIA-JOHNNY\VigIA-Rework')
os.environ['DJANGO_SETTINGS_MODULE'] = 'cross_project.settings'
django.setup()

from cross_asistent.models import Database, Categorias

with open(r'c:\Users\jhonn\OneDrive\Documentos\VIGIA-JOHNNY\VigIA-Rework\db_report.txt', 'w', encoding='utf-8') as f:
    f.write(f'Total registros: {Database.objects.count()}\n')
    cats = list(Categorias.objects.values_list('categoria', flat=True))
    f.write(f'Categorias: {cats}\n\n')
    
    carreras = Database.objects.filter(titulo__icontains='carrera')
    f.write(f'Registros con "carrera" en titulo: {carreras.count()}\n')
    for c in carreras[:10]:
        f.write(f'  - [{c.categoria}] {c.titulo}\n')
    
    ing = Database.objects.filter(titulo__icontains='ingenier')
    f.write(f'\nRegistros con "ingenier" en titulo: {ing.count()}\n')
    for c in ing[:10]:
        f.write(f'  - [{c.categoria}] {c.titulo}\n')
    
    f.write(f'\nPrimeros 30 registros:\n')
    for item in Database.objects.all()[:30]:
        f.write(f'  - [{item.categoria}] {item.titulo}\n')

print('Reporte guardado en db_report.txt')
