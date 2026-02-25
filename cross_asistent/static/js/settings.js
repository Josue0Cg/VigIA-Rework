var alfabetico = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
var alfanumerico = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567890123456789";
var caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567890123456789@$!%*.?&";
var texto3 = /[a-zA-Z0-9]{3}/;
var formToken = getCSRFToken();
var timerOut = 5000;
var expressions = {
    name: /^[a-zA-ZÀ-ÿ\s]+$/,
    username: /^(?![0-9_-])[a-zA-Z0-9_-]+$/,
    email: /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*.?&])[A-Za-z\d@$!%*.?&]{8,}$/,
};

function getCSRFToken() {
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
        var cookie = jQuery.trim(cookies[i]);
        if (cookie.substring(0, 10) == "csrftoken" + "=") {
            return decodeURIComponent(cookie.substring(10));
        }
    }
    const csrfCookie = $("[name=csrfmiddlewaretoken]").val();
    return csrfCookie;
}

// ##############################################################################################
// ###################################### Funciones Jquery ######################################
// ##############################################################################################
$(document).ready(function () {
    try {
        $('#overlayMenu').click(()=>{
            $('nav button.navbar-toggler').click();
        })
        // Filtro de busqueda ###################################################################
        var input = $("#searchInput");
        function filtertable() {
            var value = input.val().toLowerCase();
            $("#searchInput").text(value);
            var result = $(".results_item").filter(function () {
                $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
                return $(this).is(":visible");
            }).length;
        }
        input.on("input", filtertable);

        // Vista de Programador y Banners
        // Agrega la clase active al banner con la id mas baja #######################################
        var minIdNumber = Infinity;
        let minIdElement = null;
        $('[id^="bannerid_"]').each(function () {
            var id = $(this).attr("id");
            var number = parseInt(id.split("_")[1]);
            if (number < minIdNumber) {
                minIdNumber = number;
                minIdElement = $(this);
            }
        });
        if (minIdElement !== null) {
            minIdElement.addClass("active");
        }

        // iniciar sesion ####################################################
        // Crea usuario nuevo desde programador ##############################
        // Registrar un nuevo articulo con TinyMCE ###########################
        $("[data-submit-form]").submit(jsonSubmit);
        if ($("[data-submit-form]").is("[data-submit-ready]")) {
            setTimeout(() => {
                $('[data-submit-ready] button[type="submit"]').click();
            }, 2000);
        }

        $("[data-submit-blur] .input_blur").on("blur", function () {
            let formulario = $(this).closest("[data-submit-blur]");
            let idButton = formulario.data("submit-blur");
            formulario.find(`button#${idButton}`).click();
        });
        $("[data-submit-blur] .input_change").on("change", function () {
            let formulario = $(this).closest("[data-submit-blur]");
            let idButton = formulario.data("submit-blur");
            setTimeout(() => {
                formulario.find(`button#${idButton}`).click();
            }, 1000);
        });

        $("[data-submit-click]").on("click", function () {
            const btnSubmitThis = $(this).data("submit-click");
            $("#" + btnSubmitThis)
                .click()
                .attr("disabled", "disabled");

            if (!disabledButtons.includes(btnSubmitThis)) {
                disabledButtons.push(btnSubmitThis);
            }
            localStorage.setItem("disabledButtons", JSON.stringify(disabledButtons));
        });

        // Editar/Crear usuario
        // generar nueva contraseña aleatoria #################################
        $("button[data-editinput]").click(genpass);
        function genpass() {
            $(this).addClass("active");
            var newRandomPass = cadenaRandom(10, caracteres);
            var editInputId = $(this).data("editinput");
            setTimeout(() => {
                $(this).removeClass("active");
            }, 1000);
            $("#" + editInputId)
                .val(`UTC#${newRandomPass}`)
                .addClass("active");
        }

        // Quitar clase show #####################################
        $("[data-btn_closed]").on("click", function () {
            var targetId = $(this).data("btn_closed");
            $("#" + targetId).toggleClass("show");
        });

        // Resetear formulario / vaciar todo el formulario
        $("[data-reset_form]").on("click", function () {
            var formId = $(this).data("reset_form");
            var formElement = $("#" + formId)[0];
            setTimeout(() => {
                if (formElement) {
                    formElement.reset();
                }
            }, 1500);
        });

        // Estilo Texto Google ####################################
        function colorizeGoogle() {
            const colors = ["#4285F4", "#EA4335", "#FBBC05", "#4285F4", "#34A853", "#EA4335"];
            const googleSpan = $(".style_google");
            const text = googleSpan.text();

            googleSpan.empty();
            for (let i = 0; i < text.length; i++) {
                googleSpan.append(`<span style="color:${colors[i]}">${text[i]}</span>`);
            }
        }
        colorizeGoogle();

        // Cerrar sweetalert toas con ESC ####################################################
        $(document).on("keydown", function (event) {
            if (event.key === "Escape" || event.keyCode === 27) {
                Swal.close();
            }
        });

        // Limpiar valor de input ##################################################################
        const inputCleared = $("input[data-init-clear], textarea[data-init-clear]");
        inputCleared.each(function () {
            $(this).on("input", function () {
                let idInput = $(this).attr("id");
                let btnCleared = $(`[data-clear="${idInput}"]`);

                if ($(this).val() == "") {
                    btnCleared.hide();
                } else {
                    btnCleared.show();
                }
            });
        });
        const btnCleared = $("[data-clear]");
        btnCleared.on("click", function () {
            const dataClear = $(this).attr("data-clear");
            $(`#${dataClear}`).val("");
            $(this).slideUp("fast");
        });

        // Interfaz #########################################################
        // Cambiar colores de la Interfaz
        $("[data-change-color]").on("click", function () {
            $("[data-change-color]").each(function (index, item) {
                $(item).removeClass("active");
            });
            var color = $(this).addClass("active").data("change-color");
            var rgb = $(this).data("rgb");
            $("html").attr("data-color_prefer", color);
            localStorage.setItem("data-color_prefer", color);
            localStorage.setItem("data-color_rgb", rgb);
        });
        const colorPrefer = localStorage.getItem("data-color_prefer");
        if (colorPrefer) {
            $(`[data-change-color="${colorPrefer}"]`).addClass("active");
            $("html").attr("data-color_prefer", colorPrefer);
        } else {
            $('[data-change-color="blue"]').addClass("active");
            $("html").attr("data-color_prefer", "blue");
        }
        // Cambiar tema
        $("#switchTheme").on("click", function () {
            if ($("#switchTheme").is(":checked")) {
                $("#switchText").text("Claro");
                $("html").attr("data-mdb-theme", "light");
                localStorage.setItem("data-mdb-theme", "light");
                localStorage.setItem("mapbox-last_layer", "light-v11");
            } else {
                $("#switchText").text("Oscuro");
                $("html").attr("data-mdb-theme", "dark");
                localStorage.setItem("data-mdb-theme", "dark");
                localStorage.setItem("mapbox-last_layer", "dark-v11");
            }
        });
        const colorTheme = localStorage.getItem("data-mdb-theme");
        if (colorTheme) {
            if (colorTheme == "light") {
                $("#switchText").text("Claro");
                $("#switchTheme").prop("checked", true);
                $("html").attr("data-mdb-theme", "light");
                localStorage.setItem("mapbox-last_layer", "light-v11");
            } else if (colorTheme == "dark") {
                $("#switchText").text("Oscuro");
                $("#switchTheme").prop("checked", false);
                $("html").attr("data-mdb-theme", "dark");
                localStorage.setItem("mapbox-last_layer", "dark-v11");
            }
        }

        // Firma del blog ##################################################
        // obtener texto sin espacios en inicio y final (trim)
        const oldSignature = $.trim($("#firmaPerfilTexto").text());
        $("#new_firma").on("input", function () {
            const inputText = $(this).val();

            // Verificar si el texto está vacío
            if (inputText.trim() === "") {
                $("#firmaPerfilTexto").text(oldSignature);
            } else {
                $("#firmaPerfilTexto").text(inputText);
            }
        });

        // Colocar imagen del input file #############################################
        function readURL(input, elementId) {
            if (input.files && input.files[0]) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    $(`#${elementId}`).attr("src", e.target.result);
                };
                reader.readAsDataURL(input.files[0]);
            }
        }
        $("[data-img_dom]").change(function () {
            idImgDom = $(this).data("img_dom");
            readURL(this, idImgDom);
        });

        // Inpits del perfil ##########################################################
        $("[data-input_transparent]").on({
            focus: function () {
                $(this).toggleClass("input_transparent");
            },
            blur: function () {
                $(this).toggleClass("input_transparent");
            },
        });
        var otherChanges = false;
        function togglePassBlock() {
            if (otherChanges) {
                $("#updatePassBlock").slideUp("fast");
            } else {
                $("#profileSaved").slideUp("fast", function () {
                    $("#updatePassBlock").slideUp("fast");
                });
            }
        }
        // Poner visible la seccion de la password
        $("#updatePassBtn").on("click", function () {
            let thisBtn = $(this);
            $("#updatePassText").toggle();

            if ($("#updatePassBtn").hasClass("bg_blue-green")) {
                $("#profileSaved").slideDown("fast", function () {
                    $("#updatePassBlock").slideDown("fast", function () {
                        $("html, body").scrollTop($(document).height());
                    });
                });
            } else {
                togglePassBlock();
            }
            if (thisBtn.text() == "Cambiar Contraseña") {
                thisBtn.toggleClass("bg_blue-green bg_blue-red");
                thisBtn.text("No Cambiar Contraseña");
                if (!otherChanges) {
                    $("#passwordSend").val("");
                }
                $("#newPass").val("");
                $("#confNewPass").val("");
            } else {
                thisBtn.toggleClass("bg_blue-green bg_blue-red");
                thisBtn.text("Cambiar Contraseña");
            }
        });
        // Detectar cambios en los inputs
        $("[data-input_change]").each(function () {
            const thisInput = $(this);
            const originalNameInput = thisInput.attr("name");
            var oldValueInput = thisInput.val();
            var oldNameInput = originalNameInput;

            thisInput.on("input", function () {
                if (thisInput.val() == oldValueInput) {
                    thisInput.attr("name", `${originalNameInput}`);
                    togglePassBlock();
                    otherChanges = false;
                } else {
                    thisInput.attr("name", `${originalNameInput}Changed`);
                    $("#profileSaved").slideDown("fast");
                    otherChanges = true;

                    if (thisInput.val() == "") {
                        thisInput.attr("name", `${originalNameInput}`);
                    }
                }
            });

            thisInput.on("blur", function () {
                if (thisInput.val() == "") {
                    thisInput.attr("name", `${originalNameInput}`);
                    togglePassBlock();
                    otherChanges = false;
                }
            });

            thisInput.on("click", function () {
                oldNameInput = originalNameInput;
            });
        });
        // Desplegar boton si se elimina la foto de perfil
        $("input#deletePicture").change(function () {
            if ($(this).is(":checked")) {
                $('[for="deletePicture"]').addClass("btn_press");
                $("#profileSaved").slideDown("fast");
                otherChanges = true;
            } else {
                $('[for="deletePicture"]').removeClass("btn_press");
                togglePassBlock();
                otherChanges = false;
            }
        });

        // Editar Blog ################################################################
        $("#formularioArticulo #blogNewUpdate").change(function () {
            blogIdGet = $("#formularioArticulo #blogNewUpdate").val();
            dataGetBlog = $("#formularioArticulo #blogNewUpdate").data("get-blog");
            if (blogIdGet != "newBlog") {
                $.ajax({
                    url: dataGetBlog,
                    type: "GET",
                    data: { id: blogIdGet },
                    success: function (data) {
                        $("#formularioArticulo #imgArticle").attr("src", "/static/img/default_image.webp");
                        if (data.encabezado) {
                            $("#formularioArticulo #imgArticle").attr("src", data.encabezado);
                        }
                        $("#formularioArticulo #titulo").addClass("active").val(data.titulo);
                        const blogContent = data.contenido;
                        tinymce.get("mainTiny").setContent(blogContent);
                        $("#formularioArticulo .blogSubmit").html(
                            'Modificar <i class="fa-regular fa-paper-plane ms-1"></i>'
                        );
                        $("#formularioArticulo .btnModal").slideDown("fast");
                        $("#blogDelete #blogDeleteTitle").text(data.titulo);
                        $("#blogDelete #blogIdDelete").val(blogIdGet);
                    },
                    error: function (error) {
                        console.error("Error al obtener datos: " + error);
                        alertSToast(
                            "center",
                            8000,
                            "error",
                            "UPS! 😯🤔🧐<br> hubo un error al obtener los datos, consulte la consola."
                        );
                    },
                });
            } else {
                $("#formularioArticulo #imgArticle").attr("src", "/static/img/default_image.webp");
                $("#formularioArticulo #titulo").removeClass("active").val("");
                tinymce.get("mainTiny").setContent("");
                $("#formularioArticulo .blogSubmit").html('Publicar <i class="fa-regular fa-paper-plane ms-1"></i>');
                $("#formularioArticulo .btnModal").slideUp("fast");
                $("#blogDelete #blogDeleteTitle").text("");
                $("#blogDelete #blogIdDelete").val("");
            }
        });

        // Editar Evento -Calendario ######################################
        // Cambiar clase del select option
        $("[data-select_addClass]").change(function () {
            const newClass = $(this).val();
            $(this).attr("class", `form-select change_bg ${newClass}`);
        });

        //
        //
        //
    } catch (error) {
        console.error("Error Inesperado: ", error);
        alertSToast("center", 8000, "error", `😥 Ah ocurrido un error inesperado. codigo: #304`);
    }
});

