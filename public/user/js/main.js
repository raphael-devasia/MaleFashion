/*  ---------------------------------------------------
    Template Name: Male Fashion
    Description: Male Fashion - ecommerce teplate
    Author: Colorib
    Author URI: https://www.colorib.com/
    Version: 1.0
    Created: Colorib
---------------------------------------------------------  */

'use strict';

(function ($) {

    /*------------------
        Preloader
    --------------------*/
    $(window).on('load', function () {
        $(".loader").fadeOut();
        $("#preloder").delay(200).fadeOut("slow");

        /*------------------
            Gallery filter
        --------------------*/
        $('.filter__controls li').on('click', function () {
            $('.filter__controls li').removeClass('active');
            $(this).addClass('active');
        });
        if ($('.product__filter').length > 0) {
            var containerEl = document.querySelector('.product__filter');
            var mixer = mixitup(containerEl);
        }
    });

    /*------------------
        Background Set
    --------------------*/
    $('.set-bg').each(function () {
        var bg = $(this).data('setbg');
        $(this).css('background-image', 'url(' + bg + ')');
    });

    //Search Switch
    $('.search-switch').on('click', function () {
        $('.search-model').fadeIn(400);
    });

    $('.search-close-switch').on('click', function () {
        $('.search-model').fadeOut(400, function () {
            $('#search-input').val('');
        });
    });

    /*------------------
		Navigation
	--------------------*/
    $(".mobile-menu").slicknav({
        prependTo: '#mobile-menu-wrap',
        allowParentLinks: true
    });

    /*------------------
        Accordin Active
    --------------------*/
    $('.collapse').on('shown.bs.collapse', function () {
        $(this).prev().addClass('active');
    });

    $('.collapse').on('hidden.bs.collapse', function () {
        $(this).prev().removeClass('active');
    });

    //Canvas Menu
    $(".canvas__open").on('click', function () {
        $(".offcanvas-menu-wrapper").addClass("active");
        $(".offcanvas-menu-overlay").addClass("active");
    });

    $(".offcanvas-menu-overlay").on('click', function () {
        $(".offcanvas-menu-wrapper").removeClass("active");
        $(".offcanvas-menu-overlay").removeClass("active");
    });

    /*-----------------------
        Hero Slider
    ------------------------*/
    $(".hero__slider").owlCarousel({
        loop: true,
        margin: 0,
        items: 1,
        dots: false,
        nav: true,
        navText: ["<span class='arrow_left'><span/>", "<span class='arrow_right'><span/>"],
        animateOut: 'fadeOut',
        animateIn: 'fadeIn',
        smartSpeed: 1200,
        autoHeight: false,
        autoplay: false
    });

    /*--------------------------
        Select
    ----------------------------*/
    $("select").niceSelect();

    /*-------------------
		Radio Btn
	--------------------- */
    $(".product__color__select label, .shop__sidebar__size label, .product__details__option__size label").on('click', function () {
        $(".product__color__select label, .shop__sidebar__size label, .product__details__option__size label").removeClass('active');
        $(this).addClass('active');
    });

    /*-------------------
		Scroll
	--------------------- */
    $(".nice-scroll").niceScroll({
        cursorcolor: "#0d0d0d",
        cursorwidth: "5px",
        background: "#e5e5e5",
        cursorborder: "",
        autohidemode: true,
        horizrailenabled: false
    });

    /*------------------
        CountDown
    --------------------*/
    // For demo preview start
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    if(mm == 12) {
        mm = '01';
        yyyy = yyyy + 1;
    } else {
        mm = parseInt(mm) + 1;
        mm = String(mm).padStart(2, '0');
    }
    var timerdate = mm + '/' + dd + '/' + yyyy;
    // For demo preview end


    // Uncomment below and use your date //

    /* var timerdate = "2020/12/30" */

    $("#countdown").countdown(timerdate, function (event) {
        $(this).html(event.strftime("<div class='cd-item'><span>%D</span> <p>Days</p> </div>" + "<div class='cd-item'><span>%H</span> <p>Hours</p> </div>" + "<div class='cd-item'><span>%M</span> <p>Minutes</p> </div>" + "<div class='cd-item'><span>%S</span> <p>Seconds</p> </div>"));
    });

    /*------------------
		Magnific
	--------------------*/
    $('.video-popup').magnificPopup({
        type: 'iframe'
    });

    /*-------------------
		Quantity change
	--------------------- */
   


$(document).ready(function () {
    var proQty = $(".pro-qty")

    // Add increment and decrement buttons
    proQty.prepend('<span class="fa fa-angle-up inc qtybtn"></span>')
    proQty.append('<span class="fa fa-angle-down dec qtybtn"></span>')

    // Event handler for quantity buttons
    proQty.on("click", ".qtybtn", function () {
        var $button = $(this)
        var $input = $button.parent().find("input")
        var oldValue = parseFloat($input.val())
        var maxQty = parseFloat($input.attr("max"))
        var price = parseFloat(
            $button.closest("tr").find(".cart__price").data("price")
        )
        var itemOfferDiscount =
            parseFloat(
                $button
                    .closest("tr")
                    .find(".cart__price")
                    .data("offer-discount")
            ) || 0
        var newVal

        // Handle increment and decrement functionality
        if ($button.hasClass("inc")) {
            newVal = oldValue + 1
            if (newVal > maxQty) {
                newVal = maxQty
            }
        } else {
            newVal = oldValue > 1 ? oldValue - 1 : 1
        }

        $input.val(newVal)

        // Update the total for the current item
        var $totalCell = $button.closest("tr").find(".cart__price")
        var newTotal = price * newVal
        $totalCell.text("$" + newTotal.toFixed(2))

        // Update the cart totals
        updateCartTotals()

        // Update the server with the new quantity
        updateCart($input.data("product-id"), newVal)
    })

    // Check if the quantity buttons should be enabled or disabled based on availability
    $(".product__details__cart__option").each(function () {
        var $input = $(this).find("input")
        if ($input.prop("disabled")) {
            $(this).find(".qtybtn").prop("disabled", true)
        } else {
            $(this).find(".qtybtn").prop("disabled", false)
        }
    })

    function updateCartTotals() {
        var subtotal = 0
        var discount =
            parseFloat($("#coupon-discount").text().replace("$", "")) || 0
        var offerDiscount = 0

        $(".cart__price").each(function () {
            var itemTotal = parseFloat($(this).text().replace("$", ""))
            subtotal += itemTotal

            // Calculate offer discount for each item
            var quantity = parseFloat(
                $(this).closest("tr").find('input[name="quantity-input"]').val()
            )
            var itemOfferDiscount =
                parseFloat($(this).data("offer-discount")) || 0
            offerDiscount += (itemOfferDiscount / 100) * itemTotal
        })

        console.log("subtotal:", subtotal)
        console.log("discount:", discount)
        console.log("offerDiscount:", offerDiscount)

        var newTotal = subtotal - discount - offerDiscount

        $("#sub-total").text("$" + subtotal.toFixed(2))
        $("#total-amount").text("$" + newTotal.toFixed(2))
        $("#offer-discount").text("$" + offerDiscount.toFixed(2))
    }

    function updateCart(productId, quantity) {
        const updatedCart = [{ id: productId, quantity: quantity }]

        // Send the data to the server using fetch API
        fetch("/updateCart", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedCart),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data)
                // Optionally handle server response if needed
                // Update the totals from server response
                $("#total-amount").text("$" + data.newTotalAmount.toFixed(2))
                $("#coupon-discount").text("$" + data.discountAmount.toFixed(2))
                $("#offer-discount").text(
                    "$" + data.totalOfferDiscount.toFixed(2)
                )
                $("#sub-total").text("$" + data.totalCartAmount.toFixed(2))
            })
            .catch((error) => {
                console.error("Error:", error)
                // Handle error, e.g., display an error message
            })
    }
})



    /*------------------
        Achieve Counter
    --------------------*/
    $('.cn_num').each(function () {
        $(this).prop('Counter', 0).animate({
            Counter: $(this).text()
        }, {
            duration: 4000,
            easing: 'swing',
            step: function (now) {
                $(this).text(Math.ceil(now));
            }
        });
    });

})(jQuery);

 function addToCart(productId,variationId) {
     // Get the selected quantity
     console.log(productId, variationId)
     const quantity = document.getElementById("quantity-input").value

     // Create the URL with product ID and quantity as query parameters
     const url = `/addtocart?product_id=${encodeURIComponent(
         productId
     )}&quantity=${encodeURIComponent(
         quantity
     )}&product_image=${encodeURIComponent(variationId)}`

     // Make an AJAX request
     $.ajax({
         type: "GET",
         url: url,
         success: function (response) {
             // Handle success response here (if needed)
             console.log(
                 "Product added to cart successfully!",
                 response.cartLength
             )
             $("#cart-count").text(response.cartLength)
             // Optionally, you can redirect the user to the cart page or update UI
             // window.location.href = '/cart'; // Example redirect to cart page
         },
         error: function (xhr, status, error) {
            const response = JSON.parse(xhr.responseText)
            const errorMessage = response.error
            document.getElementById("stockError").textContent = errorMessage
             console.error("Error adding product to cart:", error)
         },
     })
 }

