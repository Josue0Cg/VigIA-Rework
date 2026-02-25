from django.contrib.auth.decorators import login_required
from django.contrib.auth.hashers import check_password
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_exempt
from django.db import IntegrityError, transaction
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.utils import timezone
from . import models
import datetime
import json

ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png']

# Plantilla links programador / administrador ----------------------------------------------------------
pages = [
        {'name': 'banner', 'url': 'upload_banner', 'display_name': 'Banners', 'icon':'fa-solid fa-image', 'access':'all'},
        {'name': 'database', 'url': 'database_page', 'display_name': 'Database', 'icon':'fa-solid fa-database', 'access':'all'},
        {'name': 'mapa', 'url': 'update_mapa', 'display_name': 'Mapa', 'icon':'fa-solid fa-map-location-dot', 'access':'staff'},
        {'name': 'calendario', 'url': 'calendario_page', 'display_name': 'Calendario', 'icon':'fa-solid fa-calendar-days', 'access':'all'},
        {'name': 'blog', 'url': 'create_blog', 'display_name': 'Blogs', 'icon':'fa-solid fa-newspaper', 'access':'all'},
        # {'name': 'galería', 'url': 'vista_galeria', 'display_name': 'Galeria', 'icon':'fa-regular fa-images', 'access':'staff'},
    ]

# Editar Perfil ----------------------------------------------------------
def editar_perfil(request):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        user_auth = request.user
        user_perfil = request.user.userprofile
        
        fNamePOST = request.POST.get('first_nameChanged')
        lNamePOST = request.POST.get('last_nameChanged')
        usernamePOST = request.POST.get('usernameChanged')
        emailPOST = request.POST.get('emailChanged')
        firmaPOST = request.POST.get('firmaBlog')
        picturePOST = request.FILES.get('userPictureChanged')
        delPicturePOST = request.POST.get('deletePicture')
        PasswordPOST = request.POST.get('passwordSend')
        newPasswordPOST = request.POST.get('confNewPass')
        
        if not user_auth.check_password(PasswordPOST):
            return JsonResponse({'success': False, 'message': 'La contraseña actual es incorrecta.'}, status=400)
        
        if emailPOST and User.objects.filter(email=emailPOST).exclude(id=user_auth.id).exists():
            return JsonResponse({'success': False, 'message': f'El correo electrónico "{emailPOST}" ya está en uso por otra cuenta. 🤔😯😯🧐'}, status=400)
        
        if usernamePOST and usernamePOST != user_auth.username:
            if User.objects.filter(username=usernamePOST).exists():
                return JsonResponse({'success': False, 'message': 'El nombre de usuario ya está en uso.'}, status=400)
            user_auth.username = usernamePOST
        
        with transaction.atomic():
            if fNamePOST:
                user_auth.first_name = fNamePOST
            
            if lNamePOST:
                user_auth.last_name = lNamePOST
            
            if emailPOST:
                user_auth.email = emailPOST
            
            if firmaPOST:
                user_perfil.blog_firma = firmaPOST
            
            if picturePOST:
                user_perfil.profile_picture = picturePOST
            
            if delPicturePOST == 'on':
                user_perfil.profile_picture.delete()
                user_perfil.profile_picture = None
            
            if newPasswordPOST:
                if PasswordPOST == newPasswordPOST:
                    return JsonResponse({'success': False, 'message': 'La nueva contraseña no puede ser igual a la actual.'}, status=400)
                user_auth.set_password(newPasswordPOST)
                user_perfil.passwoed_update = datetime.date.today()

            user_auth.save()
            user_perfil.save()
        return JsonResponse({'success': True, 'message': 'Tus Datos Se guardaron exitosamente. 🥳😋🤘🎉🎈', 'position': 'top'}, status=200)
    else:
        return JsonResponse({'success': False, 'message': 'Acción no permitida.'}, status=400)

