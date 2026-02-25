const dtLenguage = { url: "https://cdn.datatables.net/plug-ins/2.1.5/i18n/es-MX.json" };
const tableDatabaseObj = document.getElementById("datatable_database");
const tableBannersObj = document.getElementById("datatableBanners");
let dataTableIsInitialized = false;
let tableDatabase;
let tableBanners;

const initDataTable = async () => {
    if (dataTableIsInitialized) {
        tableDatabase.destroy();
        tableBanners.destroy();
    }

    if (tableDatabaseObj) {
        await listDatabase();
        tableDatabase = $("#datatable_database").DataTable({
            columnDefs: [
                { className: "text-center", targets: [0, 1, 2, 3, 4, 5] },
                { orderable: false, targets: [3, 4, 5] },
                { searchable: false, targets: [0, 3, 4, 5] },
            ],
            language: dtLenguage,
            pageLength: 20,
            destroy: true,
        });
    }

    if (tableBannersObj) {
        await listBanners();
        tableBanners = $("#datatableBanners").DataTable({
            columnDefs: [
                { className: "text-center", targets: [0, 1, 2, 3] },
                { orderable: false, targets: [2, 3] },
                { searchable: false, targets: [2, 3] },
            ],
            language: dtLenguage,
            lengthChange: false,
            paging: false,
            info: false,
            destroy: true,
        });

        const dataLength = tableBanners.rows().count();
        if (dataLength > 10) {
            tableBanners.page.len(10).draw();
            tableBanners.settings()[0].oFeatures.bPaginate = true;
            tableBanners.settings()[0].oFeatures.bInfo = true;
            tableBanners.settings()[0].oFeatures.bLengthChange = true;
        }
    }

    dataTableIsInitialized = true;

    // <label for="filterCategory">Filtrar por Categoría:</label>
    // <select id="filterCategory">
    //     <option value="">Todas</option>
    //     <option value="Preguntas">Preguntas</option>
    //     <option value="OtraCategoria">Otra Categoría</option>
    //     <!-- Agrega más opciones según tus categorías -->
    // </select>
    // Filtro de categoría
    // $("#filterCategory").on("change", function() {
    //     const selectedCategory = $(this).val();
    //     dataTable.column(1).search(selectedCategory).draw();  // Filtrar la columna de categoría (índice 1)
    // });
};

// Tabla de Dase de Datos (models.Database)
const listDatabase = async () => {
    try {
        const tableId = "tbodyDatabase";
        const databaseList = $(`#${tableId}`).data("list-table");
        await fetch(databaseList)
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((data) => {
                        throw new Error(data.message || "Error desconocido");
                    });
                }
                return response.json();
            })
            .then((data) => {
                $(`[data-table-load='${tableId}']`).addClass("d-none");
                $(`[data-table-container='${tableId}']`).removeClass("d-none");

                let content = ``;
                data.infodb.map((dato) => {
                    let db_image = ``;
                    if (dato.imagen) {
                        db_image = `<img src="${dato.imagen}" loading="lazy" alt="Imagen: ${dato.titulo}" class="img-rounded max_w150">`;
                    }
                    content += `<tr class="table_odd_items"><td>${dato.id}</td><td>${dato.categoria}</td><td>${dato.titulo}</td><td>${db_image}</td><td>${dato.documento}</td><td><div class="d-flex flex-column align-items-center gap_10"><button type="button" class="btn btn-floating btn-info" onclick="openModal('#editDBModal',${dato.id})"><i class="fa-solid fa-edit fs-12"></i></button><button type="button" class="btn btn-floating btn-danger" onclick="openModal('#deleteDBmodal',${dato.id})"><i class="fa-regular fa-trash-can fs-12"></i></button></div></td></tr>`;
                });
                tbodyDatabase.innerHTML = content;
            })
            .catch((error) => {
                console.error("😥 Error:", error);
                alertSToast("top", 8000, "warning", "Ocurrió un error al obtener los datos. 😥");
            });
    } catch (ex) {
        alert(ex);
        console.error(ex);
    }
};

