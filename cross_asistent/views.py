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
    return render(request, 'frecuentes.html', {
        'quest_all': questall,
        'active_page': 'faq',
        **configuraciones
    })

def fqt_questions_send(request):    
    if request.method == "POST":
        try:
            preguntaPOST = request.POST.get('pregunta')
            descripcionPOST = request.POST.get('descripcion')

            pregunta = models.Preguntas(pregunta=preguntaPOST, descripcion=descripcionPOST)
            pregunta.save()

            return JsonResponse({'success': True, 'message': 'Gracias por tu pregunta. ❤️💕😁👍 <br>Te responderemos lo más pronto posible. 😁😊🫡'}, status=200)
        except Exception as e:
            print(f'Hay un error en: {e}')
            return JsonResponse({'error':True, 'success': False, 'message': 'Ups! 😥😯 hubo un error y tu pregunta no se pudo registrar. Por favor intente de nuevo más tarde.'}, status=400)

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
    banners_all = models.Banners.objects.all()
    users = User.objects.all().order_by('-id')
    configuraciones = obtener_configuraciones()
    
    if request.user.is_staff:
        num_blogs = models.Articulos.objects.all().count()
    else:
        num_blogs = models.Articulos.objects.filter(autor=request.user).count()
    
    contexto = {
        'users':users,
        'user':request.user,
        'active_page':'home',
        'pages':functions.pages,
        'banners_all':banners_all,
        'settingsall':settingsall,
        'categorias':categoriasFilter,
        'preguntas_sending':questions_all[:8], # limitar a los primeros 8 registros
        'num_preguntas':databaseall.count(),
        'num_blogs': num_blogs,
        **configuraciones
    }
     
    if request.method == 'POST':
        response = functions.create_newuser(
            first_name=request.POST.get('first_name'),
            last_name=request.POST.get('last_name'),
            username=request.POST.get('username'),
            email=request.POST.get('email'),
            password1=request.POST.get('password'),
            is_staff=request.POST.get('is_staff', False),
            is_active=request.POST.get('is_active', False),
        )
        response['position'] = 'top'
        response['functions'] = 'reload'
        status = 200 if response['success'] else 400
        return JsonResponse(response, status=status)

    return render(request, 'admin/vista_programador.html', contexto)

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

# Banners ----------------------------------------------------------
@login_required
@never_cache
def banners_page(request):    
    if request.method == 'POST':
        tituloPOST = request.POST.get('contenidoWord')
        soloImagenPOST = request.POST.get('soloImagen')
        expiracionPOST = request.POST.get('expiracion')
        if soloImagenPOST == None:
            soloImagenPOST = False
        if not expiracionPOST:
            expiracionPOST = None
        
        if tituloPOST:
            banner = models.Banners(
                titulo = request.POST.get('contenidoWord'),
                descripcion = request.POST.get('descripcion'),
                redirigir = request.POST.get('redirigir'),
                imagen = request.FILES.get('imagen'),
                solo_imagen = soloImagenPOST,
                expiracion = expiracionPOST
            )
            banner.save()
            
            return JsonResponse({
                'success': True,
                'functions': 'reload',
                'message': f'El banner <span>{tituloPOST}</span> fue creado exitosamente 🥳🎉🎈.'
            }, status=200)
        else:
            return JsonResponse({
                'success': False,
                'message': f'El parecer no se envio contenido ⚠️😯🤔😥.'
            }, status=400)
    
    configuraciones = obtener_configuraciones()
    banners_all = models.Banners.objects.all()
    banners_modificados = []

    for banner in banners_all:
        banners_modificados.append({
            'id': banner.id,
            'titulo': banner.titulo,
            'descripcion': banner.descripcion,
            'redirigir': banner.redirigir,
            'imagen': banner.imagen.url or '/static/img/default_image.webp',
            'expiracion': banner.expiracion if not banner.expiracion == None else '',
            'visible': banner.visible,
            'onlyImg': banner.solo_imagen,
        })
    context = { 'banners': banners_modificados,
               **configuraciones,
               'active_page': 'banner',
               'pages': functions.pages,
               'banners_cound': banners_all.count() }
    return render(request, 'admin/banners.html', context)

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