# usuarios ----------------------------------------------------------
def create_newuser(first_name, last_name, username, email, password1, password2=None, is_staff=False, is_active=False):
    if not (password1 and username and email):
        return {'success':False, 'message':'Datos incompletos 😅'}
    if password2 is not None and password1 != password2:
        return {'success':False, 'message':'Las contraseñas no coinciden 😬'}
    if User.objects.filter(username=username).exists():
        return {'success':False, 'message':f'El usuario <u>{username}</u> ya existe. 😯🤔 <br>Te recomiendo utilizar uno distinto', 'valSelector':'usernameSelect'}
    if User.objects.filter(email=email).exists():
        return {'success':False, 'message':f'El correo electrónico <u>{email}</u> ya está registrado 😯<br>Te recomiendo utilizar uno distinto', 'valSelector':'emailSelect'}

    try:
        new_user = User.objects.create_user(
            first_name=first_name.lower(),
            last_name=last_name.lower(),
            username=username,
            email=email,
            password=password1,
            is_staff=is_staff,
            is_active=is_active,
        )
        new_user.save()
        aviso=''
        if password2 is not None:
            aviso = '<br>Tu cuenta está <u>Desactivada</u> 😯😬'
        return {'success': True, 'message': f'Usuario creado exitosamente 🥳🎈 {aviso}'}
    except IntegrityError:
        return {'success': False, 'message': 'Ocurrió un error durante el registro. Intente nuevamente.'}

# (programacion) ----
@login_required
@never_cache
def in_active(request):
    if request.method == 'POST' and request.user.is_staff:
        user_id = request.POST.get('user_id')
        action = request.POST.get('actionform')
        userChange = get_object_or_404(User, id=user_id)

        if action == 'activate':
            userChange.is_active = True
            message = f'Usuario "{userChange.username}" activado exitosamente. 😊🎈'
            icon = 'info'
        elif action == 'deactivate':
            userChange.is_active = False
            message = f'Usuario "{userChange.username}" <strong><u>desactivado</u></strong> exitosamente. 😯🧐😬'
            icon = 'warning'
        else:
            return JsonResponse({'success': False, 'message': 'Acción no válida.'}, status=400)

        userChange.save()
        return JsonResponse({'success': True, 'functions': 'reload', 'message': message, 'icon':icon}, status=200)
    return JsonResponse({'success': False, 'message': 'Método no permitido.'}, status=405)

@login_required
@never_cache
def eliminar_usuario(request, user_id):
    if request.method == 'POST':
        user = get_object_or_404(User, id=user_id)
        user.delete()
        return JsonResponse({'success': True, 'functions': 'reload', 'message': 'Usuario eliminado exitosamente.', 'icon': 'warning'}, status=200)
    return JsonResponse({'success': False, 'message': 'Acción no permitida.'}, status=403)

@login_required
@never_cache
def editar_usuario(request, user_id):
    user = get_object_or_404(User, id=user_id)
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        is_staffPost = request.POST.get('is_staff') == 'on'
        
        if password or is_staffPost:
            if password:
                user.set_password(password)
            user.is_active = True
            user.is_staff = is_staffPost
            user.is_superuser = is_staffPost
            user.save()
            
            messagereturn = f'El usuario <u>{username}</u> fue modificado exitosamente 🥳🎉🎈.'
            
        return JsonResponse({'success': True, 'message': messagereturn}, status=200)
    return JsonResponse({'success': False, 'message': 'Acción no permitida.'}, status=403)

# Banners ----------------------------------------------------------
@login_required
@never_cache
def banner_update(request):
    if request.method == 'POST':
        banner_id = request.POST.get('banner_id')
        tituloPOST = request.POST.get('contenidoWord')
        
        banner = get_object_or_404(models.Banners, id=banner_id)
        banner.solo_imagen = request.POST.get('soloImagen', 'False') == 'True'
            
        new_image = request.FILES.get('imagen')
        if not new_image == None:
            banner.imagen = new_image
        
        new_expir = request.POST.get('expiracion')
        if new_expir:
            banner.expiracion = new_expir
            banner.visible = True
        else:
            banner.expiracion = None
        
        banner.titulo = tituloPOST
        banner.descripcion = request.POST.get('descripcion')
        banner.redirigir = request.POST.get('redirigir')
        banner.save()
        
        return JsonResponse({
            'success': True,
            'functions': 'reload',
            'message': f'El banner <u>{tituloPOST}</u> fue modificado exitosamente 🥳🎉🎈.'
        }, status=200)
    
    return JsonResponse({'success': False, 'message': 'Acción no permitida.'}, status=403)

