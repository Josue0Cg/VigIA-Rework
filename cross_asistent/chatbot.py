from django.http import JsonResponse
from django.utils import timezone
from nltk.corpus import stopwords
from django.conf import settings
from .models import Database
import openai
import nltk
import json
import re

nltk.download('punkt')

now = timezone.localtime(timezone.now()).strftime('%d-%m-%Y_%H%M')
allowed_words = {'más', 'una', 'un', 'como'}
stop_words = set(stopwords.words('spanish'))

def tokenize_and_clean(text):
    tokens = re.findall(r'\b\w+\b', text.lower())
    tokens = [word for word in tokens if word.isalnum() and (word not in stop_words or word in allowed_words)]
    return tokens

def similarity_score(input_tokens, title_tokens):
    matches = set(input_tokens) & set(title_tokens)
    return len(matches)


def chatgpt(question, instructions):
    client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": instructions},
            {"role": "user", "content": question},
        ],
        temperature=0,
    )
    
    print(f"Prompt:{response.usage.prompt_tokens}")
    print(f"Compl:{response.usage.completion_tokens}")
    print(f"Total:{response.usage.total_tokens}")
    print()
    return response.choices[0].message.content

def chatbot(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            question = data.get('question', '').strip()
            input_tokens = tokenize_and_clean(question)
            results_in_db = Database.objects.all()
            
            best_match = None
            best_score = 0

            print('Pregunta: ',question)
            print()
            print('Tokens: ',input_tokens)
            print()
            
            for result in results_in_db:
                title_tokens = tokenize_and_clean(result.titulo)
                score = similarity_score(input_tokens, title_tokens)

                if score > best_score:
                    best_score = score
                    best_match = result

            if best_match and best_score > 0:
                system_prompt = f"Eres Hawky, asistente virtual de la Universidad Tecnologica de Coahuila (la UTC). Utiliza emojis. No saludar, No preguntar. Responde con esta información, respeta la información: {best_match.informacion}. hoy:{now}. Responde preguntas solo relacionadas con la universidad."
                answer = chatgpt(question, system_prompt)
                
                respuesta = {
                    "blank": True,
                    "informacion": answer,
                    "titulo": best_match.titulo,
                    "redirigir": best_match.redirigir,
                    "imagenes": best_match.imagen.url if best_match.imagen else None
                }
                
                print('titlo: ',best_match.titulo)
                print()
                print('Info: ',best_match.informacion)
                print()
                print('Imagen: ',best_match.imagen)
                print()
                return JsonResponse({'success': True, 'answer': respuesta})
            else:
                respuesta_default = {"informacion": "Lo siento, no encontré información relacionada con lo que me pides 🤔. Intenta ser mas claro o puedes buscar más información en la página de preguntas frecuentes o, si gustas, también puedes enviarnos tus dudas. 😊😁","redirigir": "preguntas_frecuentes/","blank": False,}
                return JsonResponse({'success': True, 'answer': respuesta_default})
    
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'message': 'Ocurrió un error. Al parecer no se permite este método. Código #400'})
        except KeyError as e:
            return JsonResponse({'success': False, 'message': f'Error en la clave del JSON: {str(e)}'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Error inesperado: {str(e)}'})
    return JsonResponse({'success': False, 'message': 'Método no permitido.'}, status=405)

