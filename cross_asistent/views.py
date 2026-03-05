from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.cache import never_cache
from django.contrib.auth.models import User
from django.db import models, transaction
from django.http import JsonResponse
from django.urls import reverse
from . import functions, models

mapaall = models.Mapa.objects.all()
databaseall = models.Database.objects.all()
categoriasall = models.Categorias.objects.all()
settingsall = models.Configuraciones.objects.all()
questions_all = models.Preguntas.objects.all().order_by('-id')
categoriasFilter = models.Categorias.objects.exclude(categoria__in=['Mapa', 'Calendario'])

def obtener_configuraciones():
    for oneconfig in settingsall:
        return {
            'copyright_settings': oneconfig.copyright_year,
            'website_settings': oneconfig.utc_link,
            'calendar_btns_year': getattr(oneconfig, 'calendar_btnsYear', None),
            'about_imgfirst': getattr(oneconfig, 'about_img_first', None),
            'about_textfirst': getattr(oneconfig, 'about_text_first', None),
            'about_imgsecond': getattr(oneconfig, 'about_img_second', None),
            'about_textsecond': getattr(oneconfig, 'about_text_second', None),
        }


def index(request):
    if not request.user.is_staff:
        logout(request)

    return render(request, 'index.html', {
        'active_page': 'inicio'
    })

def fqt_questions(request):
    if not request.user.is_staff:
        logout(request)
    
    configuraciones = obtener_configuraciones()
    
    categoria_Preguntas = models.Categorias.objects.get(categoria="Preguntas")
    questall = models.Database.objects.filter(frecuencia__gt=0, categoria=categoria_Preguntas).order_by('-frecuencia')
    
    # Preguntas respondidas marcadas como frecuentes
    preguntas_faq = models.Preguntas.objects.filter(
        es_frecuente=True, respondida=True
    ).order_by('orden', '-fecha')
    
    return render(request, 'frecuentes.html', {
        'quest_all': questall,
        'preguntas_faq': preguntas_faq,
        'active_page': 'faq',
        **configuraciones
    })

def fqt_questions_send(request):    
    if request.method == "POST":
        try:
            # Anti-spam: honeypot field
            if request.POST.get('website', ''):
                return JsonResponse({'success': True, 'message': 'Gracias por tu pregunta. \u2764\ufe0f'}, status=200)
            
            nombre_personaPOST = request.POST.get('nombre_persona', 'An\u00f3nimo').strip() or 'An\u00f3nimo'
            preguntaPOST = request.POST.get('pregunta', '').strip()
            descripcionPOST = request.POST.get('descripcion', '').strip()

            # Validaci\u00f3n de longitud
            if len(preguntaPOST) < 10:
                return JsonResponse({'success': False, 'message': 'Tu pregunta es muy corta. Escribe al menos 10 caracteres. \ud83e\udd14'}, status=400)
            if len(preguntaPOST) > 300:
                return JsonResponse({'success': False, 'message': 'Tu pregunta es muy larga. M\u00e1ximo 300 caracteres. \ud83d\ude25'}, status=400)
            if len(descripcionPOST) > 1000:
                return JsonResponse({'success': False, 'message': 'La descripci\u00f3n es muy larga. M\u00e1ximo 1000 caracteres. \ud83d\ude25'}, status=400)
            if len(nombre_personaPOST) > 100:
                return JsonResponse({'success': False, 'message': 'El nombre es muy largo. M\u00e1ximo 100 caracteres.'}, status=400)

            # Rate limiting por sesi\u00f3n
            preguntas_count = request.session.get('preguntas_enviadas', 0)
            if preguntas_count >= 3:
                return JsonResponse({'success': False, 'message': 'Has enviado muchas preguntas. Int\u00e9ntalo m\u00e1s tarde. \u23f3'}, status=429)

            pregunta = models.Preguntas(
                nombre_persona=nombre_personaPOST,
                pregunta=preguntaPOST,
                descripcion=descripcionPOST
            )
            pregunta.save()

            request.session['preguntas_enviadas'] = preguntas_count + 1

            return JsonResponse({'success': True, 'message': 'Gracias por tu pregunta. \u2764\ufe0f\ud83d\udc95\ud83d\ude01\ud83d\udc4d <br>Te responderemos lo m\u00e1s pronto posible. \ud83d\ude01\ud83d\ude0a\ud83e\udee1'}, status=200)
        except Exception as e:
            print(f'Hay un error en: {e}')
            return JsonResponse({'error':True, 'success': False, 'message': 'Ups! \ud83d\ude25\ud83d\ude2f hubo un error y tu pregunta no se pudo registrar. Por favor intente de nuevo m\u00e1s tarde.'}, status=400)