@login_required
@never_cache
def banner_delete(request):
    if request.method == 'POST':
        banner_id = request.POST.get('banner_id')
        banner = get_object_or_404(models.Banners, id=banner_id)
        banner.delete()
        icon = 'warning'
        return JsonResponse({'success': True, 'functions': 'reload', 'message': 'Banner eliminado exitosamente.', 'icon': icon}, status=200)
    return JsonResponse({'success': False, 'message': 'Acción no permitida.'}, status=403)

@login_required
@never_cache
@csrf_exempt
def banners_visibility_now(request):
    if request.method == 'POST':        
        banneridPOST = request.POST.get('banner_id')
        returnJson = None
        if banneridPOST:
            expired_banners = models.Banners.objects.filter(id=banneridPOST)
            update_visibility = request.POST.get('banner_visible')
            update_exp = True
            returnJson = {'success': True,'functions': 'reload','message': f'Se cambió la visibilidad del banner <span>#{banneridPOST}</span> exitosamente 🫡🥳🎉.'}
        else:
            now = timezone.now()
            expired_banners = models.Banners.objects.filter(expiracion__lte=now, visible=True)

            if expired_banners.exists():
                update_visibility = False
                update_exp = False                
                returnJson = {'success': True,'message': 'Se actualizaron los banners caducados','position': 'top-end'}
        if expired_banners:
            for banner in expired_banners:
                banner.visible = update_visibility
                if update_exp:
                    banner.expiracion = None
                banner.save()
        if returnJson:
            return JsonResponse(returnJson, status=201)
        return JsonResponse({}, status=200)

@login_required
@never_cache
def banners_list(request):
    listBanners = models.Banners.objects.all()
    datos_modificados = []
    for dato in listBanners:
        if dato.imagen:
            imagen_url = dato.imagen.url
        else:
            imagen_url = ''
            
        datos_modificados.append({
            'id': dato.id,
            'titulo': dato.titulo,
            'descripcion': dato.descripcion,
            'redirigir': dato.redirigir,
            'imagen': imagen_url,
            'expiracion': dato.expiracion,
            'solo_imagen': dato.solo_imagen,
            'visible': dato.visible,
        })
    data = {'infobanners': datos_modificados}
    return JsonResponse(data)

@login_required
@never_cache
def banners_getitem(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)            
            idPOST = data.get('id')
            dbItem = get_object_or_404(models.Banners, id=idPOST)
            data = {
                'titulo':dbItem.titulo,
                'descripcion':dbItem.descripcion,
                'redirigir':dbItem.redirigir,
                'expiracion':dbItem.expiracion,
                'solo_imagen':dbItem.solo_imagen,
                'visible':dbItem.visible,
            }
            return JsonResponse(data)
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Ocurrió un error 😯😥 <br>{str(e)}'}, status=400)

    return JsonResponse({'error': 'Método no válido'}, status=400)


# Categorias ----------------------------------------------------------
@login_required
@never_cache
def categorias_create(request):
    if request.method == 'POST':
        try:
            categoriaPOST = request.POST.get('categoria')
            descripcionPOST = request.POST.get('descripcion')
            
            existing_record = models.Categorias.objects.filter(categoria=categoriaPOST).exists()
            if existing_record:
                return JsonResponse({'success': False, 'message': f'la categoría "{categoriaPOST}" ya está registrada. 🧐🤔😯',}, status=400)
            
            models.Categorias.objects.create(
                categoria=categoriaPOST,
                descripcion=descripcionPOST,
            )
            
            return JsonResponse({'success': True, 'functions':'reload', 'message': f'Categoría <span>{categoriaPOST}</span> fue creada exitosamente 😁🎉🎈', 'position':'center'}, status=200)
        
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Ocurrió un error 😯😥 <br>{str(e)}'}, status=400)
    return JsonResponse({'error': 'Método no válido'}, status=400)