//  function deleteCart(productId,ProductImg,Qty) {
//      // Get the selected quantity
     

//      // Create the URL with product ID and quantity as query parameters
//      const url = `/deleteproduct?product_id=${encodeURIComponent(
//          productId
//      )}&Product_Img=${encodeURIComponent(
//          ProductImg
//      )}&Qty=${encodeURIComponent(Qty)}`

//      // Make an AJAX request
//      $.ajax({
//          type: "GET",
//          url: url,
//          success: function (response) {
//              // Handle success response here (if needed)
//              console.log(
//                  "Product deleted from cart successfully!",
                
//              )
//               $(`#product-${productId}`).remove()
//              const newTotal = response.totalCartAmount
//              console.log("newTotal", newTotal)
//              $(".cart__total ul li:nth-child(1) span").text(`$${newTotal}`)
//              $(".cart__total ul li:nth-child(2) span").text(`$${newTotal}`)
//          },
//          error: function (xhr, status, error) {
//              // Handle error here (if needed)
//              console.error("Error adding product to cart:", error)
//          },
//      })
//  }
// function deleteCart(productId, ProductImg, Qty) {
//     // Create the URL with product ID, Product Image, and Quantity as query parameters
//     const url = `/deleteproduct?product_id=${encodeURIComponent(
//         productId
//     )}&Product_Img=${encodeURIComponent(ProductImg)}&Qty=${encodeURIComponent(
//         Qty
//     )}`

