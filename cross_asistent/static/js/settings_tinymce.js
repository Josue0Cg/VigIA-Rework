// Functionamiento de TinyMCE #################################################################
let tinyTheme = "oxide";
let tinyThemeCss = "default";
$("#switchTheme").on("click", function () {
    if ($("#switchTheme").is(":checked")) {
        tinyTheme = "oxide";
        tinyThemeCss = "default";
    } else {
        tinyTheme = "dark";
        tinyThemeCss = "dark";
    }
});
const colorTheme = localStorage.getItem("data-mdb-theme");
if (colorTheme) {
    if (colorTheme == "light") {
        tinyTheme = "oxide";
        tinyThemeCss = "default";
    } else {
        tinyTheme = "dark";
        tinyThemeCss = "dark";
    }
}

var urlSendImgs = $("[data-upload-imgs]").data("upload-imgs");
var relativeUrlSend = `../../..${urlSendImgs}`;

var urlListImgs = $("[data-list-imgs]").data("list-imgs");
var relativeUrlImgs = `../../..${urlListImgs}`;

const uploadImageTiny = async (blobInfo, progress) => {
    try {
        const formData = new FormData();
        formData.append("file", blobInfo.blob(), blobInfo.filename());
        formData.append("csrfmiddlewaretoken", getCSRFToken());
        const response = await fetch(relativeUrlSend, {
            method: "POST",
            body: formData,
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        const json = await response.json();
        if (!json || typeof json.location !== "string") {
            throw new Error("Al parecer esta peticion no esta Permitida");
        }
        return json.location;
    } catch (error) {
        console.error(error);
        return null;
    }
};

// titulo
tinymce.init({
    selector: ".bannerTitle",
    language: "es_MX",
    branding: false,
    statusbar: false,
    resize: false,
    plugins: "quickbars",
    mobile: {
        toolbar_mode: "sliding",
        height: 110,
    },
    menubar: false,
    toolbar_mode: "wrap",
    toolbar: "undo redo | bold removeformat",
    quickbars_insert_toolbar: false,
    quickbars_selection_toolbar: "bold removeformat",
    height: 110,
    promotion: false,
    skin: tinyTheme,
    content_css: tinyThemeCss,
    content_style: 'strong { color: #3b71ca; }',
    forced_root_block: "",
    setup: function (editor) {
        editor.on("NodeChange", function (e) {
            var nodes = editor.dom.select("b, strong");
            nodes.forEach(function (node) {
                editor.dom.addClass(node, "text_detail");
            });
        });
    },
});
// Mapa
tinymce.init({
    selector: "#textTiny",
    language: "es_MX",
    branding: false,
    statusbar: false,
    resize: false,
    plugins:
        "advlist autolink lists link charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table wordcount quickbars autoresize",
    mobile: {
        toolbar_mode: "sliding",
        autoresize_min_height: 400,
        min_height: 400,
    },
    menubar: false,
    contextmenu: "paste cut removeformat | link table | hr",
    contextmenu_never_use_native: true,
    toolbar_mode: "wrap",
    toolbar:
        "undo redo | removeformat | styles | bold italic underline | alignleft aligncenter outdent indent | bullist numlist | table tabledelete | wordcount",
    quickbars_insert_toolbar: false,
    quickbars_selection_toolbar: "bold italic underline | blocks | forecolor backcolor | quicklink blockquote hr",
    autoresize_min_height: 450,
    min_height: 450,
    promotion: false,
    skin: tinyTheme,
    content_css: tinyThemeCss,
});
// Blog
tinymce.init({
    selector: "#mainTiny",
    language: "es_MX",
    branding: false,
    statusbar: false,
    resize: false,
    plugins:
        "advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table wordcount quickbars image pagebreak autoresize autosave",
    mobile: {
        menubar: true,
        toolbar_mode: "sliding",
        toolbar_sticky: true,
    },
    menubar: "file edit view format table",
    menu: {
        file: { title: "File", items: "restoredraft | preview | print" },
        view: { title: "View", items: "visualaid visualchars visualblocks | spellchecker | preview fullscreen" },
    },
    contextmenu: "paste cut removeformat | link image table | hr pagebreak",
    contextmenu_never_use_native: true,
    toolbar_mode: "wrap", // wrap floating sliding
    toolbar_sticky: true,
    toolbar:
        "undo redo restoredraft | forecolor backcolor | fontfamily styles | bold italic underline removeformat | alignleft aligncenter alignright | alignjustify outdent indent | bullist numlist | table tabledelete | image gallerycustom | insertdatetime link unlink openlink | cut paste wordcount",
    quickbars_insert_toolbar: false,
    quickbars_selection_toolbar: "bold italic underline | blocks forecolor backcolor | quicklink blockquote",
    quickbars_image_toolbar: "image|alignleft aligncenter alignright | rotateleft rotateright | imageoptions",
    color_map: ["#ECCAFA","Light Purple","#C2E0F4","Light Blue","#BFEDD2","Light Green","#FBEEB8","Light Yellow","#F8CAC6","Light Red","#B96AD9","Purple","#3598DB","Blue","#2DC26B","Green","#F1C40F","Yellow","#E03E2D","Red","#843FA1","Dark Purple","#3B71CA","Dark Blue","#169179","Dark Turquoise","#E67E23","Orange","#BA372A","Dark Red","#ECF0F1","Light Gray","#CED4D9","Medium Gray","#95A5A6","Gray","#7E8C8D","Dark Gray","#34495E","Navy Blue","#000000","Black","#ffffff","White",],
    skin: tinyTheme,
    content_css: tinyThemeCss,
    image_title: true,
    automatic_uploads: true,
    // file_picker_types: "image",
    images_upload_url: relativeUrlSend,
    images_upload_handler: uploadImageTiny,
    min_height: 625,
    autoresize_min_height: 625,
    autosave_interval: "20m",
    promotion: false,
    insertdatetime_formats: ["%d-%m-%Y", "%Y-%m-%d", "%H:%M:%S", "%I:%M:%S %p"],
    content_style: `
        img.img-tiny {
            max-width: 100%;
            height: auto;
            border: none;
            border-radius: 10px;
            margin: 2px;
        }
    `,
    paste_data_images: true,

    setup: (editor) => {
        editor.ui.registry.addButton("gallerycustom", {
            icon: "gallery",
            onAction: function () {
                // Abre el modal
                $("#selectImageModal").modal("show");
                // Cargar imagenes
                $.ajax({
                    url: relativeUrlImgs,
                    method: 'GET',
                    success: function(response) {
                        const images = response.imagenes;
                        const imageContainer = $('#selectImageModal .modal-body .row');
                        imageContainer.empty();
            
                        images.forEach(image => {
                            const imageElement = `
                                <div class="mb-4 col-6 col-md-4 col-lg-3">
                                    <div class="card">
                                        <img src="${image.url}" alt="Imagen del blog" class="card-img ">
                                        <div class="card-img-overlay p-2">
                                            <button class="btn btn_detail btn_opacity-hover" onclick="insertImage('${image.url}')">Insertar</button>
                                        </div>
                                    </div>
                                </div>
                            `;
                            imageContainer.append(imageElement);
                        });
                    },
                    error: function(error) {
                        console.error('Error al cargar las imágenes:', error);
                        alertSToast('center', 80000, 'warning', 'Ocurrio un erro al obtener las imagenes.');
                    }
                });
            },
        });

        // Función selectImage para insertar la imagen en TinyMCE
        window.selectImage = function (url) {
            editor.insertContent(`<img src="/media/${url}" class="img-tiny"/>`);
            $("#selectImageModal").modal("hide");
        };

        editor.on("paste", (event) => {
            const clipboardData = event.clipboardData || window.clipboardData;
            const items = clipboardData.items;
            for (const item of items) {
                if (item.kind === "file" && item.type.startsWith("image/")) {
                    event.preventDefault();
                    const file = item.getAsFile();
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => {
                        const blobInfo = editor.editorUpload.blobCache.create(file.name, file, reader.result);
                        editor.editorUpload.blobCache.add(blobInfo);

                        uploadImageTiny(blobInfo).then((url) => {
                            if (url) {
                                editor.insertContent(`<img src="${url}" class="img-tiny"/><p>&nbsp;</p>`);
                            }
                        });
                    };
                }
            }
        });

        editor.on("NodeChange", (event) => {
            const nodes = event.element.getElementsByTagName("img");
            for (const img of nodes) {
                img.classList.add("img-tiny");
            }
        });
    },
});