// ##############################################################################################
// #################################### Funciones JAVASCRIPT ####################################
// ##############################################################################################

// Cerrar la sesion ##########################################################
if (document.querySelector("main").classList.contains("main_container")) {
    window.location.href = "/logout";
}

// Crear cadena de caracteres random ###############################3
function cadenaRandom(longitud, caracteres) {
    var cadenaAleatoria = "";
    for (var i = 0; i < longitud; i++) {
        var indice = Math.floor(Math.random() * caracteres.length);
        cadenaAleatoria += caracteres.charAt(indice);
    }
    return cadenaAleatoria;
}

// Copiar al portapapeles ######################################################################
const inputs = document.querySelectorAll("input[data-copy]");
inputs.forEach((input) => {
    const copyText = () => {
        if (!navigator.clipboard) {
            alertSToast("center", 8000, "info", "Tu navegador no admite copiar al portapapeles 😯😥🤔");
            return;
        }
        const textCopy = input.value;
        if (textCopy != "") {
            navigator.clipboard
                .writeText(textCopy)
                .then(() => {
                    alertSToast("top", 5000, "success", "Texto Copiado! 🥳");
                })
                .catch((error) => {
                    const message = "Error al copiar al portapapeles";
                    console.error(message, ":", error);
                    alertSToast("top", 8000, "error", `${message} 🤔😥`);
                });
        }
    };

    input.addEventListener("click", copyText);
    // input.addEventListener("focus", copyText);
});