//     // Make an AJAX request to delete the product from the cart
//     $.ajax({
//         type: "GET",
//         url: url,
//         success: function (response) {
//             // Handle success response here
//             console.log("Product deleted from cart successfully!")

//             // Find and remove the product row from the cart
//             const $productRow = $(`#product-${productId}`)
//             const productPrice = parseFloat(
//                 $productRow.find(".cart__price").data("price")
//             )
//             const productQty = parseFloat(Qty)
//             const productTotal = productPrice * productQty

//             // Remove the product row from the DOM
//             $productRow.remove()

//             // Update the cart totals on the frontend
//             updateCartTotals(productTotal, productQty)

//             // Optionally, handle server response if needed
//             console.log("Response:", response)
//         },
//         error: function (xhr, status, error) {
//             // Handle error here
//             console.error("Error deleting product from cart:", error)
//         },
//     })
// }

     function deleteCart(productId, productImg, qty) {
         const $productRow = $(`#product-${productId}`)
        const quantity = parseFloat(
            $productRow.find('input[name="quantity-input"]').val()
        )
         // Create the URL with product ID, Product Image, and Quantity as query parameters
         const url = `/deleteproduct?product_id=${encodeURIComponent(
             productId
         )}&Product_Img=${encodeURIComponent(
             productImg
         )}&Qty=${encodeURIComponent(qty)}`

         // Make an AJAX request to delete the product from the cart
         $.ajax({
             type: "GET",
             url: url,
             success: function (response) {
                 // Handle success response here
                 console.log("Product deleted from cart successfully!")

                 // Find the product row and the delete button
                 const $productRow = $(`#product-${productId}`)
                 const $deleteButton = $productRow.find(
                     'button[onclick*="deleteCart"]'
                 )

                 // Retrieve the price and offer discount from the button's data attributes
                 const productPrice = parseFloat(
                     $deleteButton.attr("delete-price")
                 )
                 const productOfferDiscount = parseFloat(
                     $deleteButton.attr("delete-offer-discount")
                 )
                  
                 const productQty = parseFloat(quantity)
                 const productTotal = productPrice * productQty
                 const totalProductOfferDiscount =
                     (productOfferDiscount / 100) * productTotal
console.log("productQty", quantity)
console.log("productTotal", productTotal)
console.log("totalProductOfferDiscount", totalProductOfferDiscount)
                 // Remove the product row from the DOM
                 $productRow.remove()

                 // Update the cart totals on the frontend
                 updateCartTotals(productTotal, totalProductOfferDiscount)

                 // Optionally, handle server response if needed
                 console.log("Response:", response)
             },
             error: function (xhr, status, error) {
                 // Handle error here
                 console.error("Error deleting product from cart:", error)
             },
         })
     }

     function updateCartTotals(productTotal, totalProductOfferDiscount) {
         const $subtotal = $("#sub-total")
         const $totalAmount = $("#total-amount")
         const $offerDiscount = $("#offer-discount")
         const $couponDiscount = $("#coupon-discount")

         const subtotal = parseFloat($subtotal.text().replace("$", "")) || 0
         const totalAmount =
             parseFloat($totalAmount.text().replace("$", "")) || 0
         const offerDiscount =
             parseFloat($offerDiscount.text().replace("$", "")) || 0
         const couponDiscount =
             parseFloat($couponDiscount.text().replace("$", "")) || 0

         const newSubtotal = subtotal - productTotal
         const newOfferDiscount = offerDiscount - totalProductOfferDiscount
         const newTotalAmount = newSubtotal - newOfferDiscount - couponDiscount

         $subtotal.text(`$${newSubtotal.toFixed(2)}`)
         $totalAmount.text(`$${newTotalAmount.toFixed(2)}`)
         $offerDiscount.text(`$${newOfferDiscount.toFixed(2)}`)
     }