// Tabla de Banners (models.Banners)
const listBanners = async () => {
    try {
        const tableId = "tbodyBanners";
        const bannersUrlList = $(`#${tableId}`).data("list-table");
        const bannersUrlVIsible = $(`#${tableId}`).data("url-visible");

        await fetch(bannersUrlList)
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((data) => {
                        throw new Error(data.message || "Error desconocido");
                    });
                }
                return response.json();
            })
            .then((data) => {
                $(`[data-table-load='${tableId}']`).addClass("d-none");
                $(`[data-table-container='${tableId}']`).removeClass("d-none");

                let content = ``;
                data.infobanners.map((dato) => {
                    let bannertitulo = dato.titulo;
                    let cellSpan = "";
                    let titleSpan = "";
                    let bannerDesc = "";

                    if (dato.solo_imagen == false) {
                        bannerDesc = dato.descripcion;
                    } else {
                        bannertitulo +=
                            '<div class="bg-success rounded-pill p-2 py-1 m-2 mb-0 d-inline-block fs-6">Solo Imagen y boton</div>';
                        cellSpan = 'colspan="2"';
                        titleSpan = 'class="d-none"';
                    }

                    if (dato.visible) {
                        bannerDesc = dato.descripcion;
                        visibleInput = "False";
                        visibleColor = "btn-warning";
                        visibleIcon = "fa-eye-slash";
                    } else {
                        bannertitulo +=
                            '<div class="bg-danger rounded-pill p-2 py-1 m-2 mb-0 d-inline-block fs-6">Banner Invisible</div>';
                        cellSpan = 'colspan="2"';
                        titleSpan = 'class="d-none"';
                        visibleInput = "True";
                        visibleColor = "btn_purple";
                        visibleIcon = "fa-eye";
                    }

                    let bannerImage = "";
                    if (dato.imagen) {
                        bannerImage = `<img src="${dato.imagen}" loading="lazy" class="img-rounded max_w150">`;
                    }
                    content += `<tr class="table_odd_items"><td ${cellSpan}>${bannertitulo}</td><td ${titleSpan}>${bannerDesc}</td><td>${bannerImage}</td><td><div class="d-flex align-items-center gap_10"><form method="post" action="${bannersUrlVIsible}" data-submit-dt><input type="text" name="banner_id" value="${dato.id}" class="d-none"><input type="text" name="banner_visible" value="${visibleInput}" class="d-none"><button type="submit" class="btn btn-floating ${visibleColor}"><i class="fa-solid ${visibleIcon} text-white fs-10"></i></button></form><button type="button" class="btn btn-floating btn-info" onclick="openModal('#editBannerModal',${dato.id})"><i class="fa-solid fa-edit fs-12"></i></button><button type="button" class="btn btn-floating btn-danger" onclick="openModal('#eliminarBanner',${dato.id})"><i class="fa-solid fa-trash fs-12"></i></button></div></td></tr>`;
                });
                4;
                tbodyBanners.innerHTML = content;

                $("[data-submit-dt]").submit(jsonSubmit);
            })
            .catch((error) => {
                console.error("😥 Error:", error);
                alertSToast("top", 8000, "warning", "Ocurrió un error al obtener los Banners. 😥");
            });
    } catch (ex) {
        alert(ex);
        console.error(ex);
    }
};

window.addEventListener("load", async () => {
    await initDataTable();

    setTimeout(() => {
        $("[data-table-container] .row.dt-row ").addClass("table-responsive m-0 my-3");
        $("[data-table-container] .row.dt-row .col-sm-12").addClass("p-0");
    }, 500);
});

// Abrir modal segun su data
function openModal(idMdbModal, dataid) {
    $(idMdbModal).data("get-info", dataid);
    $(idMdbModal).modal("show");
}

function fetchData(modal, dataPost, dataid, errorMsg, successCallback) {
    $.ajax({
        url: dataPost,
        method: "POST",
        data: JSON.stringify({ id: dataid }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: true,
        headers: {
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRFToken": formToken,
        },
        success: successCallback,
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Error:...", textStatus, errorThrown);
            alertSToast("center", 9000, "error", errorMsg);
        },
    });
}

