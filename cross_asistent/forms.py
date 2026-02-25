from django import forms
from .models import Database, Categorias

class PreguntaForm(forms.ModelForm):
    class Meta:
        model = Database
        fields = ['titulo']
    
    def save(self, commit=True):
        pregunta = super().save(commit=False)
        pregunta.categoria = Categorias.objects.get(categoria="Preguntas")
        if commit:
            pregunta.save()
        return pregunta

class CSVUploadForm(forms.Form):
    file = forms.FileField()