// Assuming this function is already in place to update the coupon discount
// function updateCouponDiscount() {
//     // Logic to update the coupon discount if necessary
// }

$(document).ready(function () {
    $("#setAsShipping").on("click", function () {
        // Assuming you have the user ID stored in a variable
        var userId = "<%= user._id %>"

        $.ajax({
            url: "/user/setshipping/" + userId,
            type: "POST", // or 'GET' depending on your server's endpoint requirement
            success: function (response) {
                // Handle success response
                alert("Shipping address set successfully.")
            },
            error: function (error) {
                // Handle error response
                alert("Failed to set shipping address.")
            },
        })
    })
})



function addToWishlist(productId) {
    // Get the selected quantity
  

    // Create the URL with product ID and quantity as query parameters
    const url = `/addtowishlist?product_id=${encodeURIComponent(
        productId
    )}`

    // Make an AJAX request
    $.ajax({
        type: "GET",
        url: url,
        success: function (response) {
            // Handle success response here (if needed)
            console.log(
                "Product added to wishlist successfully!",
                response.cartLength
            )
            $("#wish-count").text(response.wishlistCount)
            // Optionally, you can redirect the user to the cart page or update UI
            // window.location.href = '/cart'; // Example redirect to cart page
        },
        error: function (xhr, status, error) {
            const response = JSON.parse(xhr.responseText)
            const errorMessage = response.error
            document.getElementById("stockError").textContent = errorMessage
            console.error("Error adding product to wishlist:", error)
        },
    })
}
 function wishTocart(productId, variationId, wishListId) {
     // Get the selected quantity
     console.log(productId, variationId, wishListId)
     const quantity = 1

     // Create the URL with product ID and quantity as query parameters
     const url = `/addtocart?product_id=${encodeURIComponent(
         variationId
     )}&quantity=${encodeURIComponent(
         quantity
     )}&product_image=${encodeURIComponent(
         productId
     )}&wishlist_id=${encodeURIComponent(wishListId)}`

     // Make an AJAX request
     $.ajax({
         type: "GET",
         url: url,
         success: function (response) {
             // Handle success response here (if needed)
             console.log(
                 "Product added to cart successfully!",
                 response.cartLength
             )
             $("#cart-count").text(response.cartLength)
             $(`#wishlist-item-${wishListId}`).remove()
             // Optionally, you can redirect the user to the cart page or update UI
             // window.location.href = '/cart'; // Example redirect to cart page
         },
         error: function (xhr, status, error) {
             const response = JSON.parse(xhr.responseText)
             const errorMessage = response.error
             console.log(errorMessage)
             document.getElementById("stockError").textContent = errorMessage
             console.error("Error adding product to cart:", error)
         },
     })
 }


  function deleteWish(productId) {
      // Get the selected quantity
      
     

      // Create the URL with product ID and quantity as query parameters
      const url = `/wishlist/remove-item?product_id=${encodeURIComponent(
          productId
      )}`

      // Make an AJAX request
      $.ajax({
          type: "GET",
          url: url,
          success: function (response) {
              // Handle success response here (if needed)
              console.log(
                  "Product added to cart successfully!",
                  response.cartLength
              )
              $("#cart-count").text(response.cartLength)
              // Optionally, you can redirect the user to the cart page or update UI
              // window.location.href = '/cart'; // Example redirect to cart page
          },
          error: function (xhr, status, error) {
              const response = JSON.parse(xhr.responseText)
              const errorMessage = response.error
              console.log(errorMessage)
              document.getElementById("stockError").textContent = errorMessage
              console.error("Error adding product to cart:", error)
          },
      })
  }
 