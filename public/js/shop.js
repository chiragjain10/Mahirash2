/**
 * Filter Products
 * Filter Sort
 * Switch Layout
 * Loading product
 */
(function ($) {
    "use strict";

    /* Filter Products
    -------------------------------------------------------------------------*/
    var filterProducts = function () {
        const filters = {
            availability: null,
            categories: [],
            materials: [],
            colors: [],
            prices: null,
            size: null,
        };
        $(".size-check").on("click", function () {
            filters.size = $(this).find(".size").text().trim();
            applyFilters();
            updateMetaFilter();
        });
        $('input[name="availability"]').change(function () {
            filters.availability = $(this).attr("id") === "inStock" ? "In stock" : "Out of stock";
            applyFilters();
            updateMetaFilter();
        });

        $('input[name="category"]').change(function () {
            const categoryId = $(this).attr("id");
            let categoryLabel = $(this).next("label").find("span").first().text().trim();

            if ($(this).is(":checked")) {
                filters.categories.push({ id: categoryId, label: categoryLabel });
            } else {
                filters.categories = filters.categories.filter((category) => category.id !== categoryId);
            }

            applyFilters();
            updateMetaFilter();
        });

        $('input[name="material"]').change(function () {
            const materialId = $(this).attr("id");
            let materialLabel = $(this).next("label").find("span").first().text().trim();

            if ($(this).is(":checked")) {
                filters.materials.push({ id: materialId, label: materialLabel });
            } else {
                filters.materials = filters.materials.filter((material) => material.id !== materialId);
            }

            applyFilters();
            updateMetaFilter();
        });

        $('input[name="color"]').change(function () {
            const colorId = $(this).attr("id");
            let colorLabel = $(this).next("label").find("span").first().text().trim();

            if ($(this).is(":checked")) {
                filters.colors.push({ id: colorId, label: colorLabel });
            } else {
                filters.colors = filters.colors.filter((color) => color.id !== colorId);
            }

            applyFilters();
            updateMetaFilter();
        });
        $('input[name="price"]').change(function () {
            const priceId = $(this).attr("id");
            filters.prices = priceId;
            applyFilters();
            updateMetaFilter();
        });

        function updateMetaFilter() {
            $(".meta-filter-shop").each(function () {
                const metaFilterShop = $(this);
                const appliedFilters = metaFilterShop.find("#applied-filters");
                appliedFilters.empty();

                if (filters.availability) {
                    appliedFilters.append(
                        `<span class="filter-tag remove-tag" data-filter="availability">${filters.availability} <span class="icon icon-close"></span></span>`
                    );
                }

                filters.categories.forEach((category) => {
                    appliedFilters.append(
                        `<span class="filter-tag remove-tag" data-filter="category" data-value="${category.id}">${category.label} <span class="icon icon-close"></span></span>`
                    );
                });

                filters.materials.forEach((material) => {
                    appliedFilters.append(
                        `<span class="filter-tag remove-tag" data-filter="material" data-value="${material.id}">${material.label} <span class="icon icon-close"></span></span>`
                    );
                });

                filters.colors.forEach((color) => {
                    appliedFilters.append(
                        `<span class="filter-tag remove-tag" data-filter="color" data-value="${color.id}">${color.label} <span class="icon icon-close"></span></span>`
                    );
                });

                if (filters.prices) {
                    const priceLabel = $("#" + filters.prices)
                        .next("label")
                        .find("span")
                        .first()
                        .text()
                        .trim();
                    appliedFilters.append(
                        `<span class="filter-tag remove-tag" data-filter="priceRadio">${priceLabel} <span class="icon icon-close"></span></span>`
                    );
                }

                if (filters.size) {
                    appliedFilters.append(
                        `<span class="filter-tag remove-tag" data-filter="size">${filters.size}<span class="icon icon-close"></span></span>`
                    );
                }

                const hasFiltersApplied = appliedFilters.children().length > 0;
                metaFilterShop.toggle(hasFiltersApplied);
            });

            $("#remove-all").toggle($(".meta-filter-shop #applied-filters").children().length > 0);

            const hasFiltersApplied = $(".meta-filter-shop #applied-filters").children().length > 0;
            $(".btn-check-none").toggle(hasFiltersApplied);
        }

        $(document).on("click", ".remove-tag", function () {
            const filterType = $(this).data("filter");
            const filterValue = $(this).data("value");

            if (filterType === "availability") {
                filters.availability = null;
                $('input[name="availability"]').prop("checked", false);
            }
            if (filterType === "category") {
                filters.categories = filters.categories.filter((category) => category.id !== filterValue);
                $(`input[name="category"][id="${filterValue}"]`).prop("checked", false);
            }
            if (filterType === "material") {
                filters.materials = filters.materials.filter((material) => material.id !== filterValue);
                $(`input[name="material"][id="${filterValue}"]`).prop("checked", false);
            }
            if (filterType === "color") {
                filters.colors = filters.colors.filter((color) => color.id !== filterValue);
                $(`input[name="color"][id="${filterValue}"]`).prop("checked", false);
            }
            if (filterType === "priceRadio") {
                filters.prices = null;
                $('input[name="price"]').prop("checked", false);
            }
            if (filterType === "size") {
                filters.size = null;
                $(".size-check").removeClass("active");
            }

            applyFilters();
            updateMetaFilter();
        });

        $("#remove-all,#reset-filter").click(function () {
            filters.availability = null;
            filters.categories = [];
            filters.materials = [];
            filters.colors = [];
            filters.prices = null;
            filters.size = null;
            $('input[name="availability"]').prop("checked", false);
            $('input[name="category"]').prop("checked", false);
            $('input[name="material"]').prop("checked", false);
            $('input[name="color"]').prop("checked", false);
            $('input[name="price"]').prop("checked", false);
            $(".size-check").removeClass("active");
            applyFilters();
            updateMetaFilter();
        });

        function applyFilters() {
            let visibleProductCountGrid = 0;
            let visibleProductCountList = 0;

            $(".wrapper-shop .card_product--V01, .wrapper-shop .tempo").each(function () {
                const product = $(this);
                let showProduct = true;
                const priceNew = parseFloat(product.find(".price-new").text().replace(/[$,]/g, "")) || null;

                if (filters.size) {
                    const sizeValue = product.attr("data-size");
                    if (filters.size !== sizeValue) {
                        showProduct = false;
                    }
                }

                if (filters.availability) {
                    const availabilityStatus = product.data("availability");
                    if (filters.availability !== availabilityStatus) {
                        showProduct = false;
                    }
                }

                if (filters.categories.length > 0) {
                    const categoryId = product.attr("data-category");
                    if (!filters.categories.some((category) => category.id === categoryId)) {
                        showProduct = false;
                    }
                }
                if (filters.materials.length > 0) {
                    const materialId = product.attr("data-material");
                    if (!filters.materials.some((material) => material.id === materialId)) {
                        showProduct = false;
                    }
                }
                if (filters.colors.length > 0) {
                    const colorId = product.attr("data-color");
                    if (!filters.colors.some((color) => color.id === colorId)) {
                        showProduct = false;
                    }
                }
                if (filters.prices) {
                    if (priceNew === null || isNaN(priceNew)) {
                        showProduct = false;
                    } else {
                        switch (filters.prices) {
                            case "u-500":
                                if (priceNew >= 500) showProduct = false;
                                break;
                            case "u-1000":
                                if (priceNew >= 1000) showProduct = false;
                                break;
                            case "u-2000":
                                if (priceNew >= 2000) showProduct = false;
                                break;
                            case "up-2000":
                                if (priceNew < 2000) showProduct = false;
                                break;
                        }
                    }
                }

                product.toggle(showProduct);

                if (showProduct) {
                    visibleProductCountGrid++;
                    // if (product.hasClass("grid")) {
                    // } else if (product.hasClass("style-list")) {
                    //     visibleProductCountList++;
                    // }
                }
            });

            if (
                filters.availability ||
                filters.categories.length > 0 ||
                filters.materials.length > 0 ||
                filters.colors.length > 0 ||
                filters.prices ||
                filters.size
            ) {
                $("#product-count-grid").hide();
            } else {
                $("#product-count-grid").show();
            }

            updateLastVisibleItem();
            if (visibleProductCountGrid >= 12 || visibleProductCountList >= 12) {
                $(".wg-pagination,.tf-loading").show();
            } else {
                $(".wg-pagination,.tf-loading").hide();
            }
        }

        function updateLastVisibleItem() {
            setTimeout(() => {
                $(".card_product--V01.style-list").removeClass("last");
                const lastVisible = $(".card_product--V01.style-list:visible").last();
                if (lastVisible.length > 0) {
                    lastVisible.addClass("last");
                }
            }, 50);
        }
    };

    /* Filter Sort
    -------------------------------------------------------------------------*/
    var filterSort = function () {
        let isListActive = $(".sw-layout-list").hasClass("active");
        let originalProductsList = $("#listLayout .card_product--V01").clone();
        let originalProductsGrid = $("#gridLayout .card_product--V01").clone();
        // let paginationList = $("#listLayout .wg-pagination").clone();
        // let paginationGrid = $("#gridLayout .wg-pagination").clone();

        $(".select-item").on("click", function () {
            const sortValue = $(this).data("sort-value");
            $(".select-item").removeClass("active");
            $(this).addClass("active");
            $(".text-sort-value").text($(this).find(".text-value-item").text());

            applyFilter(sortValue, isListActive);
        });

        $(".tf-view-layout-switch").on("click", function () {
            const layout = $(this).data("value-layout");

            if (layout === "list") {
                isListActive = true;
                $("#gridLayout").hide();
                $("#listLayout").show();
            } else {
                isListActive = false;
                $("#listLayout").hide();
                setGridLayout(layout);
            }
        });

        function applyFilter(sortValue, isListActive) {
            let products;

            if (isListActive) {
                products = $("#listLayout .card_product--V01");
            } else {
                products = $("#gridLayout .card_product--V01");
            }

            if (sortValue === "best-selling") {
                if (isListActive) {
                    $("#listLayout").empty().append(originalProductsList.clone());
                } else {
                    $("#gridLayout").empty().append(originalProductsGrid.clone());
                }
                displayPagination(products, isListActive);
                return;
            }

            if (sortValue === "price-low-high") {
                products.sort(
                    (a, b) =>
                        parseFloat($(a).find(".price-new").text().replace(/[$,]/g, "")) -
                        parseFloat($(b).find(".price-new").text().replace(/[$,]/g, ""))
                );
            } else if (sortValue === "price-high-low") {
                products.sort(
                    (a, b) =>
                        parseFloat($(b).find(".price-new").text().replace(/[$,]/g, "")) -
                        parseFloat($(a).find(".price-new").text().replace(/[$,]/g, ""))
                );
            } else if (sortValue === "a-z") {
                products.sort((a, b) =>
                    $(a).find(".name-product").text().localeCompare($(b).find(".name-product").text())
                );
            } else if (sortValue === "z-a") {
                products.sort((a, b) =>
                    $(b).find(".name-product").text().localeCompare($(a).find(".name-product").text())
                );
            }

            if (isListActive) {
                $("#listLayout").empty().append(products);
            } else {
                $("#gridLayout").empty().append(products);
            }
            displayPagination(products, isListActive);
        }

        // function displayPagination(products, isListActive) {
        //     if (products.length >= 12) {
        //         if (isListActive) {
        //             $("#listLayout").append(paginationList.clone());
        //         } else {
        //             $("#gridLayout").append(paginationGrid.clone());
        //         }
        //     }
        // }

        function setGridLayout(layoutClass) {
            $("#gridLayout").show().removeClass().addClass(`wrapper-shop tf-grid-layout ${layoutClass}`);
            $(".tf-view-layout-switch").removeClass("active");
            $(`.tf-view-layout-switch[data-value-layout="${layoutClass}"]`).addClass("active");
        }
    };

    /* Switch Layout 
    -------------------------------------------------------------------------*/
    var swLayoutShop = function () {
        let isListActive = $(".sw-layout-list").hasClass("active");
        let userSelectedLayout = null;

        function hasValidLayout() {
            return (
                $("#gridLayout").hasClass("tf-col-2") ||
                $("#gridLayout").hasClass("tf-col-3") ||
                $("#gridLayout").hasClass("tf-col-4") ||
                $("#gridLayout").hasClass("tf-col-5") ||
                $("#gridLayout").hasClass("tf-col-6") ||
                $("#gridLayout").hasClass("tf-col-7")
            );
        }

        function updateLayoutDisplay() {
            const windowWidth = $(window).width();
            const currentLayout = $("#gridLayout").attr("class");

            if (!hasValidLayout()) {
                return;
            }

            if (isListActive) {
                $("#gridLayout").hide();
                $("#listLayout").show();
                $(".wrapper-control-shop").addClass("listLayout-wrapper").removeClass("gridLayout-wrapper");
                return;
            }

            if (userSelectedLayout) {
                if (windowWidth <= 767) {
                    setGridLayout("tf-col-2");
                } else if (windowWidth <= 1200 && userSelectedLayout !== "tf-col-2") {
                    setGridLayout("tf-col-3");
                } else if (
                    windowWidth <= 1400 &&
                    (userSelectedLayout === "tf-col-5" ||
                        userSelectedLayout === "tf-col-6" ||
                        userSelectedLayout === "tf-col-7")
                ) {
                    setGridLayout("tf-col-4");
                } else {
                    setGridLayout(userSelectedLayout);
                }
                return;
            }

            if (windowWidth <= 767) {
                if (!currentLayout.includes("tf-col-2")) {
                    setGridLayout("tf-col-2");
                }
            } else if (windowWidth <= 1200) {
                if (!currentLayout.includes("tf-col-3")) {
                    setGridLayout("tf-col-3");
                }
            } else if (windowWidth <= 1400) {
                if (
                    currentLayout.includes("tf-col-5") ||
                    currentLayout.includes("tf-col-6") ||
                    currentLayout.includes("tf-col-7")
                ) {
                    setGridLayout("tf-col-4");
                }
            } else {
                $("#listLayout").hide();
                $("#gridLayout").show();
                $(".wrapper-control-shop").addClass("gridLayout-wrapper").removeClass("listLayout-wrapper");
            }
        }

        function setGridLayout(layoutClass) {
            $("#listLayout").hide();
            $("#gridLayout").show().removeClass().addClass(`wrapper-shop tf-grid-layout ${layoutClass}`);
            $(".tf-view-layout-switch").removeClass("active");
            $(`.tf-view-layout-switch[data-value-layout="${layoutClass}"]`).addClass("active");
            $(".wrapper-control-shop").addClass("gridLayout-wrapper").removeClass("listLayout-wrapper");
            isListActive = false;
        }

        $(document).ready(function () {
            if (isListActive) {
                $("#gridLayout").hide();
                $("#listLayout").show();
                $(".wrapper-control-shop").addClass("listLayout-wrapper").removeClass("gridLayout-wrapper");
            } else {
                $("#listLayout").hide();
                $("#gridLayout").show();
                updateLayoutDisplay();
            }
        });

        $(window).on("resize", updateLayoutDisplay);

        $(".tf-view-layout-switch").on("click", function () {
            const layout = $(this).data("value-layout");
            $(".tf-view-layout-switch").removeClass("active");
            $(this).addClass("active");
            $(".wrapper-control-shop").addClass("loading-shop");
            setTimeout(() => {
                $(".wrapper-control-shop").removeClass("loading-shop");
                if (isListActive) {
                    $("#gridLayout").css("display", "none");
                    $("#listLayout").css("display", "");
                } else {
                    $("#listLayout").css("display", "none");
                    $("#gridLayout").css("display", "");
                }
            }, 500);

            if (layout === "list") {
                isListActive = true;
                userSelectedLayout = null;
                $("#gridLayout").hide();
                $("#listLayout").show();
                $(".wrapper-control-shop").addClass("listLayout-wrapper").removeClass("gridLayout-wrapper");
            } else {
                userSelectedLayout = layout;
                setGridLayout(layout);
            }
        });
    };
    /* Loading product 
    -------------------------------------------------------------------------*/
    var loadProduct = function () {
        const gridInitialItems = 15;
        const gridItemsPerPage = 4;

        let gridItemsDisplayed = gridInitialItems;
        let scrollTimeout;

        function hideExtraItems(layout, itemsDisplayed) {
            layout.find(".loadItem").each(function (index) {
                if (index >= itemsDisplayed) {
                    $(this).addClass("hidden");
                }
            });
        }

        function showMoreItems(layout, itemsPerPage, itemsDisplayed) {
            const hiddenItems = layout.find(".loadItem.hidden");

            setTimeout(function () {
                hiddenItems.slice(0, itemsPerPage).removeClass("hidden");
                checkLoadMoreButton(layout);
            }, 600);

            return itemsDisplayed + itemsPerPage;
        }

        function checkLoadMoreButton(layout) {
            if (layout.find(".loadItem.hidden").length === 0) {
                if (layout.is("#gridLayout")) {
                    $("#loadMoreGridBtn").hide();
                    $("#infiniteScrollGrid").hide();
                }
            }
        }

        hideExtraItems($("#gridLayout"), gridItemsDisplayed);

        $("#loadMoreGridBtn .btn-loadmore").on("click", function () {
            gridItemsDisplayed = showMoreItems($("#gridLayout"), gridItemsPerPage, gridItemsDisplayed);
        });

        // Infinite Scrolling
        function onScroll() {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(function () {
                const infiniteScrollGrid = $("#infiniteScrollGrid");

                if (infiniteScrollGrid.is(":visible") && isElementInViewport(infiniteScrollGrid)) {
                    gridItemsDisplayed = showMoreItems($("#gridLayout"), gridItemsPerPage, gridItemsDisplayed);
                }
            }, 300);
        }

        function isElementInViewport(el) {
            const rect = el[0].getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        }

        $(window).on("scroll", onScroll);
    };

    $(function () {
        filterProducts();
        filterSort();
        swLayoutShop();
        loadProduct();
    });
})(jQuery);