@login_required
@never_cache
def categorias_update(request):
    if request.method == 'POST':
        try:
            idPOST = request.POST.get('id')
            categPOST = request.POST.get('categoria')
            itemUpdate = get_object_or_404(models.Categorias, id=idPOST)
            itemUpdate.descripcion = request.POST.get('descripcion')
            itemUpdate.save()
            
            catMessage = f'Se actualizó la categoria <span>{categPOST}</span> exitosamente 🫡😁🎉'
            return JsonResponse({'success': True, 'functions': 'reload', 'message': catMessage, 'position': 'center'}, status=200)
        
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'No se pudo actualizar la categoria, Ocurrió un error 😯😥'}, status=400)
    
    return JsonResponse({'error': 'Método no válido'}, status=400)

@login_required
@never_cache
def categorias_delete(request):
    if request.method == 'POST':
        try:
            idPOST = request.POST.get('id')            
            categoriaDel = get_object_or_404(models.Categorias, id=idPOST)
            categoriaDel.delete()
            
            catMessage =  f'La categoria <u>{categoriaDel.categoria}</u> se eliminó correctamente 😯🧐😬🫡'
            return JsonResponse({'success': True, 'functions':'reload', 'message': catMessage, 'icon':'warning'}, status=200)
        
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Ocurrió un error 😯😥 <br>{str(e)}'}, status=400)
    return JsonResponse({'error': 'Método no válido'}, status=400)

# Base de Datos ----------------------------------------------------------
@login_required
@never_cache
def database_list(request):
    listDatabase = models.Database.objects.all()
    datos_modificados = []
    for dato in listDatabase:
        if dato.imagen:
            imagen_url = dato.imagen.url
        else:
            imagen_url = ''
        if dato.documento:
            documento_url = dato.documento.url
        else:
            documento_url = ''
        datos_modificados.append({
            'id': dato.id,
            'categoria': dato.categoria.categoria,
            'titulo': dato.titulo,
            'informacion': dato.informacion,
            'redirigir': dato.redirigir,
            'frecuencia': dato.frecuencia,
            'documento': documento_url,
            'imagen': imagen_url,
            'fecha_modificacion': dato.fecha_modificacion,
        })
    data = {'infodb': datos_modificados}
    return JsonResponse(data)

@login_required
@never_cache
def database_create(request):
    if request.method == 'POST':
        try:
            categoriaIdPOST = request.POST.get('categoria')
            categoria = get_object_or_404(models.Categorias, categoria=categoriaIdPOST)
            tituloPOST = request.POST.get('titulo')
            informacionPOST = request.POST.get('informacion')
            redirigirPOST = request.POST.get('redirigir')
            documentoPOST = request.FILES.get('documento')
            imagenPOST = request.FILES.get('imagen')
            evento_fecha_inicioPOST = request.POST.get('eStart')
            evento_fecha_finPOST = request.POST.get('eEnd')
            evento_allDayPOST = request.POST.get('eAllDay')
            evento_lugarPOST = request.POST.get('ePleace')
            evento_classNamePOST = request.POST.get('eColor')
            
            existing_record = models.Database.objects.filter(titulo=tituloPOST,evento_fecha_inicio=evento_fecha_inicioPOST,evento_fecha_fin=evento_fecha_finPOST,).exists()

            if existing_record:
                return JsonResponse({'success': False, 'message': '😯Este registro ya existe. <br> Hay otro registro con el mismo nombre, fecha de inicio y fecha de fin. 🧐🤔😯',}, status=400)
            
            if categoriaIdPOST == 'Preguntas':
                frecuenciaVAL = 1
            else:
                frecuenciaVAL = 0
                
            dbMessage =  'Nuevo registro en la base de datos 🎉🎉🎉'
            if categoriaIdPOST == 'Calendario':
                dbMessage =  'Nuevo Evento registrado exitosamente 🫡😁🎉'
            
            models.Database.objects.create(
                categoria=categoria,
                titulo=tituloPOST,
                informacion=informacionPOST,
                redirigir=redirigirPOST,
                frecuencia=frecuenciaVAL,
                documento=documentoPOST,
                imagen=imagenPOST,
                uuid=f'{categoriaIdPOST}_{models.generate_random_string(6)}',
                evento_fecha_inicio=evento_fecha_inicioPOST or None,
                evento_fecha_fin=evento_fecha_finPOST or None,
                evento_allDay=evento_allDayPOST if not evento_allDayPOST == None else False,
                evento_lugar=evento_lugarPOST or '',
                evento_className=evento_classNamePOST or '',
            )            
            return JsonResponse({'success': True, 'functions':'reload', 'message': dbMessage, 'position':'center'}, status=200)
        
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Ocurrió un error 😯😥 <br>{str(e)}'}, status=400)
    return JsonResponse({'error': 'Método no válido'}, status=400)

