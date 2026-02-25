from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('', include('cross_asistent.urls')),
    path('admin/', admin.site.urls),
]