if (tableDatabaseObj) {
    const postUrlDatabase = $("#tbodyDatabase").data("url-info");

    // Modal edición Database
    $("#editDBModal").on("show.bs.modal", function () {
        const thisdataid = $(this).data("get-info");
        const thisModal = $(this);
        const errorMsg = "Ocurrio un error al obtener los datos";

        fetchData(thisModal, postUrlDatabase, thisdataid, errorMsg, function (data) {
            const thisModal = $("#editDBModal");
            thisModal.find("#editid").val(thisdataid);
            thisModal.find("#editcateg").val(data.categoria);
            thisModal.find("#editcateg").text(data.categoria);
            thisModal.find("#edittitulo").val(data.titulo);
            thisModal.find("#editinfo").val(data.informacion);

            if (data.redirigir != null || data.redirigir != "") {
                thisModal.find("#editredirigir").val(data.redirigir);
            }
        });
    });
    $("#editDBModal").on("hidden.bs.modal", function () {
        const thisModal = $(this);
        thisModal.find("input").val("");
        thisModal.find("textarea").text("");
    });

    // Modal eliminación Database
    $("#deleteDBmodal").on("show.bs.modal", function () {
        const thisdataid = $(this).data("get-info");
        const thisModal = $(this);
        const errorMsg = "Ocurrio un error al obtener los datos";

        fetchData(thisModal, postUrlDatabase, thisdataid, errorMsg, function (data) {
            thisModal.find("#deltitulo").text(data.titulo);
            thisModal.find("#delid").val(thisdataid);
        });
    });
    $("#deleteDBmodal").on("hidden.bs.modal", function () {
        const thisModal = $(this);
        thisModal.find("#deltitulo").text("");
        thisModal.find("#delid").val("");
    });
}

if (tableBannersObj) {
    const postUrlBanners = $("#tbodyBanners").data("url-info");

    // Modal edición Banners
    $("#editBannerModal").on("show.bs.modal", function () {
        const thisdataid = $(this).data("get-info");
        const thisModal = $(this);
        const errorMsg = "Ocurrio un error al obtener los datos del Banner";

        fetchData(thisModal, postUrlBanners, thisdataid, errorMsg, function (data) {
            if (data.solo_imagen) {
                thisModal.find("#editsoloImagen").attr("checked", "checked");
            } else {
                thisModal.find("#editsoloImagen").removeAttr("checked");
            }

            thisModal.find("#banner_id").val(thisdataid);
            thisModal.find("#editDescripcion").text(data.descripcion);
            thisModal.find("#editRedirigir").val(data.redirigir);

            if (data.expiracion != null || data.expiracion == "") {
                const formattedDate = convertToDateInputFormat(data.expiracion);
                thisModal.find("#editExpiracion").val(formattedDate);
            }

            var editor = tinymce.get("editTitulo");
            editor.setContent(data.titulo);
        });
    });
    $("#editBannerModal").on("hidden.bs.modal", function () {
        const thisModal = $(this);
        thisModal.find("input").val("");
        thisModal.find("textarea").text("");
        var editor = tinymce.get("editTitulo");
        editor.setContent("");
    });

    // Modal eliminación Banners
    $("#eliminarBanner").on("show.bs.modal", function () {
        const thisdataid = $(this).data("get-info");
        const thisModal = $(this);
        const errorMsg = "Ocurrio un error al obtener los datos del Banner";

        fetchData(thisModal, postUrlBanners, thisdataid, errorMsg, function (data) {
            thisModal.find("#deletebannername").html(data.titulo);
            thisModal.find("#deletebannerid").val(thisdataid);
        });
    });
    $("#eliminarBanner").on("hidden.bs.modal", function () {
        const thisModal = $(this);
        thisModal.find("#deletebannername").html("");
        thisModal.find("input").val("");
    });
}