@login_required
@never_cache
def database_getitem(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)            
            idPOST = data.get('id')
            dbItem = get_object_or_404(models.Database, id=idPOST)
            data = {
                'categoria':dbItem.categoria.categoria,
                'titulo':dbItem.titulo,
                'informacion':dbItem.informacion,
                'redirigir':dbItem.redirigir,
            }
            return JsonResponse(data)
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Ocurrió un error 😯😥 <br>{str(e)}'}, status=400)

    return JsonResponse({'error': 'Método no válido'}, status=400)

@login_required
@never_cache
def database_update(request):
    if request.method == 'POST':
        try:
            idPOST = request.POST.get('id')
            categoriaIdPOST = request.POST.get('categoria')
            categoriaGET = get_object_or_404(models.Categorias, categoria=categoriaIdPOST)
            frecuenciaPOST = request.POST.get('frecuencia')
            evento_fecha_inicioPOST = request.POST.get('eStart')
            evento_fecha_finPOST = request.POST.get('eEnd')
            evento_allDayPOST = request.POST.get('eAllDay')
            evento_lugarPOST = request.POST.get('ePleace')
            evento_classNamePOST = request.POST.get('eColor')
            
            dbUpdate = get_object_or_404(models.Database, id=idPOST)
            dbUpdate.categoria = categoriaGET
            dbUpdate.titulo = request.POST.get('titulo')
            dbUpdate.informacion = request.POST.get('informacion')
            dbUpdate.redirigir = request.POST.get('redirigir')
            dbUpdate.frecuencia = frecuenciaPOST or '0'
            
            # Validación de archivo
            documento = request.FILES.get('documento')
            imagen = request.FILES.get('imagen')

            if documento:
                dbUpdate.documento = documento

            if imagen:
                if '..' in imagen.name or imagen.name.startswith('/'):
                    return JsonResponse({'success': False, 'message': 'Ruta de archivo inválida.'}, status=400)
                dbUpdate.imagen = imagen

            dbUpdate.uuid = f'{categoriaIdPOST}_{models.generate_random_string(6)}'
            dbUpdate.evento_fecha_inicio = evento_fecha_inicioPOST or None
            dbUpdate.evento_fecha_fin = evento_fecha_finPOST or None
            dbUpdate.evento_allDay = evento_allDayPOST if not evento_allDayPOST == None else False
            dbUpdate.evento_lugar = evento_lugarPOST or ''
            dbUpdate.evento_className = evento_classNamePOST or 'event_detail'
            dbUpdate.save()
                        
            dbMessage = f'Se actualizó "{request.POST.get("titulo")}" en la base de datos exitosamente 🫡😁🎉'
            return JsonResponse({'success': True, 'message': dbMessage, 'position': 'center'}, status=200)
        
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Ocurrió un error 😯😥 <br>{str(e)}'}, status=400)
    
    return JsonResponse({'error': 'Método no válido'}, status=400)