def blogs(request):
    if not request.user.is_staff:
        logout(request)
    
    configuraciones = obtener_configuraciones()

    blogs = models.Articulos.objects.all().order_by('-id')
    blogs_modificados = []

    for oneblog in blogs:
        imagen_url = oneblog.encabezado
        if not imagen_url == '':
            img = oneblog.encabezado.url
            imgClass = 'item_img-url'
        else:
            img = '/static/img/default_image.webp'
            imgClass = 'item_title-full'

        blogs_modificados.append({
            'id': oneblog.id,
            'titulo': oneblog.titulo,
            'autor': oneblog.autor,
            'imagen': img,
            'class': imgClass,
        })

    return render(request, 'blogs_all.html', {
        'blogs_all': blogs_modificados,
        'active_page': 'blog',
        **configuraciones
    })

def mostrar_blog(request, Articulos_id):
    if not request.user.is_staff:
        logout(request)
    
    configuraciones = obtener_configuraciones()
    
    articulo = get_object_or_404(models.Articulos, pk=Articulos_id)
    autor_username = articulo.autor
    if articulo.encabezado:
        encabezado_url = articulo.encabezado.url
    else:
        encabezado_url = ''
    
    try:
        user_profile = models.UserProfile.objects.get(user__username=autor_username)
        userdef = User.objects.get(username=autor_username)
        user_picture = user_profile.profile_picture
        if user_picture:
            foto_autor = user_picture.url
        else:
            foto_autor = ''
            
        if user_profile.blog_firma:
            firma_autor = user_profile.blog_firma.lower()
        else:
            firma_autor = f'{userdef.first_name.lower()} {userdef.last_name.lower()}'
    except models.UserProfile.DoesNotExist:
        firma_autor = 'Editorial Universidad Tecnológica de Coahuila'
        foto_autor = '/static/img/UTC_logo.webp'
    except User.DoesNotExist:
        firma_autor = 'Editorial Universidad Tecnológica de Coahuila'
        foto_autor = ''

    return render(request, 'blog.html', {
        'articulo': articulo,
        'foto_autor': foto_autor,
        'firma_autor': firma_autor,
        'encabezado_url': encabezado_url,
        **configuraciones
    })

def calendario(request):
    if not request.user.is_staff:
        logout(request)
    
    configuraciones = obtener_configuraciones()

    return render(request, 'calendario.html', {
        'active_page': 'calendario',
        'show_btns_year': configuraciones.get('calendar_btns_year'),
        'about_imgfirst': configuraciones.get('about_img_first'),
        'about_textfirst': configuraciones.get('about_text_first'),
        'about_imgsecond': configuraciones.get('about_img_second'),
        'about_textsecond': configuraciones.get('about_text_second'),
        **configuraciones  # Agregar las configuraciones al contexto
    })

def map(request):
    if not request.user.is_staff:
        logout(request)
    return render(request, 'mapa.html', {
        'active_page': 'map'
    })

def about(request):
    if not request.user.is_staff:
        logout(request)
    
    configuraciones = obtener_configuraciones()
    return render(request, 'about.html', {
        'active_page': 'about',
        **configuraciones
    })

# Administracion ----------------------------------------------------------
@never_cache
def singup(request):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        response = functions.create_newuser(
            first_name=request.POST.get('first_name'),
            last_name=request.POST.get('last_name'),
            username=request.POST.get('username'),
            email=request.POST.get('email'),
            password1=request.POST.get('password1'),
            password2=request.POST.get('password2'),
        )
        
        response['functions'] = 'reload'
        status = 200 if response['success'] else 400
        return JsonResponse(response, status=status)
    else:
        logout(request)
        return redirect('singin')

