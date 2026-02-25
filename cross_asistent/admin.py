from django.contrib import admin
from . import models

class BannersAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'expiracion')

class CategoriasAdmin(admin.ModelAdmin):
    list_display = ('categoria', 'descripcion')

class DatabaseAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'categoria', 'uuid')
    search_fields = ('titulo', 'informacion', 'uuid')

class ArticulosAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'autor', 'creacion')

class MapaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'color', 'door_cords')

class NotifAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'tipo', 'leida')
    search_fields = ('user__username', 'user__email')

class PreguntasAdmin(admin.ModelAdmin):
    list_display = ('pregunta', 'descripcion', 'fecha')
    
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'tutorial', 'blog_firma')
    search_fields = ('user__username', 'user__email')

# Register your models here.
admin.site.register(models.Banners, BannersAdmin)
admin.site.register(models.Categorias, CategoriasAdmin)
admin.site.register(models.Database, DatabaseAdmin)
admin.site.register(models.Articulos, ArticulosAdmin)
admin.site.register(models.Mapa, MapaAdmin)
admin.site.register(models.galeria)
admin.site.register(models.Preguntas, PreguntasAdmin)
admin.site.register(models.Configuraciones)
admin.site.register(models.UserProfile, UserProfileAdmin)