@login_required
@never_cache
def database_delete(request):
    if request.method == 'POST':
        try:
            idPOST = request.POST.get('id')            
            dbDelete = get_object_or_404(models.Database, id=idPOST)
            dbDelete.delete()
            
            dbMessage =  f'"{dbDelete.titulo}" Se eliminó de la base de datos 😯🧐😬🫡'
            return JsonResponse({'success': True, 'functions':'reload', 'message': dbMessage, 'icon':'warning'}, status=200)
        
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Ocurrió un error 😯😥 <br>{str(e)}'}, status=400)
    return JsonResponse({'error': 'Método no válido'}, status=400)

def frequesnce_update(request):
    if request.method == 'POST':
        try:
            idPOST = request.POST.get('frequence_id')
            dbUpdate = get_object_or_404(models.Database, id=idPOST)
            dbUpdate.frecuencia = dbUpdate.frecuencia + 1
            dbUpdate.save()
        
            return JsonResponse({'success': 'success', }, status=200)
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Ocurrió un error 😯😥.  {str(e)}'}, status=400)
    return JsonResponse({'error': 'Método no válido'}, status=400)

# Calendario: Eventos ---------------------
def calendario_eventos(request):
    categoriaGet = get_object_or_404(models.Categorias, categoria="Calendario")
    eventos = models.Database.objects.filter(categoria=categoriaGet).select_related('categoria')
    eventos_json = [{
        'id': evento.id,
        'title': evento.titulo,
        'description': evento.informacion,
        'classNames': evento.evento_className,
        'location': evento.evento_lugar,
        'imagen': evento.imagen.url if evento.imagen else '',
        'button': evento.redirigir if evento.redirigir else '',
        'start': evento.evento_fecha_inicio.isoformat() if evento.evento_fecha_inicio else '',
        'end': evento.evento_fecha_fin.isoformat() if evento.evento_fecha_fin else '',
        'allDay': evento.evento_allDay,
    } for evento in eventos]
    
    return JsonResponse(eventos_json, safe=False)

# Blogs ----------------------------------------------------------
@login_required
@never_cache
def blog_change(request):
    if request.method == 'GET':
        blogIdGET = request.GET.get('id')
        if (blogIdGET):
            blogGet = get_object_or_404(models.Articulos, id=blogIdGET)
            blogEncabezado = blogGet.encabezado
            if blogEncabezado:
                blogEncabezado = blogGet.encabezado.url
            else:
                blogEncabezado = ''
            data = {
                'titulo': blogGet.titulo,
                'contenido': blogGet.contenido,
                'encabezado': blogEncabezado,
            }
            return JsonResponse(data)
    return JsonResponse({'success': False}, status=400)

@login_required
@never_cache
def blog_delete(request):
    if request.method == 'POST':
        idPOST = request.POST.get('blogIdDelete')
        blogId = get_object_or_404(models.Articulos, id=idPOST)
        blogId.delete()
        return JsonResponse({'success': True, 'functions': 'reload', 'message': f'El blog "{blogId.titulo}" <u>se elimino</u> exitosamente. 😯😬🎉', 'icon': 'warning'}, status=200)
    return JsonResponse({'success': False, 'message': 'Acción no permitida.'}, status=403)

# Mapa ----------------------------------------------------------
def mapa_data(request):
    mapas = models.Mapa.objects.filter(is_marker=False)
    data = []
    
    for mapa in mapas:
        imagenQuery = models.Database.objects.filter(uuid=mapa.uuid).values_list('imagen', flat=True)
        imagen = imagenQuery.first() if imagenQuery.exists() else None

        galeryQuery = models.galeria.objects.filter(uuid=mapa.uuid)
        galery_items = []
        for galeria_item in galeryQuery:
            galery_items.append({
                "id": galeria_item.id,
                "imagen": galeria_item.imagen.url,
                "img_size": galeria_item.imagen.size
            })
        
        item = {
            "uuid": mapa.uuid,
            "color": mapa.color,
            "imagen_url": imagen,
            "nombre": mapa.nombre,
            "ismarker": mapa.is_marker,
            "sizemarker": mapa.size_marker,
            "informacion": mapa.informacion,
            "galery_items": galery_items,
            "galery_count": galeryQuery.count(),
            "hidename": True if mapa.hide_name else False,
            "door_coords": [float(coord) for coord in mapa.door_cords.split(",")],
            "polygons": [
                [float(coord) for coord in mapa.p1_polygons.split(",")],
                [float(coord) for coord in mapa.p2_polygons.split(",")],
                [float(coord) for coord in mapa.p3_polygons.split(",")],
                [float(coord) for coord in mapa.p4_polygons.split(",")],
            ]
        }
        data.append(item)

    return JsonResponse(data, safe=False)