@never_cache
def singinpage(request):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        login_identifier = request.POST.get('username')  # Puede ser username o email
        password = request.POST.get('password')
        
        try:
            user = User.objects.get(username=login_identifier)
        except User.DoesNotExist:
            try:
                user = User.objects.get(email=login_identifier)
            except User.DoesNotExist:
                user = None
        
        if user is not None:
            if not user.is_active:
                return JsonResponse({'success': False, 'functions': 'singin', 'message': '🧐😥😯 UPS! <br> Al parecer tu cuenta esta <u>Desactiva</u>. Será activada si estas autorizado'}, status=400)
            
            user = authenticate(request, username=user.username, password=password)
            if user is None:
                return JsonResponse({'success': False, 'functions': 'singin', 'message': 'Revisa el usuario o contraseña 😅.'}, status=400)
            else:
                login(request, user)
                pageRedirect = reverse('vista_programador')
                return JsonResponse({'success': True, 'functions': 'singin', 'redirect_url': pageRedirect}, status=200)
        else:
            return JsonResponse({'success': False, 'functions': 'singin', 'message': 'Usuario no registrado 😅. Verifica tu nombre de usuario o contraseña'}, status=400)
    else:
        configuraciones = obtener_configuraciones()
        logout(request)
        return render(request, 'singinup.html', {
            'active_page': 'singin',
            **configuraciones
        })

@never_cache
def singout(request):
    logout(request)
    return redirect('singin')

@login_required
@never_cache
def vista_programador(request):
    users = User.objects.all().order_by('-id')
    all_questions = models.Preguntas.objects.all().order_by('-id')
    preguntas_pendientes = models.Preguntas.objects.filter(respondida=False).count()
    
    if request.user.is_staff:
        num_blogs = models.Articulos.objects.all().count()
    else:
        num_blogs = models.Articulos.objects.filter(autor=request.user).count()
    
    contexto = {
        'users': users,
        'user': request.user,
        'preguntas_sending': all_questions[:20],
        'preguntas_pendientes': preguntas_pendientes,
        'num_registros': databaseall.count(),
        'num_blogs': num_blogs,
    }

    return render(request, 'admin/admin_dashboard.html', contexto)


@login_required
@never_cache
def responder_pregunta(request):
    """AJAX endpoint para que admins respondan preguntas de usuarios."""
    if request.method == 'POST':
        try:
            from django.utils import timezone
            question_id = request.POST.get('question_id')
            respuesta_text = request.POST.get('respuesta', '').strip()

            pregunta = get_object_or_404(models.Preguntas, id=question_id)
            pregunta.respuesta = respuesta_text
            pregunta.respondida = bool(respuesta_text)
            pregunta.fecha_respuesta = timezone.now() if respuesta_text else None
            pregunta.save()

            return JsonResponse({
                'success': True,
                'message': f'Respuesta enviada para la pregunta #{question_id}. 🫡✅'
            }, status=200)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Error al responder: {str(e)}'
            }, status=400)
    return JsonResponse({'success': False, 'message': 'Método no permitido.'}, status=405)


@login_required
@never_cache
def toggle_pregunta_frecuente(request):
    """AJAX endpoint para marcar/desmarcar una pregunta como FAQ."""
    if request.method == 'POST':
        try:
            question_id = request.POST.get('question_id')
            pregunta = get_object_or_404(models.Preguntas, id=question_id)
            pregunta.es_frecuente = not pregunta.es_frecuente
            pregunta.save()
            estado = 'marcada como frecuente' if pregunta.es_frecuente else 'removida de frecuentes'
            return JsonResponse({
                'success': True,
                'es_frecuente': pregunta.es_frecuente,
                'message': f'Pregunta #{question_id} {estado}. \u2705'
            }, status=200)
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Error: {str(e)}'}, status=400)
    return JsonResponse({'success': False, 'message': 'Método no permitido.'}, status=405)


