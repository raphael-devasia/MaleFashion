 document.addEventListener('DOMContentLoaded', () => {
                const categoryRadios = document.querySelectorAll('.category-radio');

                categoryRadios.forEach((radio) => {
                    radio.addEventListener('change', handleCategoryChange);
                });

                function handleCategoryChange() {
                    const selectedCategory = document.querySelector('input[name="category"]:checked')?.value;
                    
                    if (selectedCategory) {
                        const queryString = `key=${selectedCategory}`;
                        fetch(`/filtered-category?${queryString}`)
                            .then((response) => response.json())
                            .then((data) => {
                                const productsContainer = document.getElementById('products-container');
                                let templateHtml = '';
                                data.data.forEach((row) => {
                                    templateHtml += `
                            <div class="col-lg-4 col-md-6 col-sm-6">
                                <div class="product__item">
                                    <div class="product__item sale">
                                        <div class="product__item__pic set-bg" data-setbg="${setImageUrl(row)}">
                                            ${row.discountPercentage > 0 ? '<span class="label">Sale</span>' : ''}
                                            <ul class="product__hover">
                                                <li><a href="#"><img src="img/icon/heart.png" alt=""></a></li>
                                                <li><a href="#"><img src="img/icon/compare.png" alt=""><span>Compare</span></a></li>
                                                <li><a href="/products/${row._id}"><img src="img/icon/search.png" alt=""></a></li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div class="product__item__text">
                                        <h6>${row._id}</h6>
                                        <a href="#" class="add-cart">+ Add To Cart</a>
                                        <div class="rating">
                                            <i class="fa fa-star-o"></i>
                                            <i class="fa fa-star-o"></i>
                                            <i class="fa fa-star-o"></i>
                                            <i class="fa fa-star-o"></i>
                                            <i class="fa fa-star-o"></i>
                                        </div>
                                        ${row.discountPercentage > 0 ?
                                            `<h6><s>${row.Original_price}</s>$</h6>
                                            <h5>$${row.effectivePrice}</h5>` :
                                            `<h5>$${row.Original_price}</h5>`
                                        }
                                        <div class="product__color__select">
                                            ${row.colours.map((color, index) => `
                                                <label class="active ${color.toLowerCase()}" for="pc-${index + 4}">
                                                    <input type="radio" id="pc-${index + 4}">
                                                </label>
                                            `).join('')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                                });
                                productsContainer.innerHTML = templateHtml;
                                setBackgrounds();  // Manually set the background images after updating the DOM
                            });
                    }
                }

                function setImageUrl(row) {
                    const imgPath = row.images[0][0].startsWith('/') ? row.images[0][0].substring(1) : row.images[0][0];
                    const imgUrl = `${window.location.origin}/${imgPath}`;
                    return imgUrl;
                }

                function setBackgrounds() {
                    document.querySelectorAll('.set-bg').forEach(element => {
                        const bg = element.getAttribute('data-setbg');
                        element.style.backgroundImage = `url(${bg})`;
                    });
                }
            });




            /////////edit product 

        <script>

   // Function to remove an image from the UI and database
    function removeImage(element, imageSrc) {
        
        const productId = '<%= data[0]._id %>'; // Replace with the actual product ID

        $.ajax({
            url: '/admin/editproduct/delete-image',
            type: 'POST',
            data: {
                image: imageSrc,
                productId: productId
            },
            success: function (response) {
                if (response.success) {
                    // Remove the image from the UI
                    $(element).closest('li').remove();
                    

                    // Update the image list with the new data
                    if (response.newImageList) {
                        
                        $('#imageList').empty();
                        response.newImageList.forEach((image) => {
                            $('#imageList').append(
                                `<li>
                                    <div class="productviews">
                                        <div class="productviewsimg">
                                            <img src="${image}" alt="img">
                                        </div>
                                        <div class="productviewscontent">
                                            <div class="productviewsname"></div>
                                            <a href="javascript:void(0);" class="hideset" onclick="removeImage(this, '${image}')">x</a>
                                        </div>
                                    </div>
                                </li>`
                            );
                        });
                    }

                    // Check the number of images
                    checkImageCount();
                    console.log(initialImageCount);
                    // Show a success message
                    $('#error-message').text('Image removed successfully.');

                    // Update the initialImageCount with the new image list length
                    initialImageCount = response.newImageList.length;
                     checkImageCount();

                } else {
                    // Handle errors
                    $('#error-message').text('Failed to remove image.');
                }
            },
            error: function (xhr, status, error) {
                console.error('Error removing image:', error);
                $('#error-message').text('Error removing image.');
            }
        });
    }

// ENDS HERE IMAGE DELETION 

$(document).ready(function () {
        const productImageContainer = $('#imageList');

        const imageElement = document.getElementById('image');
        let cropper;
        let croppedImages = [];
        let croppedLength = 0
          let initialImageCount = <%= data[0].Image_filename.length %>;

        // Function to initialize existing images
        function initializeExistingImages(images) {
            images.forEach((imageSrc) => {
                addImageToList(imageSrc);
                croppedImages.push(imageSrc);
            });
             checkImageCount();
        }

        // Function to add an image to the list
        function addImageToList(imageSrc) {
            const imgElement = $('<img>').attr('src', imageSrc).addClass('uploaded-image');
            const liElement = $('<li>').addClass('ps-0').append(
                $('<div>').addClass('productviewset').append(
                    $('<div>').addClass('productviewsimg').append(imgElement),
                    $('<div>').addClass('productviewscontent').append(
                        $('<a>').attr('href', 'javascript:void(0);').addClass('hideset').html('<i class="fa fa-trash-alt"></i>').on('click', function () {
                            $(this).closest('li').remove();
                            croppedLength--
                            const index = croppedImages.indexOf(imageSrc);
                            if (index > -1) {
                                croppedImages.splice(index, 1);
                            }
                            // Check the number of images
                            checkImageCount();
                        })
                    )
                )
            );

            productImageContainer.append(liElement);
            $('#productListSection').show();
            croppedImages.push(imageSrc);
        }

        // Function to initialize the cropper
        function initializeCropper(imageSrc) {
            if (cropper) {
                cropper.destroy();
            }
            imageElement.src = imageSrc;
            cropper = new Cropper(imageElement, {
                aspectRatio: 1,
                viewMode: 1,
            });
            $('.main-container').show(); // Show the main container
            $('#btn-crop').show(); // Show the main container
        }

        // Function to display an image for cropping
        function displayImage(event) {
            const files = event.target.files;
            if (files.length > 0) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    initializeCropper(e.target.result);
                };
                reader.readAsDataURL(files[0]);
            }
        }

       

        // Event listener for file input change
    $('#product_image_input').on('change', function(event) {
            if (croppedImages.length >= 5) {
                document.getElementById('error-message').textContent = 'You can upload a maximum of 5 images.';
                return;
            }
            displayImage(event);
        });

        // Event listener for crop button click
    $('#btn-crop').on('click', function() {
            if (cropper) {
                const croppedCanvas = cropper.getCroppedCanvas({
                    width: 300,
                    height: 300,
                });
                const croppedImage = croppedCanvas.toDataURL("image/png");
                croppedImages.push(croppedImage);
                croppedLength++

                addImageToList(croppedImage);
                cropper.reset();
                $('.main-container').hide();

                // Check the number of images
                checkImageCount();
            }
        });

        // Hide the thumbnail initially
        $('#thumbnail').hide();
    $('#product_image_input').on('click', function() {
            if (!this.value) {
                $('#thumbnail').show();
            }
        });

        const validationRegex = {
            product_name: /^[a-zA-Z0-9\s\-]+$/,
            SKU: /^(?!-)(?!.*--)[a-zA-Z0-9-]+$/,
            Qty_in_stock: /^[1-9]\d*$/,
            product_description: /^.+$/s,
            price: /^(?!0(\.0{1,2})?$)\d+(\.\d{1,2})?$/
        };

        function validateForm() {
            let errorMessage = '';

            const product_name = document.querySelector('input[name="product_name"]').value.trim();
            const SKU = document.querySelector('input[name="SKU"]').value.trim();
            const Qty_in_stock = document.querySelector('input[name="Qty_in_stock"]').value.trim();
            const product_description = document.querySelector('textarea[name="product_description"]').value.trim();
            const price = document.querySelector('input[name="price"]').value.trim();

            if (!product_name || !validationRegex.product_name.test(product_name)) {
                errorMessage += 'Product Name is required and should be alphanumeric. ';
            }
            if (!SKU || !validationRegex.SKU.test(SKU)) {
                errorMessage += 'SKU is required and should be alphanumeric. ';
            }
            if (!Qty_in_stock || !validationRegex.Qty_in_stock.test(Qty_in_stock)) {
                errorMessage += 'Quantity in Stock is required and should be a numeric value. ';
            }
            if (!product_description || !validationRegex.product_description.test(product_description)) {
                errorMessage += 'Product Description is required. ';
            }
            if (!price || !validationRegex.price.test(price)) {
                errorMessage += 'Price is required and should be a valid numeric format (e.g., 10 or 10.99). ';
            }

            if (errorMessage) {
                document.getElementById('error-message').textContent = errorMessage.trim();
                return false;
            }

            // If validation passes, clear any previous error messages
            document.getElementById('error-message').textContent = '';

            // Update the hidden fields with the final selected size and color
            const sizeSelect = document.getElementById('sizeSelect');
            const finalSize = document.getElementById('finalSize');

            const colourSelect = document.getElementById('colourSelect');
            const finalColour = document.getElementById('finalColour');

            if (sizeSelect.value === "" || sizeSelect.value === "Choose Size") {
                finalSize.value = '<%= data[0].size_option.Size_name %>';
            } else {
                finalSize.value = sizeSelect.value;
            }

            if (colourSelect.value === "" || colourSelect.value === "Choose Colour") {
                finalColour.value = '<%= data[0].colour.Colour_name %>';
            } else {
                finalColour.value = colourSelect.value;
            }

            // Check the number of images before form submission
            return checkImageCount();
        }

        // Form submission handling
    document.getElementById('cform').addEventListener('submit', function(event) {
            event.preventDefault();

            if (validateForm()) {
                // const formData = new FormData(this);
               const formData = new FormData(document.getElementById('cform'));

                // Append cropped images to FormData
                croppedImages.forEach((image, index) => {
                    formData.append(`product_images[]`, image);
                      console.log(formData);
                });
                
                 fetch('/admin/editproduct', {
                    method: 'POST',
                    body: formData
                })
                    .then(response => {
                        if (response.redirected) {
                            window.location.href = response.url;
                        } else {
                            return response.json().then(data => {
                                if (data.message) {
                                    document.getElementById('error-message').textContent = data.message;
                                }
                            });
                        }
                    })
                    .catch(error => {
                        document.getElementById('error-message').textContent = 'An error occurred. Please try again.';
                    });

                // Proceed with form submission (native form submission)
                // this.submit();
            }
        });

       
    });
</script>