def mapa_markers(request):
    mapas = models.Mapa.objects.filter(is_marker=True)
    data = []
    for mapa in mapas:
        imagen_mark = get_object_or_404(models.Database, uuid=mapa.uuid)
        item = {
            "uuid": mapa.uuid,
            "nombre": mapa.nombre,
            "ismarker": mapa.is_marker,
            "sizemarker": mapa.size_marker,
            "imagen": imagen_mark.imagen.url,
            "icon_size": float(mapa.size_marker),
            "door_coords": [float(coord) for coord in mapa.door_cords.split(",")],
            "edges": [
                [mapa.p1_polygons],
                [mapa.p2_polygons],
                [mapa.p3_polygons],
                [mapa.p4_polygons],
            ]
        }
        data.append(item)

    return JsonResponse(data, safe=False)

@login_required
@never_cache
def delete_pleaceMap(request):
    if request.method == 'POST':
        sendUid = request.POST.get('uuid')
        pleace = get_object_or_404(models.Mapa, uuid=sendUid)
        pleace.delete()
        return JsonResponse({'success': True, 'functions': 'reload', 'message': f'Se eliminó <u>"{pleace.nombre}"</u> del Mapa exitosamente. 😯😬🎉', 'icon': 'warning'}, status=200)
    return JsonResponse({'success': False, 'message': 'Acción no permitida.'}, status=403)

@login_required
@never_cache
def delete_pleaceMap_DB(request):
    if request.method == 'POST':
        sendUid = request.POST.get('uuid')
        pleace = get_object_or_404(models.Mapa, uuid=sendUid)
        pleace.delete()
        pleaceDB = get_object_or_404(models.Database, uuid=sendUid)
        pleaceDB.delete()
        return JsonResponse({'success': True, 'functions': 'reload', 'message': f'Se eliminó <u>"{pleace.nombre}"</u> del Mapa y de la Base de Datos exitosamente. ⚠️😯😬🎉', 'icon': 'warning'}, status=200)
    return JsonResponse({'success': False, 'message': 'Acción no permitida.'}, status=403)

# Preguntas ----------------------------------------------------------
@login_required
@never_cache
def preguntas_deleted(request):
    if request.method == 'POST':
        try:
            quest_id = request.POST.get('question_id')
            pregunta = get_object_or_404(models.Preguntas, id=quest_id)
            pregunta.delete()
            return JsonResponse({'success': True, 'message': f'Pregunta #.{quest_id} eliminada permanentemente. 😯🫡', 'icon': 'warning'}, status=200)
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Pregunta #{quest_id} no encontrada.'}, status=404)
    return JsonResponse({'success': False, 'message': 'Acción no permitida.'}, status=400)