// MaterialBox https://materializecss.com/ ################################################
var imagesZoom = document.querySelectorAll(".materialBoxed");
var instances = M.Materialbox.init(imagesZoom);

// Enviar formulario JSON ######################################################################
function jsonSubmit(e) {
    e.preventDefault = e.preventDefault || function () {};
    e.preventDefault();
    const thisForm = e.target;
    const formData = new FormData(thisForm);

    if (formData.has("contenidoWord")) {
        const contenidoTiny = tinymce.activeEditor.getContent();
        formData.set("contenidoWord", contenidoTiny);
        // alert(contenidoTiny);

        const contenidoTextTiny = tinymce.activeEditor.getContent({ format: "text" });
        formData.set("textTiny", contenidoTextTiny);
        // alert(contenidoTextTiny);
    }

    try {
        formSubmitBtn = thisForm.querySelector('button[type="submit"]');
        if (formSubmitBtn) {
            formSubmitBtn.setAttribute("disabled", "disabled");
        }
    } catch (error) {
        console.warn("Advertencia: Boton de envio no encontrado...");
        console.warn(formSubmitBtn);
        console.error(error);
    }

    fetch(thisForm.action, {
        method: "POST",
        body: formData,
        headers: {
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRFToken": formToken,
        },
    })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((data) => {
                    throw new Error(data.error || "Error desconocido");
                });
            }
            return response.json();
        })
        .then((data) => {
            dataMessage = data.message;
            if (data.success == true) {
                let dataIcon = "success";
                function dataRedirect() {
                    window.location.href = data.redirect_url;
                }
                
                if (data.icon) {
                    dataIcon = data.icon;
                }

                dataPosition = "center";
                if (data.position) {
                    dataPosition = data.position;
                }

                if (data.functions == "singin") {
                    return dataRedirect();
                } else if (data.functions == "reload") {
                    var alertfunction = function () {
                        location.reload();
                    };
                } else if (data.functions == "redirect") {
                    var alertfunction = function () {
                        dataRedirect();
                    };
                }

                setTimeout(() => thisForm.querySelector('button[type="submit"]').removeAttribute("disabled"), 8000);
                alertSToast(dataPosition, timerOut, dataIcon, dataMessage, alertfunction);
                const passwordInputs = document.querySelectorAll('input[type="password"]');
                passwordInputs.forEach((input) => (input.value = ""));

            } else if (data.success == false) {
                console.waning(dataMessage);
                if (data.valSelector) {
                    thisForm.querySelector(`[data-selector-input="${data.valSelector}"]`).classList.add("is-invalid");
                    thisForm.querySelector(`[data-selector-input="${data.valSelector}"]`).classList.remove("is-valid");
                }

                alertSToast("top", timerOut + 6000, "warning", dataMessage, () => {
                    thisForm.querySelector('button[type="submit"]').removeAttribute("disabled");
                });
            } else {
                if (data.functions == "submit") {
                    thisForm.querySelector('button[type="submit"]').removeAttribute("disabled");
                }
            }
        })
        .catch((error) => {
            console.error("😥 Error inesperado:", error);
            errorMessage = error.message || "Ocurrió un error. Intente nuevamente. 😥";
            alertSToast("center", timerOut + 8000, "error", errorMessage, () => {
                thisForm.querySelector('button[type="submit"]').removeAttribute("disabled");
            });
        });
}

