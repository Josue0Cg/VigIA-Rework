from django.apps import AppConfig


class CrossAsistentConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'cross_asistent'
    
    def ready(self):
            import cross_asistent.signals