# Configuraciones ----------------------------------------------------------
@login_required
@never_cache
def settings_update(request):
    if request.method == 'POST':
        try:
            qrImgPOST = request.FILES.get('qrImage')
            qrButtonPOST = request.POST.get('btnqrpost')
            qrButton = request.POST.get('btnqr')
            aboutimgfirst = request.FILES.get('firstimage')
            aboutimgsecond = request.FILES.get('secondimage')
            btnyearpost = request.POST.get('btnsYearpost')
            btnyear_calendar = request.POST.get('btnsYear')
            copyryear = request.POST.get('cr_year')
            utclink = request.POST.get('utclink')
            firstsection = request.POST.get('firstsection')
            secondsection = request.POST.get('secondsection')
            abouttext = request.POST.get('contenidoWord')
            print(qrButtonPOST)
            print(qrButton)

            config = get_object_or_404(models.Configuraciones, id='1')
            if qrImgPOST:
                config.qr_image = qrImgPOST
            if qrButtonPOST:
                config.qr_button = True if qrButton else False
            if btnyearpost:
                config.calendar_btnsYear = True if btnyear_calendar else False
            if copyryear:
                config.copyright_year = copyryear
            if utclink:
                config.utc_link = utclink
            if firstsection:
                config.about_text_first = abouttext
            if secondsection:
                config.about_text_second = abouttext
            if aboutimgfirst:
                config.about_img_first = aboutimgfirst
            if aboutimgsecond:
                config.about_img_second = aboutimgsecond
                
            config.save()
            
            return JsonResponse({'success': True, 'message': f'Configuraciones Actualizadas', 'position':'top-end'}, status=200)
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Ocurrio un error. {str(e)}'}, status=404)
    return JsonResponse({'success': False, 'message': 'Acción no permitida.'}, status=400)

# Galeria ----------------------------------------------------------
@login_required
@never_cache
def galeria_create(request):
    if request.method == 'POST':
        try:
            imagenPOST = request.FILES.get('imagen')
            if imagenPOST:
                nueva_imagen = models.galeria.objects.create(imagen=imagenPOST)
                nueva_imagen.save()
                return JsonResponse({'success': True, 'image_url': nueva_imagen.imagen.url, 'message': 'Imagen subida exitosamente.'}, status=200)
            else:
                return JsonResponse({'success': False, 'message': 'No se seleccionó ninguna imagen.'}, status=400)
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Ocurrió un error 😯😥 <br>{str(e)}'}, status=400)
    
    return JsonResponse({'error': 'Método no válido'}, status=400)

@login_required
@never_cache
def upload_image(request):
    if request.method == 'POST':
        try:
            image_file = request.FILES['file']
            imagen_articulo = models.galeria(imagen=image_file)
            imagen_articulo.save()
            image_url = imagen_articulo.imagen.url

            return JsonResponse({'location': image_url})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Error al subir la imagen'}, status=400)

@login_required
@never_cache
def lista_imagenes(request):
    if request.method == 'GET':
        try:
            imagenes = models.galeria.objects.all()
            imagenes_modificadas = []

            for imagen in imagenes:
                imagen_url = imagen.imagen.url
                imagenes_modificadas.append({
                    'id': imagen.id,
                    'url': imagen_url
                })
            return JsonResponse({'imagenes': imagenes_modificadas})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

@never_cache
@csrf_exempt
@login_required
def galeria_delete(request):
    if request.method == 'POST':
        try:
            imagen_id = request.POST.get('id')
            uuidPOST = request.POST.get('uuid')
            imagen = get_object_or_404(models.galeria, id=imagen_id, uuid=uuidPOST)
            imagen.delete()
            return JsonResponse({
                'success': True,
                'message': f'Se eliminó la imagen <u>"#{imagen_id}"</u> de la galeria exitosamente. ⚠️😯😬🎉',
                'icon': 'warning',
                'position': 'top',
            }, status=200)
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'success': False, 'message': 'Acción no permitida.'}, status=403)

@login_required
@never_cache
def galeria_upload_images(request):
    if request.method == 'POST':
        try:
            uuidPOST = request.POST.get('uuid')
            imagesPOST = request.FILES.getlist('images')
                        
            if imagesPOST:
                for oneimage in imagesPOST:
                    galeria_instance = models.galeria.objects.create(
                        uuid=uuidPOST,
                        imagen=oneimage,
                    )
                    galeria_instance.save()
                    
                return JsonResponse({'functions': 'submit'}, status=200)
            else:
                return JsonResponse({'success': False, 'message': 'No se Enviaron datos. ⚠️⚠️⚠️😯😥🤔'}, status=200)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'success': False, 'message': 'Método no permitido.'}, status=405)