@login_required
@never_cache
def admin_preguntas_page(request):
    """Vista dedicada para administrar preguntas."""
    todas_preguntas = models.Preguntas.objects.all().order_by('-fecha')
    preguntas_faq = models.Preguntas.objects.filter(es_frecuente=True).order_by('orden', '-fecha')
    preguntas_pendientes = models.Preguntas.objects.filter(respondida=False).count()
    
    return render(request, 'admin/admin_preguntas.html', {
        'todas_preguntas': todas_preguntas,
        'preguntas_faq': preguntas_faq,
        'preguntas_pendientes': preguntas_pendientes,
        'user': request.user,
    })

@login_required
@never_cache
def ver_perfil(request):
    perfil_extencion = request.user.userprofile
    if perfil_extencion.profile_picture:
        request.user.userprofile.profile_picture = request.user.userprofile.profile_picture.url
    else:
        request.user.userprofile.profile_picture = '/static/img/UTC_logo-plano.webp'
    
    if not perfil_extencion.blog_firma:
        perfil_extencion.blog_firma = ''
                
    return render(request, 'admin/perfil.html', {
        'user_profile': perfil_extencion,
        'active_page': 'perfil',
        'pages': functions.pages
    })

# Base de Datos ----------------------------------------------------------
@login_required
@never_cache
def database_page(request):
    context = { 'active_page':'database','pages':functions.pages, 'preguntas_sending':questions_all, 'categorias':categoriasFilter, 'categoriasall':categoriasall }
    return render(request, 'admin/database.html', context)

# Calendario ----------------------------------------------------------
@login_required
@never_cache
def calendario_page(request):
    for oneconfig in settingsall:
        btns_year = oneconfig.calendar_btnsYear

    context = { 'active_page': 'calendario', 'show_btns_year': btns_year, 'pages': functions.pages }
    return render(request, 'admin/calendario.html', context)

# Blogs ----------------------------------------------------------
@login_required
@never_cache
def blog_page(request):
    if request.method == 'POST':
        try:
            autorPOST = request.POST.get('autor')
            tituloPOST = request.POST.get('titulo')
            contenidoWordPOST = request.POST.get('contenidoWord')
            encabezadoImgPOST = request.FILES.get('encabezadoImg')
            blogUpdate = request.POST.get('blogNewUpdate')
            
            if not blogUpdate == None and not blogUpdate == 'newBlog':
                blogUpdate = get_object_or_404(models.Articulos, id=blogUpdate)
                blogUpdate.autor = autorPOST
                blogUpdate.titulo = tituloPOST
                blogUpdate.contenido = contenidoWordPOST
                if encabezadoImgPOST:
                    blogUpdate.encabezado = encabezadoImgPOST
                blogUpdate.save()
                jsonMessage='Excelente 🥳🎈🎉. Tu articulo fue <span>modificado</span> de forma exitosa. 😁🫡'                
            else:
                articulo = models.Articulos(
                    autor=autorPOST,
                    titulo=tituloPOST,
                    contenido=contenidoWordPOST,
                    encabezado=encabezadoImgPOST,
                )
                articulo.save()
                jsonMessage='Excelente 🥳🎈🎉. Tu artículo ya fue publicado. Puedes editarlo cuando gustes. 🧐😊'
                                
            user_perfil = request.user.userprofile
            if request.POST.get('new_firma'):
                user_perfil.blog_firma = request.POST.get('new_firma')
                user_perfil.save()

            return JsonResponse({'success': True, 'functions':'reload', 'message': jsonMessage}, status=200)
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Ocurrió un error😯😥 <br>{str(e)}'}, status=400)
        
    allblogs = models.Articulos.objects.all()
    yourBlogs = models.Articulos.objects.filter(autor = request.user)
    blogsTiple=[]
    for oneBlog in yourBlogs:
        blogsTiple.append({
            'id': oneBlog.id,
            'titulo': oneBlog.titulo,
        })
    
    return render(request, 'admin/blog.html', {'active_page':'blog','pages':functions.pages, 'blogsTiple':blogsTiple, 'allblogs':allblogs})

