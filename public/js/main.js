/**
 *Select Image
 *Button Quantity
 *Delete File
 *Go Top
 *Variant Picker
 *Change Value
 *Sidebar Mobile
 *Check Active
 *Button Loading
 *Stagger Wrap
 *Modal Second
 *Header Sticky
 *Auto Popup
 *Toggle Control
 *Total Price Variant
 *Scroll Grid Product
 *Hover Image Cursor
 *Handle Progress
 *Handle Footer
 *Infinite Slide
 *Video Popup
 *Update Bundle Total
 *Add Wishlist
 *Handle Sidebar Filter
 *Estimate Shipping
 *Countdown Custom
 *Coupon Copy
 *Height Table
 *Animation Custom
 *Parallaxie
 *Update Compare Empty
 *Delete Wishlist
 *Preloader
 */

 (function ($) {
    "use strict";

    /* Select Image
    -------------------------------------------------------------------------*/
    var dropdownSelect = function () {
        $(".tf-dropdown-select").selectpicker();
    };

    /* Button Quantity
    -------------------------------------------------------------------------*/
    var btnQuantity = function () {
        $(".minus-btn").on("click", function (e) {
            e.preventDefault();
            var $this = $(this);
            var $input = $this.closest("div").find("input");
            var value = parseInt($input.val(), 10);

            if (value > 1) {
                value = value - 1;
            }
            $input.val(value);
        });

        $(".plus-btn").on("click", function (e) {
            e.preventDefault();
            var $this = $(this);
            var $input = $this.closest("div").find("input");
            var value = parseInt($input.val(), 10);

            if (value > -1) {
                value = value + 1;
            }
            $input.val(value);
        });
    };

    /* Delete File 
    -------------------------------------------------------------------------*/
    var deleteFile = function (e) {
        function updateCount() {
            var count = $(".list-file-delete .file-delete").length;
            $(".prd-count").text(count);
        }

        function updateTotalPrice() {
            var total = 0;

            $(".list-file-delete .tf-mini-cart-item").each(function () {
                var priceText = $(this).find(".tf-mini-card-price").text().replace("$", "").replace(",", "").trim();
                var price = parseFloat(priceText);
                var quantity = parseInt($(this).find(".quantity-product").val(), 10);

                if (!isNaN(price) && !isNaN(quantity)) {
                    total += price * quantity;
                }
            });

            var formatted = total.toLocaleString("en-US", { style: "currency", currency: "USD" });
            $(".tf-totals-total-value").text(formatted);
        }

        function updatePriceEach() {
            $(".each-prd").each(function () {
                var priceText = $(this).find(".each-price").text().replace("$", "").replace(",", "").trim();
                var price = parseFloat(priceText);
                var quantity = parseInt($(this).find(".quantity-product").val(), 10);
                if (!isNaN(price) && !isNaN(quantity)) {
                    var subtotal = price * quantity;
                    var formatted = subtotal.toLocaleString("en-US", { style: "currency", currency: "USD" });
                    $(this).find(".each-subtotal-price").text(formatted);
                }
            });
        }

        function updateTotalPriceEach() {
            var total = 0;

            $(".each-list-prd .each-prd").each(function () {
                var priceText = $(this).find(".each-subtotal-price").text().replace("$", "").replace(",", "").trim();
                var price = parseFloat(priceText);
                var quantity = parseInt($(this).find(".quantity-product").val(), 10);

                if (!isNaN(price) && !isNaN(quantity)) {
                    total += price;
                }
            });

            var formatted = total.toLocaleString("en-US", { style: "currency", currency: "USD" });
            $(".each-total-price").text(formatted);
        }

        function checkListEmpty() {
            if ($(".list-empty").length) {
                var $listEmpty = $(".list-empty");
                var $textEmpty = $listEmpty.find(".text-empty");
                var $otherChildren = $listEmpty.children().not(".text-empty");
                var count = $otherChildren.length;

                $(".count-item-compare").text("(" + count + ")");

                if ($otherChildren.length > 0) {
                    $textEmpty.hide();
                } else {
                    $textEmpty.show();
                }
            }
        }

        if ($(".main-list-clear").length) {
            $(".main-list-clear").each(function () {
                var $mainList = $(this);

                $mainList.find(".clear-list-empty").on("click", function () {
                    $mainList.find(".list-empty").children().not(".text-empty").remove();
                    checkListEmpty();
                });
            });
        }

        $(".list-file-delete").on("input", ".quantity-product", function () {
            updateTotalPrice();
        });

        $(".list-file-delete,.each-prd").on("click", ".minus-quantity, .plus-quantity", function () {
            var $quantityInput = $(this).siblings(".quantity-product");
            var currentQuantity = parseInt($quantityInput.val(), 10);

            if ($(this).hasClass("plus-quantity")) {
                $quantityInput.val(currentQuantity + 1);
            } else if ($(this).hasClass("minus-quantity") && currentQuantity > 1) {
                $quantityInput.val(currentQuantity - 1);
            }

            updateTotalPrice();
            updatePriceEach();
            updateTotalPriceEach();
        });

        $(".remove").on("click", function (e) {
            e.preventDefault();
            var $this = $(this);
            $this.closest(".file-delete").remove();
            updateCount();
            updateTotalPrice();
            checkListEmpty();
            updateTotalPriceEach();
        });

        $(".clear-file-delete").on("click", function (e) {
            e.preventDefault();
            $(this).closest(".list-file-delete").find(".file-delete").remove();
            updateCount();
            updateTotalPrice();
            checkListEmpty();
        });
        checkListEmpty();
        updateCount();
        updateTotalPrice();
        updatePriceEach();
        updateTotalPriceEach();
    };

    /* Go Top
    -------------------------------------------------------------------------*/
    var goTop = function () {
        var $goTop = $("#goTop");
        var $borderProgress = $(".border-progress");

        $(window).on("scroll", function () {
            var scrollTop = $(window).scrollTop();
            var docHeight = $(document).height() - $(window).height();
            var scrollPercent = (scrollTop / docHeight) * 100;
            var progressAngle = (scrollPercent / 100) * 360;

            $borderProgress.css("--progress-angle", progressAngle + "deg");

            if (scrollTop > 100) {
                $goTop.addClass("show");
            } else {
                $goTop.removeClass("show");
            }
        });

        $goTop.on("click", function () {
            $("html, body").animate({ scrollTop: 0 }, 0);
        });
    };

    /* Variant Picker
    -------------------------------------------------------------------------*/
    var variantPicker = function () {
        if ($(".variant-picker-item").length) {
            $(".color-btn").on("click", function (e) {
                var value = $(this).data("scroll");
                var value2 = $(this).data("color");

                $(".value-currentColor").text(value);
                $(".value-currentColor").text(value2);

                $(this).closest(".variant-picker-values").find(".color-btn").removeClass("active");
                $(this).addClass("active");
            });
            $(".size-btn").on("click", function (e) {
                var value = $(this).data("size");
                $(".value-currentSize").text(value);

                $(this).closest(".variant-picker-values").find(".size-btn").removeClass("active");
                $(this).addClass("active");
            });
        }
    };

    /* Change Value
    -------------------------------------------------------------------------*/
    var changeValue = function () {
        if ($(".tf-dropdown-sort").length > 0) {
            $(".select-item").on("click", function () {
                var $this = $(this);
                var $dropdown = $this.closest(".tf-dropdown-sort");
                var $dropdownMenu = $this.closest(".dropdown-menu");

                $dropdown.find(".text-sort-value").text($this.find(".text-value-item").text());

                $dropdownMenu.find(".select-item.active").removeClass("active");
                $this.addClass("active");

                var color = $this.data("value-color");
                $dropdown.find(".btn-select .current-color").css("background", color);
            });
        }
    };

    /* Sidebar Mobile
    -------------------------------------------------------------------------*/
    var sidebarMobile = function () {
        if ($(".sidebar-content-wrap").length > 0) {
            var sidebar = $(".sidebar-content-wrap").html();
            $(".sidebar-mobile-append").append(sidebar);
        }
    };

    /* Check Active 
    -------------------------------------------------------------------------*/
    var checkClick = function () {
        $(".flat-check-list").on("click", ".check-item", function () {
            $(this).closest(".flat-check-list").find(".check-item").removeClass("active");
            $(this).addClass("active");
        });
    };

    /* Button Loading
    -------------------------------------------------------------------------*/
    var btnLoading = function () {
        if ($(".tf-loading").length) {
            $(".tf-loading").on("click", function (e) {
                $(this).addClass("loading");
                var $this = $(this);
                setTimeout(function () {
                    $this.removeClass("loading");
                }, 600);
            });
        }
    };

    /* Stagger Wrap
    -------------------------------------------------------------------------*/
    var staggerWrap = function () {
        if ($(".stagger-wrap").length) {
            var count = $(".stagger-item").length;
            for (var i = 1, time = 0.2; i <= count; i++) {
                $(".stagger-item:nth-child(" + i + ")")
                    .css("transition-delay", time * i + "s")
                    .addClass("stagger-finished");
            }
        }
    };

    /* Modal Second
    -------------------------------------------------------------------------*/
    var clickModalSecond = function () {
        $(".show-size-guide").on("click", function () {
            $("#size-guide").modal("show");
        });
        $(".show-shopping-cart").on("click", function () {
            $("#shoppingCart").modal("show");
        });
        $(".btn-icon-action.wishlist").on("click", function () {
            $("#wishlist").modal("show");
        });

        $(".btn-add-to-cart").on("click", function () {
            $(".tf-add-cart-success").addClass("active");
        });
        $(".tf-add-cart-success .tf-add-cart-close").on("click", function () {
            $(".tf-add-cart-success").removeClass("active");
        });

        $(".btn-add-note, .btn-add-coupon, .btn-estimate-shipping, .btn-add-gift").on("click", function () {
            var classList = {
                "btn-add-note": ".add-note",
                "btn-add-coupon": ".add-coupon",
                "btn-estimate-shipping": ".estimate-shipping",
                "btn-add-gift": ".add-gift",
            };

            $.each(classList, function (btnClass, targetClass) {
                if ($(event.currentTarget).hasClass(btnClass)) {
                    $(targetClass).addClass("open");
                }
            });
        });

        $(".tf-mini-cart-tool-close").on("click", function () {
            $(".tf-mini-cart-tool-openable").removeClass("open");
        });
    };

    /* Header Sticky
  -------------------------------------------------------------------------*/
    var headerSticky = function () {
        let lastScrollTop = 0;
        let delta = 5;
        let navbarHeight = $("header").outerHeight();
        let didScroll = false;

        $(window).scroll(function () {
            didScroll = true;
        });

        setInterval(function () {
            if (didScroll) {
                let st = $(window).scrollTop();
                navbarHeight = $("header").outerHeight();

                if (st > navbarHeight) {
                    if (st > lastScrollTop + delta) {
                        $("header").css("top", `-${navbarHeight}px`);
                        $(".sticky-top").css("top", "15px");
                    } else if (st < lastScrollTop - delta) {
                        $("header").css("top", "0");
                        $("header").addClass("header-sticky");
                        $(".sticky-top").css("top", `${15 + navbarHeight}px`);
                    }
                } else {
                    $("header").css("top", "unset");
                    $("header").removeClass("header-sticky");
                    $(".sticky-top").css("top", "15px");
                }
                lastScrollTop = st;
                didScroll = false;
            }
        }, 250);
    };

    /* Auto Popup
    -------------------------------------------------------------------------*/
    var autoPopup = function () {
        if ($(".auto-popup").length > 0) {
            let showPopup = sessionStorage.getItem("showPopup");
            if (!JSON.parse(showPopup)) {
                setTimeout(function () {
                    $(".auto-popup").modal("show");
                }, 2000);
            }
        }
        $(".btn-hide-popup").on("click", function () {
            sessionStorage.setItem("showPopup", true);
        });
    };

    /* Toggle Control
    -------------------------------------------------------------------------*/
    var clickControl = function () {
        const $showForm = $(".show-form-address");
        const $editForm = $(".edit-form-address");

        $(".btn-add-address").on("click", function () {
            const isVisible = $showForm.is(":visible");

            if (isVisible) {
                $showForm.hide();
            } else {
                $showForm.show();
                $editForm.hide().removeClass("show");
                $(".account-address-item").removeClass("editing");
            }
        });

        $(".btn-hide-address").on("click", function () {
            $showForm.hide();
        });

        $(".btn-delete-address").on("click", function () {
            const $item = $(this).closest(".account-address-item");
            $item.remove();
            if ($item.hasClass("editing")) {
                $editForm.hide().removeClass("show");
            }
        });

        $(".btn-edit-address").on("click", function () {
            const $item = $(this).closest(".account-address-item");
            const isEditing = $item.hasClass("editing");

            $showForm.hide();

            if (isEditing) {
                $editForm.hide().removeClass("show");
                $item.removeClass("editing");
            } else {
                $editForm.show().addClass("show");
                $(".account-address-item").removeClass("editing");
                $item.addClass("editing");
            }
        });

        $(".btn-hide-edit-address").on("click", function () {
            $editForm.hide().removeClass("show");
            $(".account-address-item").removeClass("editing");
        });
    };

    /* Total Price Variant
    -------------------------------------------------------------------------*/
    var totalPriceVariant = function () {
        $(".tf-product-info-list,.tf-cart-item").each(function () {
            var productItem = $(this);
            var basePrice =
                parseFloat(productItem.find(".price-on-sale").data("base-price")) ||
                parseFloat(productItem.find(".price-on-sale").text().replace("$", "").replace(/,/g, ""));
            var quantityInput = productItem.find(".quantity-product");
            var personSale = parseFloat(productItem.find(".number-sale").data("person-sale") || 5);
            var compareAtPrice = basePrice * (1 + personSale / 100);

            productItem
                .find(".compare-at-price")
                .text(`$${compareAtPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}`);
            productItem.find(".color-btn, .size-btn").on("click", function () {
                var newPrice = parseFloat($(this).data("price").replace(/,/g, "")) || basePrice;
                quantityInput.val(1);
                productItem
                    .find(".price-on-sale")
                    .text(`$${newPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}`);

                var newPersonSale = parseFloat(productItem.find(".number-sale").data("person-sale") || 30);
                var newCompareAtPrice = newPrice * (1 + newPersonSale / 100);
                productItem
                    .find(".compare-at-price")
                    .text(`$${newCompareAtPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}`);

                updateTotalPrice(newPrice, productItem);
            });

            productItem.find(".btn-increase").on("click", function () {
                var currentQuantity = parseInt(quantityInput.val(), 10);
                quantityInput.val(currentQuantity + 1);
                updateTotalPrice(null, productItem);
            });

            productItem.find(".btn-decrease").on("click", function () {
                var currentQuantity = parseInt(quantityInput.val(), 10);
                if (currentQuantity > 1) {
                    quantityInput.val(currentQuantity - 1);
                    updateTotalPrice(null, productItem);
                }
            });

            function updateTotalPrice(price, scope) {
                var currentPrice =
                    price || parseFloat(scope.find(".price-on-sale").text().replace("$", "").replace(/,/g, ""));
                var quantity = parseInt(scope.find(".quantity-product").val(), 10);
                var totalPrice = currentPrice * quantity;

                scope.find(".price-add").text(`$${totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}`);
            }
        });
    };

    /* Scroll Grid Product
    -------------------------------------------------------------------------*/
    var scrollGridProduct = function () {
        var scrollContainer = $(".wrapper-gallery-scroll");
        var activescrollBtn = null;
        var offsetTolerance = 20;

        function isHorizontalMode() {
            return window.innerWidth <= 767;
        }

        function getTargetScroll(target, isHorizontal) {
            if (isHorizontal) {
                return target.offset().left - scrollContainer.offset().left + scrollContainer.scrollLeft();
            } else {
                return target.offset().top - scrollContainer.offset().top + scrollContainer.scrollTop();
            }
        }

        $(".btn-scroll-target").on("click", function () {
            var scroll = $(this).data("scroll");
            var target = $(".item-scroll-target[data-scroll='" + scroll + "']");

            if (target.length > 0) {
                var isHorizontal = isHorizontalMode();
                var targetScroll = getTargetScroll(target, isHorizontal);

                if (isHorizontal) {
                    scrollContainer.animate({ scrollLeft: targetScroll }, 600);
                } else {
                    $("html, body").animate({ scrollTop: targetScroll }, 100);
                }

                $(".btn-scroll-target").removeClass("active");
                $(this).addClass("active");
                activescrollBtn = $(this);
            }
        });

        $(window).on("scroll", function () {
            var isHorizontal = isHorizontalMode();
            $(".item-scroll-target").each(function () {
                var target = $(this);
                var targetScroll = getTargetScroll(target, isHorizontal);

                if (isHorizontal) {
                    if (
                        $(window).scrollLeft() >= targetScroll - offsetTolerance &&
                        $(window).scrollLeft() <= targetScroll + target.outerWidth()
                    ) {
                        $(".btn-scroll-target").removeClass("active");
                        $(".btn-scroll-target[data-scroll='" + target.data("scroll") + "']").addClass("active");
                    }
                } else {
                    if (
                        $(window).scrollTop() >= targetScroll - offsetTolerance &&
                        $(window).scrollTop() <= targetScroll + target.outerHeight()
                    ) {
                        $(".btn-scroll-target").removeClass("active");
                        $(".btn-scroll-target[data-scroll='" + target.data("scroll") + "']").addClass("active");
                    }
                }
            });
        });
    };

    /* Hover Image Cursor
    -------------------------------------------------------------------------*/
    var hoverImgCursor = function () {
        let offsetX = 20;
        let offsetY = 20;
        $(".hover-cursor-img").on("mousemove", function (e) {
            let hoverImage = $(this).find(".hover-image");
            hoverImage.css({
                top: e.clientY + offsetY + "px",
                left: e.clientX + offsetX + "px",
            });
        });

        $(".hover-cursor-img").on("mouseenter", function () {
            let hoverImage = $(this).find(".hover-image");
            hoverImage.css({
                transform: "scale(1)",
                opacity: 1,
            });
        });

        $(".hover-cursor-img").on("mouseleave", function () {
            let hoverImage = $(this).find(".hover-image");
            hoverImage.css({
                transform: "scale(0)",
                opacity: 0,
            });
        });
    };

    /* Handle Progress
    -------------------------------------------------------------------------*/
    var handleProgress = function () {
        if ($(".progress-cart").length > 0) {
            var progressValue = $(".progress-cart .value").data("progress");
            setTimeout(function () {
                $(".progress-cart .value").css("width", progressValue + "%");
            }, 800);
        }

        function handleProgressBar(showEvent, hideEvent, target) {
            $(target).on(hideEvent, function () {
                $(".tf-progress-bar .value").css("width", "0%");
            });

            $(target).on(showEvent, function () {
                setTimeout(function () {
                    var progressValue = $(".tf-progress-bar .value").data("progress");
                    $(".tf-progress-bar .value").css("width", progressValue + "%");
                }, 600);
            });
        }

        if ($(".popup-shopping-cart").length > 0) {
            handleProgressBar("show.bs.offcanvas", "hide.bs.offcanvas", ".popup-shopping-cart");
        }

        if ($(".popup-shopping-cart").length > 0) {
            handleProgressBar("show.bs.modal", "hide.bs.modal", ".popup-shopping-cart");
        }
    };

    /* Handle Footer
    -------------------------------------------------------------------------*/
    var handleFooter = function () {
        var footerAccordion = function () {
            var args = { duration: 250 };
            $(".footer-heading-mobile").on("click", function () {
                $(this).parent(".footer-col-block").toggleClass("open");
                if (!$(this).parent(".footer-col-block").is(".open")) {
                    $(this).next().slideUp(args);
                } else {
                    $(this).next().slideDown(args);
                }
            });
        };
        function handleAccordion() {
            if (matchMedia("only screen and (max-width: 575px)").matches) {
                if (!$(".footer-heading-mobile").data("accordion-initialized")) {
                    footerAccordion();
                    $(".footer-heading-mobile").data("accordion-initialized", true);
                }
            } else {
                $(".footer-heading-mobile").off("click");
                $(".footer-heading-mobile").parent(".footer-col-block").removeClass("open");
                $(".footer-heading-mobile").next().removeAttr("style");
                $(".footer-heading-mobile").data("accordion-initialized", false);
            }
        }
        handleAccordion();
        window.addEventListener("resize", function () {
            handleAccordion();
        });
    };

    /* Infinite Slide 
    -------------------------------------------------------------------------*/
    var infiniteSlide = function () {
        if ($(".infiniteSlide").length > 0) {
            $(".infiniteSlide").each(function () {
                var $this = $(this);
                var style = $this.data("style") || "left";
                var clone = $this.data("clone") || 2;
                var speed = $this.data("speed") || 50;
                $this.infiniteslide({
                    speed: speed,
                    direction: style,
                    clone: clone,
                });
            });
        }
    };

    /* Video Popup 
    -------------------------------------------------------------------------*/
    var videoPopup = function () {
        if ($("div").hasClass("video-wrap")) {
            $(".popup-youtube").magnificPopup({
                type: "iframe",
            });
        }
    };
    /* Update Bundle Total 
    -------------------------------------------------------------------------*/
    var updateBundleTotal = function () {
        var $bundleItems = $(".tf-bundle-product-item");
        var $firstCheck = $bundleItems.first().find(".tf-check");
        $firstCheck.prop("checked", true).prop("disabled", true);

        var updateBundleTotal = function () {
            var totalPrice = 0;

            $bundleItems.each(function () {
                var $this = $(this);
                if ($this.find(".tf-check").prop("checked")) {
                    var newPrice = parseFloat($this.find(".price-new").text().replace(/[$,]/g, "")) || 0;

                    totalPrice += newPrice;
                }
            });

            $(".total-price").text(`$${totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}`);
        };

        updateBundleTotal();

        $(".tf-check").on("change", function () {
            updateBundleTotal();
        });
    };

    /* Add Wishlist
    -------------------------------------------------------------------------*/
    var addWishList = function () {
        $(".btn-add-wishlist, .card_product--V01 .wishlist").on("click", function () {
            let $this = $(this);
            let icon = $this.find(".icon");
            let tooltip = $this.find(".tooltip");

            $this.toggleClass("addwishlist");

            if ($this.hasClass("addwishlist")) {
                icon.removeClass("icon-heart-2").addClass("icon-trash");
                tooltip.text("Remove Wishlist");
            } else {
                icon.removeClass("icon-trash").addClass("icon-heart-2");
                tooltip.text("Add to Wishlist");
            }
        });
    };
    /* Handle Sidebar Filter 
    -------------------------------------------------------------------------*/
    var handleSidebarFilter = function () {
        $(".tf-btn-filter ,.sidebar-btn").on("click", function () {
            if ($(window).width() <= 1200) {
                $(".sidebar-filter,.overlay-filter").addClass("show");
            }
        });
        $(".close-filter,.overlay-filter").on("click", function () {
            $(".sidebar-filter,.overlay-filter").removeClass("show");
        });
    };
    /* Estimate Shipping
    -------------------------------------------------------------------------*/
    var estimateShipping = function () {
        if ($(".estimate-shipping").length) {
            const countrySelect = document.getElementById("shipping-country-form");
            const provinceSelect = document.getElementById("shipping-province-form");
            const zipcodeInput = document.getElementById("zipcode");
            const zipcodeMessage = document.getElementById("zipcode-message");
            const zipcodeSuccess = document.getElementById("zipcode-success");

            function updateProvinces() {
                const selectedCountry = countrySelect.value;
                const selectedOption = countrySelect.options[countrySelect.selectedIndex];
                const provincesData = selectedOption.getAttribute("data-provinces");

                const provinces = JSON.parse(provincesData);

                provinceSelect.innerHTML = "";

                if (provinces.length === 0) {
                    const option = document.createElement("option");
                    option.textContent = "------";
                    provinceSelect.appendChild(option);
                } else {
                    provinces.forEach((province) => {
                        const option = document.createElement("option");
                        option.value = province[0];
                        option.textContent = province[1];
                        provinceSelect.appendChild(option);
                    });
                }
            }

            countrySelect.addEventListener("change", updateProvinces);

            function validateZipcode(zipcode, country) {
                let regex;

                switch (country) {
                    case "Australia":
                        regex = /^\d{4}$/;
                        break;
                    case "Austria":
                        regex = /^\d{4}$/;
                        break;
                    case "Belgium":
                        regex = /^\d{4}$/;
                        break;
                    case "Canada":
                        regex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
                        break;
                    case "Czech Republic":
                        regex = /^\d{5}$/;
                        break;
                    case "Denmark":
                        regex = /^\d{4}$/;
                        break;
                    case "Finland":
                        regex = /^\d{5}$/;
                        break;
                    case "France":
                        regex = /^\d{5}$/;
                        break;
                    case "Germany":
                        regex = /^\d{5}$/;
                        break;
                    case "United States":
                        regex = /^\d{5}(-\d{4})?$/;
                        break;
                    case "United Kingdom":
                        regex = /^[A-Za-z]{1,2}\d[A-Za-z\d]? \d[A-Za-z]{2}$/;
                        break;
                    case "India":
                        regex = /^\d{6}$/;
                        break;
                    case "Japan":
                        regex = /^\d{3}-\d{4}$/;
                        break;
                    case "Mexico":
                        regex = /^\d{5}$/;
                        break;
                    case "South Korea":
                        regex = /^\d{5}$/;
                        break;
                    case "Spain":
                        regex = /^\d{5}$/;
                        break;
                    case "Italy":
                        regex = /^\d{5}$/;
                        break;
                    case "Vietnam":
                        regex = /^\d{6}$/;
                        break;
                    default:
                        return true;
                }

                return regex.test(zipcode);
            }

            $("#shipping-form").on("submit", function (e) {
                const zipcode = zipcodeInput.value.trim();
                const country = countrySelect.value;

                if (!validateZipcode(zipcode, country)) {
                    zipcodeMessage.style.display = "block";
                    zipcodeSuccess.style.display = "none";
                    e.preventDefault();
                } else {
                    zipcodeMessage.style.display = "none";
                    zipcodeSuccess.style.display = "block";
                    e.preventDefault();
                }
            });

            window.onload = updateProvinces;
        }
    };

    /* Coupon Copy
    -------------------------------------------------------------------------*/
    var couponCopy = function () {
        $(".coupon-copy-wrap").on("click", function () {
            const couponCode = $(this).find(".coupon-code").text().trim();

            if (navigator.clipboard) {
                navigator.clipboard
                    .writeText(couponCode)
                    .then(function () {
                        alert("Copied! " + couponCode);
                    })
                    .catch(function (err) {
                        alert("Unable to copy: " + err);
                    });
            } else {
                const tempInput = $("<input>");
                $("body").append(tempInput);
                tempInput.val(couponCode).select();
                document.execCommand("copy");
                tempInput.remove();
                alert("Copied! " + couponCode);
            }
        });
    };
    /* Height Table 
    -------------------------------------------------------------------------*/
    var heightTable = function () {
        function updateTableHeight() {
            const $originalModal = $("#orderDetail");

            const $clone = $originalModal
                .clone()
                .css({
                    display: "block",
                    visibility: "hidden",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    zIndex: -1,
                })
                .appendTo("body");

            const $tableWrapper = $clone.find(".table-order-detail");
            const $table = $tableWrapper.find("table");
            const $thead = $table.find("thead");
            const $rows = $table.find("tbody tr");

            let totalRowHeight = 0;
            for (let i = 0; i < Math.min(2, $rows.length); i++) {
                totalRowHeight += $rows.eq(i).outerHeight();
            }

            const theadHeight = $thead.outerHeight();
            const maxHeight = totalRowHeight + theadHeight;

            $originalModal.find(".table-order-detail").css("max-height", maxHeight + 1 + "px");

            $clone.remove();
        }

        updateTableHeight();

        $(window).on("resize", updateTableHeight);
    };
    /* Animation Custom 
    -------------------------------------------------------------------------*/
    var animeCustom = function () {
        if ($(".text-color-change").length) {
            let animatedTextElements = document.querySelectorAll(".text-color-change");

            animatedTextElements.forEach((element) => {
                if (element.wordSplit) {
                    element.wordSplit.revert();
                }
                if (element.charSplit) {
                    element.charSplit.revert();
                }

                element.wordSplit = new SplitText(element, {
                    type: "words",
                    wordsClass: "word-wrapper",
                });

                element.charSplit = new SplitText(element.wordSplit.words, {
                    type: "chars",
                    charsClass: "char-wrapper",
                });

                gsap.set(element.charSplit.chars, {
                    color: "#A9A9A9",
                    opacity: 1,
                });

                element.animation = gsap.to(element.charSplit.chars, {
                    scrollTrigger: {
                        trigger: element,
                        start: "top 90%",
                        end: "bottom 35%",
                        toggleActions: "play none none reverse",
                        scrub: true,
                    },
                    color: "#1F1F1F",
                    stagger: {
                        each: 0.05,
                        from: "start",
                    },
                    duration: 0.5,
                    ease: "power2.out",
                });
            });
        }
        if ($(".text-color-change-2").length) {
            let animatedTextElements = document.querySelectorAll(".text-color-change-2");

            animatedTextElements.forEach((element) => {
                if (element.wordSplit) {
                    element.wordSplit.revert();
                }
                if (element.charSplit) {
                    element.charSplit.revert();
                }

                element.wordSplit = new SplitText(element, {
                    type: "words",
                    wordsClass: "word-wrapper",
                });

                element.charSplit = new SplitText(element.wordSplit.words, {
                    type: "chars",
                    charsClass: "char-wrapper",
                });

                gsap.set(element.charSplit.chars, {
                    color: "#FFFFFF",
                    opacity: 1,
                });

                element.animation = gsap.to(element.charSplit.chars, {
                    scrollTrigger: {
                        trigger: element,
                        start: "top 90%",
                        end: "bottom 35%",
                        toggleActions: "play none none reverse",
                        scrub: true,
                    },
                    color: "#DEB973",
                    stagger: {
                        each: 0.05,
                        from: "start",
                    },
                    duration: 0.5,
                    ease: "power2.out",
                });
            });
        }
        if (typeof gsap !== "undefined" && $(".hover-repel").length) {
            $(document).on("mousemove", function (e) {
                $(".hover-repel").each(function () {
                    const $this = $(this);
                    const offset = $this.offset();
                    const width = $this.outerWidth();
                    const height = $this.outerHeight();

                    const centerX = offset.left + width / 2;
                    const centerY = offset.top + height / 2;

                    const deltaX = centerX - e.pageX;
                    const deltaY = centerY - e.pageY;

                    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

                    const radius = 300;
                    const maxPush = 50;

                    if (distance < radius) {
                        const force = (1 - distance / radius) * maxPush;

                        const angle = Math.atan2(deltaY, deltaX);
                        const moveX = Math.cos(angle) * force;
                        const moveY = Math.sin(angle) * force;

                        gsap.to(this, {
                            x: moveX,
                            y: moveY,
                            duration: 0.3,
                            ease: "power2.out",
                        });
                    } else {
                        gsap.to(this, {
                            x: 0,
                            y: 0,
                            duration: 0.5,
                            ease: "power2.out",
                        });
                    }
                });
            });
        }

        function setupDodger() {
            const $playArea = $(".play-area-2");
            const $dodger = $(".dodger-2");

            if (!$playArea.length || !$dodger.length) return;

            const dodgerW = $dodger.outerWidth();
            const dodgerH = $dodger.outerHeight();
            const areaW = $playArea.width();
            const areaH = $playArea.height();
            const safeMargin = 50;

            let isDragging = false;
            let offsetX = 0;
            let offsetY = 0;

            if (window.innerWidth >= 1440) {
                $dodger.css({
                    top: areaH - dodgerH,
                    left: areaW - dodgerW,
                    bottom: "auto",
                    right: "auto",
                    position: "absolute",
                });

                $playArea.off("mousemove.dodger").on("mousemove.dodger", function (e) {
                    const offset = $playArea.offset();
                    const mouseX = e.pageX - offset.left;
                    const mouseY = e.pageY - offset.top;

                    const dodgerPos = $dodger.position();
                    const leftEdge = dodgerPos.left - safeMargin;
                    const rightEdge = dodgerPos.left + dodgerW + safeMargin;
                    const topEdge = dodgerPos.top - safeMargin;
                    const bottomEdge = dodgerPos.top + dodgerH + safeMargin;

                    if (mouseX > leftEdge && mouseX < rightEdge && mouseY > topEdge && mouseY < bottomEdge) {
                        const dx = dodgerPos.left + dodgerW / 2 - mouseX;
                        const dy = dodgerPos.top + dodgerH / 2 - mouseY;
                        const angle = Math.atan2(dy, dx);

                        let newX = dodgerPos.left + Math.cos(angle) * 50;
                        let newY = dodgerPos.top + Math.sin(angle) * 50;

                        newX = Math.max(0, Math.min(newX, areaW - dodgerW));
                        newY = Math.max(0, Math.min(newY, areaH - dodgerH));

                        gsap.to($dodger, {
                            left: newX,
                            top: newY,
                            duration: 0.3,
                            ease: "power2.out",
                        });
                    }
                });

                $dodger.off("mousedown").on("mousedown", function (e) {
                    isDragging = true;
                    const offset = $dodger.offset();
                    offsetX = e.pageX - offset.left;
                    offsetY = e.pageY - offset.top;
                    e.preventDefault();
                });

                $(document)
                    .off("mousemove.drag")
                    .on("mousemove.drag", function (e) {
                        if (!isDragging) return;

                        const containerOffset = $playArea.offset();
                        let x = e.pageX - containerOffset.left - offsetX;
                        let y = e.pageY - containerOffset.top - offsetY;

                        x = Math.max(0, Math.min(x, areaW - dodgerW));
                        y = Math.max(0, Math.min(y, areaH - dodgerH));

                        $dodger.css({ left: x, top: y });
                    });

                $(document)
                    .off("mouseup.drag")
                    .on("mouseup.drag", function () {
                        isDragging = false;
                    });
            } else {
                $playArea.off("mousemove.dodger");
                $(document).off("mousemove.drag mouseup.drag");
                $dodger.off("mousedown").css({
                    top: "",
                    left: "",
                    bottom: "",
                    right: "",
                    position: "",
                    cursor: "",
                });
            }
        }

        $(document).ready(setupDodger);
        $(window).on("resize", setupDodger);
    };

    /* Parallaxie 
    -------------------------------------------------------------------------*/
    var parallaxie = function () {
        var $window = $(window);

        if ($(".parallaxie").length) {
            function initParallax() {
                if ($(".parallaxie").length && $window.width() > 991) {
                    $(".parallaxie").parallaxie({
                        speed: 0.55,
                        offset: 0,
                    });
                }
            }

            initParallax();

            $window.on("resize", function () {
                if ($window.width() > 991) {
                    initParallax();
                }
            });
        }
    };
    /* Update Compare Empty
    -------------------------------------------------------------------------*/
    var tableCompareRemove = function () {
        $(".remove").on("click", function () {
            let $clickedCol = $(this).closest(".compare-col");
            let colIndex = $clickedCol.index();
            let $rows = $(".compare-row");
            let visibleCols = $(".compare-row:first .compare-col:visible").length;

            if (visibleCols > 4) {
                $rows.each(function () {
                    $(this).find(".compare-col").eq(colIndex).fadeOut(300);
                });
            } else {
                $rows.each(function () {
                    let $cols = $(this).find(".compare-col");
                    let $colToMove = $cols.eq(colIndex);

                    $colToMove.children().fadeOut(300, function () {
                        let $parentRow = $(this).closest(".compare-row");
                        $colToMove.appendTo($parentRow);
                    });
                });
            }
        });
    };
    /* Delete Wishlist
    ----------------------------------------------------------------------------*/
    var deleteWishList = function () {
        function checkEmpty() {
            var $wishlistInner = $(".wrapper-wishlist");
            var productCount = $(".wrapper-wishlist .card_product--V01").length;
            var $sRecenty = $(".s-recently");

            if (productCount <= 12) {
                $(".wrapper-wishlist .wd-full,.wrapper-wishlist .loadItem").hide();
            } else {
                $(".wrapper-wishlist .wd-full,.wrapper-wishlist .loadItem").show();
            }

            if (productCount === 0) {
                $wishlistInner.append(`
          <div class="tf-wishlist-empty text-center">
            <p class="text-notice h6">NO PRODUCTS WERE ADDED TO THE WISHLIST.</p>
            <a href="/shop" class="tf-btn animate-btn btn-fill btn-back-shop">BACK TO SHOPPING</a>
          </div>
        `);
                $sRecenty.removeClass("d-none");
            } else {
                $wishlistInner.find(".tf-compare-empty").remove();
            }
        }

        $(".remove").on("click", function (e) {
            e.preventDefault();
            var $this = $(this);
            $this.closest(".card_product--V01").remove();
            checkEmpty();
        });

        checkEmpty();
    };
    /* Preloader
    -------------------------------------------------------------------------*/
    var preloader = function () {
        $("#preload").fadeOut("slow", function () {
            $(this).remove();
        });
    };
    /* Preloader
    -------------------------------------------------------------------------*/
    var handleRate = function () {
        let selectedRating = 0;

        function paintStars(rating) {
            $(".handle-rating .star").each(function (index) {
                if (index < rating) {
                    $(this).css("color", "#1F1F1F");
                } else {
                    $(this).css("color", "#D2D2D2");
                }
            });
        }

        $(".handle-rating .star").hover(
            function () {
                let hoverRating = $(this).data("value");
                paintStars(hoverRating);
            },
            function () {
                paintStars(selectedRating);
            }
        );

        $(".star").click(function () {
            selectedRating = $(this).data("value");
            paintStars(selectedRating);
        });
    };
    /* Update Layout Title Vertical
    -------------------------------------------------------------------------*/
    var updateWid = function () {
        function updatePadding() {
            var titleWidth = $(".title-left").outerWidth();
            var windowWidth = $(window).width();
            var paddingRight;

            if (windowWidth >= 1200) {
                paddingRight = titleWidth;
            } else {
                paddingRight = titleWidth;
            }

            $(".slide_wrap .wrap").css("padding-right", paddingRight + "px");
        }

        updatePadding();
        $(window).on("resize", updatePadding);
    };
    /* Check Box Transfer Checkout Page
    -------------------------------------------------------------------------*/
    var checkOut = function () {
        $("#checkout-btn").on("click", function () {
            if ($("#agree-term").is(":checked")) {
                window.location.href = "checkout.html";
            } else {
                alert("Please agree to the Terms and Conditions before continuing.");
            }
        });
    };

    /* Handle Result Form
    -------------------------------------------------------------------------*/
    var handleResultIP = function () {
        $(".form-feedback button").on("click", function (e) {
            e.preventDefault();

            $(".form-feedback .feedback-message").remove();

            var country = $(".form-feedback #name").val().trim();
            var state = $(".form-feedback #email").val().trim();
            var zipcode = $(".form-feedback #desc").val().trim();

            if (country === "" || state === "" || zipcode === "") {
                $(".form-feedback").append(
                    '<div class="feedback-message text-sm error">Please enter all required feedback</div>'
                );
            } else {
                $(".form-feedback").append(
                    '<div class="feedback-message text-sm success">Feedback applied successfully!</div>'
                );
            }

            $(".form-feedback .feedback-message").hide().fadeIn(300);
        });

        $(".form-action button").on("click", function (e) {
            e.preventDefault();

            var country = $(".form-action #name").val().trim();
            var state = $(".form-action #email").val().trim();
            var zipcode = $(".form-action #desc").val().trim();

            var $messageBox = $(".form-action .form_message");
            $messageBox.hide().removeClass("success error");

            if (country === "" || state === "" || zipcode === "") {
                $messageBox.text("Please enter all required review").addClass("error").fadeIn(300);
            } else {
                $messageBox.text("Review applied successfully!").addClass("success").fadeIn(300);
            }
        });
        $(".form-ask button").on("click", function (e) {
            e.preventDefault();

            var country = $(".form-ask #name").val().trim();
            var email = $(".form-ask #email").val().trim();
            var phone = $(".form-ask #phone").val().trim();
            var desc = $(".form-ask #desc").val().trim();

            var $messageBox = $(".form-ask .form_message");
            $messageBox.hide().removeClass("success error");

            if (country === "" || email === "" || desc === "" || phone === "") {
                $messageBox.text("Please enter all required!").addClass("error").fadeIn(300);
            } else {
                $messageBox.text("Question applied successfully!").addClass("success").fadeIn(300);
            }
        });
        $(".form-contact button").on("click", function (e) {
            e.preventDefault();

            var country = $(".form-contact #name").val().trim();
            var email = $(".form-contact #email").val().trim();
            var desc = $(".form-contact #desc").val().trim();

            var $messageBox = $(".form-contact .form_message");
            $messageBox.hide().removeClass("success error");

            if (country === "" || email === "" || desc === "") {
                $messageBox.text("Please enter all required!").addClass("error").fadeIn(300);
            } else {
                $messageBox.text("Applied successfully!").addClass("success").fadeIn(300);
            }
        });
    };
    /* Delete Count Number 
    -------------------------------------------------------------------------*/
    var delCountText = function () {
        function updateCountText() {
            var count = $("#updateCountMain .count_item").length;
            $("#updateCountMain .count_text").text(count);
        }
        $("#updateCountMain .count_del").on("click", function (e) {
            e.preventDefault();
            var $this = $(this);
            $this.closest(".count_item").remove();
            updateCountText();
        });
    };

    /* Subscribe Form 
    -------------------------------------------------------------------------*/
    var ajaxSubscribe = {
        obj: {
            subscribeEmail: $("#subscribe-email"),
            subscribeButton: $("#subscribe-button"),
            subscribeMsg: $("#subscribe-msg"),
            subscribeContent: $("#subscribe-content"),
            dataMailchimp: $("#subscribe-form").attr("data-mailchimp"),
            success_message:
                '<div class="notification_ok">Thank you for joining our mailing list! Please check your email for a confirmation link.</div>',
            failure_message:
                '<div class="notification_error">Error! <strong>There was a problem processing your submission.</strong></div>',
            noticeError: '<div class="notification_error">{msg}</div>',
            noticeInfo: '<div class="notification_error">{msg}</div>',
            basicAction: "mail/subscribe.php",
            mailChimpAction: "mail/subscribe-mailchimp.php",
        },

        eventLoad: function () {
            var objUse = ajaxSubscribe.obj;

            $(objUse.subscribeButton).on("click", function () {
                if (window.ajaxCalling) return;
                var isMailchimp = objUse.dataMailchimp === "true";

                if (isMailchimp) {
                    ajaxSubscribe.ajaxCall(objUse.mailChimpAction);
                } else {
                    ajaxSubscribe.ajaxCall(objUse.basicAction);
                }
            });
        },

        ajaxCall: function (action) {
            window.ajaxCalling = true;
            var objUse = ajaxSubscribe.obj;
            var messageDiv = objUse.subscribeMsg.html("").hide();
            $.ajax({
                url: action,
                type: "POST",
                dataType: "json",
                data: {
                    subscribeEmail: objUse.subscribeEmail.val(),
                },
                success: function (responseData, textStatus, jqXHR) {
                    if (responseData.status) {
                        objUse.subscribeContent.fadeOut(500, function () {
                            messageDiv.html(objUse.success_message).fadeIn(500);
                        });
                    } else {
                        switch (responseData.msg) {
                            case "email-required":
                                messageDiv.html(
                                    objUse.noticeError.replace("{msg}", "Error! <strong>Email is required.</strong>")
                                );
                                break;
                            case "email-err":
                                messageDiv.html(
                                    objUse.noticeError.replace("{msg}", "Error! <strong>Email invalid.</strong>")
                                );
                                break;
                            case "duplicate":
                                messageDiv.html(
                                    objUse.noticeError.replace("{msg}", "Error! <strong>Email is duplicate.</strong>")
                                );
                                break;
                            case "filewrite":
                                messageDiv.html(
                                    objUse.noticeInfo.replace(
                                        "{msg}",
                                        "Error! <strong>Mail list file is open.</strong>"
                                    )
                                );
                                break;
                            case "undefined":
                                messageDiv.html(
                                    objUse.noticeInfo.replace("{msg}", "Error! <strong>undefined error.</strong>")
                                );
                                break;
                            case "api-error":
                                objUse.subscribeContent.fadeOut(500, function () {
                                    messageDiv.html(objUse.failure_message);
                                });
                        }
                        messageDiv.fadeIn(500);
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    alert("Connection error");
                },
                complete: function (data) {
                    window.ajaxCalling = false;
                },
            });
        },
    };

    /* Show Password 
    -------------------------------------------------------------------------*/
    var showPassword = function () {
        $(".toggle-pass").on("click", function () {
            const wrapper = $(this).closest(".password-wrapper");
            const input = wrapper.find(".password-field");
            const icon = $(this);

            if (input.attr("type") === "password") {
                input.attr("type", "text");
                icon.removeClass("icon-show-password").addClass("icon-view");
            } else {
                input.attr("type", "password");
                icon.removeClass("icon-view").addClass("icon-show-password");
            }
        });
    };
    /* Bottom Sticky
  --------------------------------------------------------------------------------------*/
    var scrollBottomSticky = function () {
        $(window).on("scroll", function () {
            var scrollPosition = $(this).scrollTop();
            var myElement = $(".tf-sticky-btn-atc");
            var footerOffset = $(".tf-footer").offset().top;
            var windowHeight = $(window).height();

            if (scrollPosition >= 500 && scrollPosition + windowHeight < footerOffset) {
                myElement.addClass("show");
            } else {
                myElement.removeClass("show");
            }
        });
    };

    // Dom Ready
    $(function () {
        dropdownSelect();
        btnQuantity();
        deleteFile();
        deleteWishList();
        goTop();
        variantPicker();
        changeValue();
        heightTable();
        sidebarMobile();
        checkClick();
        btnLoading();
        staggerWrap();
        clickModalSecond();
        headerSticky();
        autoPopup();
        clickControl();
        totalPriceVariant();
        scrollGridProduct();
        hoverImgCursor();
        handleProgress();
        handleFooter();
        infiniteSlide();
        videoPopup();
        updateBundleTotal();
        addWishList();
        handleSidebarFilter();
        estimateShipping();
        couponCopy();
        animeCustom();
        parallaxie();
        tableCompareRemove();
        handleRate();
        updateWid();
        checkOut();
        handleResultIP();
        delCountText();
        showPassword();
        ajaxSubscribe.eventLoad();
        scrollBottomSticky();
        preloader();
    });
})(jQuery);