// Formatear fecha de Django a HTML ###################################################
function convertToDateInputFormat(isoDateString) {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Drag and Drop ###################################################
const dropArea = document.getElementById("drop-area");
if (dropArea) {
    const fileInput = document.getElementById("file-input");
    const imageList = document.getElementById("image-list");

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i];
    };

    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    ["dragenter", "dragover"].forEach((eventName) => {
        dropArea.addEventListener(eventName, () => dropArea.classList.add("hover"), false);
    });
    ["dragleave", "drop"].forEach((eventName) => {
        dropArea.addEventListener(eventName, () => dropArea.classList.remove("hover"), false);
    });

    dropArea.addEventListener("drop", handleDrop, false);
    dropArea.addEventListener("click", () => fileInput.click(), false);
    fileInput.addEventListener("change", handleFiles, false);

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    function handleDrop(e) {
        let dt = e.dataTransfer;
        let files = dt.files;
        handleFiles({ target: { files } });
    }
    function handleFiles(e) {
        let files = e.target.files;
        let validFiles = [];
        let i = 1;

        [...files].forEach((file) => {
            if (validateImage(file)) {
                validFiles.push(file);
                previewImage(file, i);
                ++i
                console.log(++i)
            }
        });

        if (validFiles.length > 0) {
            alertSToast('top-end', 6000, 'success', `${validFiles.length} imágenes cargadas <br>correctamente 😋🤘🥳`);
        } else {
            alertSToast('center', 6000, 'error', "No se admite este tipo de archivo ⚠️😯😥");
        }
    }
    function validateImage(file) {
        const acceptedImageTypes = ["image/jpeg", "image/png", "image/jpg"];
        return acceptedImageTypes.includes(file.type);
    }
    function previewImage(file, itemId) {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onloadend = function () {
            const fileName = file.name;
            let fileType = fileName.lastIndexOf(".");
            fileType = fileName.substring(fileType + 1);
            const imgID = cadenaRandom(5, alfanumerico);

            const imageItem = `<div id="img_${imgID}" class="image-item"><img src="${reader.result}" class="img-rounded unfocus-5"><div class="fs-8"><p class="name-file m-0">${fileName}</p><p class="size-file m-0">(${fileType}) ${formatBytes(file.size)}</p></div></div>`;
            imageList.insertAdjacentHTML("beforeend", imageItem);

            setTimeout(() => {
                document.querySelector(`#img_${imgID}`).classList.add("visible");
                setTimeout(() => {
                    document.querySelector(`#img_${imgID} img`).classList.remove("unfocus-5");
                }, (itemId)*110);
            }, (itemId)*90);
        };
    }
}

// Template Alertas switalert ###################################################
function alertSToast(posittionS, timerS, iconS, titleS, didDestroyS) {
    const Toast = Swal.mixin({
        toast: true,
        position: posittionS,
        showConfirmButton: false,
        showCloseButton: true,
        timer: timerS,
        timerProgressBar: true,
        customClass: {
            icon: "icon_alert",
            title: "title_alert",
            timerProgressBar: "progressbar_alert",
            closeButton: "close_button_alert",
        },
        didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer);
            toast.addEventListener("mouseleave", Swal.resumeTimer);
        },
        didDestroy: didDestroyS,
    });
    Toast.fire({
        icon: iconS,
        title: titleS,
    });
}

// context menu disabled ######################################################################
document.oncontextmenu = function () {
    return false;
};