#Mapa ----------------------------------------------------------
@login_required
@never_cache
def map_page(request):
    categoria_mapa = models.Categorias.objects.get(categoria="Mapa")
    map_inDB = models.Database.objects.filter(categoria=categoria_mapa)
    UID = f'mapa-pleace_{models.generate_random_string(11)}'
    return render(request, 'admin/mapa.html', {'map_inDB': map_inDB, 'active_page': 'mapa', 'UID':UID,'pages': functions.pages})

@login_required
@never_cache
def update_create_pleace_map(request):
    if request.method != 'POST':
        # return JsonResponse({'error': 'Metodo no valido'}, status=400)
        return redirect('update_mapa')

    isNewPost = request.POST.get('isNew')
    is_markerPost = request.POST.get('ismarker')
    hide_namePost = request.POST.get('hidename')
    uuidPost = request.POST.get('uuid')
    nombrePost = request.POST.get('nombreEdificio')
    colorPost = request.POST.get('colorEdificio')
    p1Post = request.POST.get('esquina1')
    p2Post = request.POST.get('esquina2')
    p3Post = request.POST.get('esquina3')
    p4Post = request.POST.get('esquina4')
    informacionText = request.POST.get('textTiny')
    sizemarkerPost = request.POST.get('sizemarker')
    informacionPost = request.POST.get('contenidoWord')
    door_cordsPost = request.POST.get('puertaCordsEdificio')
    imagenPost = request.FILES.get('fotoEdificio')

    with transaction.atomic():
        if isNewPost == 'notnew':
            if models.Mapa.objects.filter(uuid=uuidPost).exists():
                edificio = get_object_or_404(models.Mapa, uuid=uuidPost)
                edificio.nombre = nombrePost
                edificio.color = colorPost
                edificio.p1_polygons = p1Post
                edificio.p2_polygons = p2Post
                edificio.p3_polygons = p3Post
                edificio.p4_polygons = p4Post
                edificio.door_cords = door_cordsPost
                edificio.size_marker = sizemarkerPost
                edificio.informacion = informacionPost
                edificio.is_marker = True if is_markerPost else False
                edificio.hide_name = True if hide_namePost else False
                edificio.save()
                success_message = f'Se Actualizaron los datos de <span>"{nombrePost}"</span> en el mapa de forma exitosa 🧐😁🎈'

            if imagenPost:
                map_database = get_object_or_404(models.Database, uuid=uuidPost)
                map_database.imagen = imagenPost
                map_database.save()
                success_message += '<br>Se actualizó su imagen en la Base de datos 😁🎉🎈'
            return JsonResponse({'success': True, 'message': success_message, 'functions':'reload'}, status=200)
        else:
            # validar si este ya existe en el mapa y en db para que no se repitan
            models.Mapa.objects.create(
                uuid=uuidPost,
                color=colorPost,
                nombre=nombrePost,
                p1_polygons=p1Post,
                p2_polygons=p2Post,
                p3_polygons=p3Post,
                p4_polygons=p4Post,
                door_cords=door_cordsPost,
                informacion=informacionPost,
                size_marker = sizemarkerPost,
                is_marker=True if is_markerPost else False,
                hide_name=True if hide_namePost else False,
            )
            
            # Verificar notas ToDo
            models.Database.objects.create(
                categoria=models.Categorias.objects.get(categoria="Mapa"),
                titulo=nombrePost,
                informacion=informacionText,
                imagen=imagenPost,
                uuid=uuidPost,
                evento_lugar='',
                evento_className='',
            )

            return JsonResponse({'success': True, 'message': 'Se creó un nuevo edificio en el mapa y en la base de datos de forma exitosa 🎉🎉🎉', 'functions':'reload'}, status=200)

#Galeria ----------------------------------------------------------
@login_required
@never_cache
def vista_galeria(request):
    imagenes_galeria = models.galeria.objects.exclude(imagen__exact='')
    imagenes_database = models.Database.objects.exclude(imagen__exact='')
    imagenes_banners = models.Banners.objects.exclude(imagen__exact='')

    return render(request, 'admin/vista_galeria.html', {
        'pages': functions.pages,
        'imagenes_galeria': imagenes_galeria,
        'imagenes_database': imagenes_database,
        'imagenes_banners': imagenes_banners,
    })
