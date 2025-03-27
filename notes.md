// Success example
const createCategory = async (req, res) => {
  try {
    // Your code...
    req.flash("success", "Category created successfully");
    res.redirect("/admin/categories");
  } catch (error) {
    req.flash("error", "Failed to create category");
    res.redirect("/admin/addcategory");
  }
}

// Warning example
const deleteCategory = async (req, res) => {
  try {
    // Your code...
    req.flash("success", "Category deleted successfully");
    res.redirect("/admin/categories");
  } catch (error) {
    req.flash("warning", "Category could not be deleted"); 
    res.redirect("/admin/categories");
  }
}

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0">
<meta name="description" content="POS - Bootstrap Admin Template">
<meta name="keywords" content="admin, estimates, bootstrap, business, corporate, creative, invoice, html5, responsive, Projects">
<meta name="author" content="Dreamguys - Bootstrap Admin Template">
<meta name="robots" content="noindex, nofollow">
<title>Dreams Pos admin template</title>
<link href="https://unpkg.com/cropperjs/dist/cropper.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/cropperjs"></script>
<link rel="shortcut icon" type="image/x-icon" href="/assets/img/favicon.jpg">

<link rel="stylesheet" href="/assets/css/bootstrap.min.css">

<link rel="stylesheet" href="/assets/css/animate.css">

<link rel="stylesheet" href="/assets/plugins/select2/css/select2.min.css">

<link rel="stylesheet" href="/assets/css/dataTables.bootstrap4.min.css">

<link rel="stylesheet" href="/assets/plugins/fontawesome/css/fontawesome.min.css">
<link rel="stylesheet" href="/assets/plugins/fontawesome/css/all.min.css">
 <link href="https://unpkg.com/cropperjs/dist/cropper.css" rel="stylesheet">

<link rel="stylesheet" href="/assets/css/style.css">
<style>
        #error-message {
            color: red;
            animation: flash 1s infinite;
        }

        @keyframes flash {
            0% { opacity: 1; }
            50% { opacity: 0; }
            100% { opacity: 1; }
        }
        img {
    display: block;
    max-width: 100%;
}
.main-container {
  display: none;
    width: 35vw;
    margin: auto;
    display: flex;
    justify-content: center;
    flex-direction: column;
}
.img-container {
    margin-bottom: 10px;
}
.cropped-container {
    width: 400px;
    margin: auto;
    text-align: center;
    justify-content: center;
    background-color: ghostwhite;
    padding: 20px 20px;
    display: none;
    margin-top: 10px;
}
#btn-crop {
    appearance: none;
    background-color: #000000;
    border: 2px solid #1A1A1A;
    border-radius: 15px;
    box-sizing: border-box;
    color: #FFFFFF;
    cursor: pointer;
    display: inline-block;
    font-family: Roobert,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
    font-size: 16px;
    font-weight: 600;
    line-height: normal;
    min-width: 0;
    margin-left: auto;
    margin-right: auto;
    outline: none;
    padding: 10px 12px;
    text-align: center;
    text-decoration: none;
    transition: all 300ms cubic-bezier(.23, 1, 0.32, 1);
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
    width: 100px;
    will-change: transform;
    display: none;
}
#btn-crop:disabled {
    pointer-events: none;
}

#btn-crop:hover {
    box-shadow: rgba(0, 0, 0, 0.25) 0 8px 15px;
    transform: translateY(-2px);
}
#btn-crop:active {
    box-shadow: none;
    transform: translateY(0);
}
#output {
    margin: 0 5px;
    display: block;
    max-width: 100%;
}
    </style>
</head>
<body>
<div id="global-loader">
<div class="whirly-loader"> </div>
</div>

<div class="main-wrapper">

<div class="header">

<div class="header-left active">
<a href="index.html" class="logo">
<img src="/assets/img/logo.png" alt="">
</a>
<a href="index.html" class="logo-small">
<img src="/assets/img/logo-small.png" alt="">
</a>
<a id="toggle_btn" href="javascript:void(0);">
</a>
</div>

<a id="mobile_btn" class="mobile_btn" href="#sidebar">
<span class="bar-icon">
<span></span>
<span></span>
<span></span>
</span>
</a>

<ul class="nav user-menu">

<li class="nav-item">
<div class="top-nav-search">
<a href="javascript:void(0);" class="responsive-search">
<i class="fa fa-search"></i>
</a>
<form action="#">
<div class="searchinputs">
<input type="text" placeholder="Search Here ...">
<div class="search-addon">
<span><img src="/assets/img/icons/closes.svg" alt="img"></span>
</div>
</div>
<a class="btn" id="searchdiv"><img src="/assets/img/icons/search.svg" alt="img"></a>
</form>
</div>
</li>


<li class="nav-item dropdown has-arrow flag-nav">
<a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="javascript:void(0);" role="button">
<img src="/assets/img/flags/us1.png" alt="" height="20">
</a>
<div class="dropdown-menu dropdown-menu-right">
<a href="javascript:void(0);" class="dropdown-item">
<img src="/assets/img/flags/us.png" alt="" height="16"> English
</a>
<a href="javascript:void(0);" class="dropdown-item">
<img src="/assets/img/flags/fr.png" alt="" height="16"> French
</a>
<a href="javascript:void(0);" class="dropdown-item">
<img src="/assets/img/flags/es.png" alt="" height="16"> Spanish
</a>
<a href="javascript:void(0);" class="dropdown-item">
<img src="/assets/img/flags/de.png" alt="" height="16"> German
</a>
</div>
</li>


<li class="nav-item dropdown">
<a href="javascript:void(0);" class="dropdown-toggle nav-link" data-bs-toggle="dropdown">
<img src="/assets/img/icons/notification-bing.svg" alt="img"> <span class="badge rounded-pill">4</span>
</a>
<div class="dropdown-menu notifications">
<div class="topnav-dropdown-header">
<span class="notification-title">Notifications</span>
<a href="javascript:void(0)" class="clear-noti"> Clear All </a>
</div>
<div class="noti-content">
<ul class="notification-list">
<li class="notification-message">
<a href="activities.html">
<div class="media d-flex">
<span class="avatar flex-shrink-0">
<img alt="" src="/assets/img/profiles/avatar-02.jpg">
</span>
<div class="media-body flex-grow-1">
<p class="noti-details"><span class="noti-title">John Doe</span> added new task <span class="noti-title">Patient appointment booking</span></p>
<p class="noti-time"><span class="notification-time">4 mins ago</span></p>
</div>
</div>
</a>
</li>
<li class="notification-message">
<a href="activities.html">
<div class="media d-flex">
<span class="avatar flex-shrink-0">
<img alt="" src="/assets/img/profiles/avatar-03.jpg">
</span>
<div class="media-body flex-grow-1">
<p class="noti-details"><span class="noti-title">Tarah Shropshire</span> changed the task name <span class="noti-title">Appointment booking with payment gateway</span></p>
<p class="noti-time"><span class="notification-time">6 mins ago</span></p>
</div>
</div>
</a>
</li>
<li class="notification-message">
<a href="activities.html">
<div class="media d-flex">
<span class="avatar flex-shrink-0">
<img alt="" src="/assets/img/profiles/avatar-06.jpg">
</span>
<div class="media-body flex-grow-1">
<p class="noti-details"><span class="noti-title">Misty Tison</span> added <span class="noti-title">Domenic Houston</span> and <span class="noti-title">Claire Mapes</span> to project <span class="noti-title">Doctor available module</span></p>
<p class="noti-time"><span class="notification-time">8 mins ago</span></p>
</div>
</div>
</a>
</li>
<li class="notification-message">
<a href="activities.html">
<div class="media d-flex">
<span class="avatar flex-shrink-0">
<img alt="" src="/assets/img/profiles/avatar-17.jpg">
</span>
<div class="media-body flex-grow-1">
<p class="noti-details"><span class="noti-title">Rolland Webber</span> completed task <span class="noti-title">Patient and Doctor video conferencing</span></p>
<p class="noti-time"><span class="notification-time">12 mins ago</span></p>
</div>
</div>
</a>
</li>
<li class="notification-message">
<a href="activities.html">
<div class="media d-flex">
<span class="avatar flex-shrink-0">
<img alt="" src="/assets/img/profiles/avatar-13.jpg">
</span>
<div class="media-body flex-grow-1">
<p class="noti-details"><span class="noti-title">Bernardo Galaviz</span> added new task <span class="noti-title">Private chat module</span></p>
<p class="noti-time"><span class="notification-time">2 days ago</span></p>
</div>
</div>
</a>
</li>
</ul>
</div>
<div class="topnav-dropdown-footer">
<a href="activities.html">View all Notifications</a>
</div>
</div>
</li>

<li class="nav-item dropdown has-arrow main-drop">
<a href="javascript:void(0);" class="dropdown-toggle nav-link userset" data-bs-toggle="dropdown">
<span class="user-img"><img src="/assets/img/profiles/avator1.jpg" alt="">
<span class="status online"></span></span>
</a>
<div class="dropdown-menu menu-drop-user">
<div class="profilename">
<div class="profileset">
<span class="user-img"><img src="/assets/img/profiles/avator1.jpg" alt="">
<span class="status online"></span></span>
<div class="profilesets">
<h6>John Doe</h6>
<h5>Admin</h5>
</div>
</div>
<hr class="m-0">
<a class="dropdown-item" href="profile.html"> <i class="me-2" data-feather="user"></i> My Profile</a>
<a class="dropdown-item" href="generalsettings.html"><i class="me-2" data-feather="settings"></i>Settings</a>
<hr class="m-0">
<a class="dropdown-item logout pb-0" href="signin.html"><img src="/assets/img/icons/log-out.svg" class="me-2" alt="img">Logout</a>
</div>
</div>
</li>
</ul>


<div class="dropdown mobile-user-menu">
<a href="javascript:void(0);" class="nav-link dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i class="fa fa-ellipsis-v"></i></a>
<div class="dropdown-menu dropdown-menu-right">
<a class="dropdown-item" href="profile.html">My Profile</a>
<a class="dropdown-item" href="generalsettings.html">Settings</a>
<a class="dropdown-item" href="signin.html">Logout</a>
</div>
</div>

</div>

<div class="sidebar" id="sidebar">
<div class="sidebar-inner slimscroll">
<div id="sidebar-menu" class="sidebar-menu">
<ul>
<li class="active">
<a href="home"><img src="/assets/img/icons/dashboard.svg" alt="img"><span> Dashboard</span> </a>
</li>
<li class="submenu">
<a href="javascript:void(0);"><img src="/assets/img/icons/product.svg" alt="img"><span> Product</span> <span class="menu-arrow"></span></a>
<ul>
<li><a href="products ">Product List</a></li>
<li><a href="addproduct">Add Product</a></li>
<li><a href="categories">Category List</a></li>
<li><a href="addcategory">Add Category</a></li>

<li><a href="brands">Brand List</a></li>
<li><a href="addbrand">Add Brand</a></li>

</ul>
</li>


<li class="submenu">
<a href="javascript:void(0);"><img src="/assets/img/icons/users1.svg" alt="img"><span> Users</span> <span class="menu-arrow"></span></a>
<ul>
<!-- <li><a href="newuser">New User </a></li> -->
<li><a href="users">Users List</a></li>
</ul>
</li>

</ul>
</div>
</div>
</div>

<div class="page-wrapper">
<div class="content">
<div class="page-header">
<div class="page-title">
<h4>Product Edit</h4>
<h6>Update your product</h6>
</div>
</div>

<div class="card">
  <div class="card-body">
   <form id="cform" enctype="multipart/form-data">
    <div class="row">
        <div class="col-lg-12">
            <div id="error-message" style="color: red;"></div>
        </div>
        <!-- Existing form fields... -->
        <div class="col-lg-3 col-sm-6 col-12">
            <div class="form-group">
                <label>Product Name</label>
                <input type="text" name="product_name" value="<%= data[0].product.product_name %>">
            </div>
        </div>
        <div class="col-lg-3 col-sm-6 col-12">
            <div class="form-group">
                <label>Current Category</label>
                <input type="text" class="form-control" value="<%= data[0].category.category_name %>" readonly>
                <label>Category</label>
                <select class="select" name="category_name">
                    <% categories.forEach((row, index) => { %>
                        <option value="<%= row.category_name %>"><%= row.category_name %></option>
                    <% }); %>
                </select>
            </div>
        </div>
        <div class="col-lg-3 col-sm-6 col-12">
            <div class="form-group">
                <label>Current Size</label>
                <input type="text" class="form-control" value="<%= data[0].size_option.Size_name %>" readonly>
                <label>Size</label>
                <select class="select" id="sizeSelect" name="size">
                    <option value="">Choose Size</option>
                    <% sizeOptions.forEach((row, index) => { %>
                        <option value="<%= row.Size_name %>"><%= row.Size_name %></option>
                    <% }); %>
                </select>
                <input type="hidden" id="finalSize" name="finalSize" value="<%= data[0].size_option.Size_name %>">
            </div>
        </div>
        <div class="col-lg-3 col-sm-6 col-12">
            <div class="form-group">
                <label>Current Colour</label>
                <input type="text" class="form-control" value="<%= data[0].colour.Colour_name %>" readonly>
                <label>Colour</label>
                <select class="select" id="colourSelect" name="Colour_name">
                    <option value="">Choose Colour</option>
                    <% colourOptions.forEach((row, index) => { %>
                        <option value="<%= row.Colour_name %>"><%= row.Colour_name %></option>
                    <% }); %>
                </select>
                <input type="hidden" id="finalColour" name="finalColour" value="<%= data[0].colour.Colour_name %>">
            </div>
        </div>
        <div class="col-lg-3 col-sm-6 col-12">
            <div class="form-group">
                <label>SKU</label>
                <input type="text" name="SKU" value="<%= data[0].product_item.Product_sku %>">
            </div>
        </div>
        <div class="col-lg-3 col-sm-6 col-12">
            <div class="form-group">
                <label>Quantity</label>
                <input type="text" name="Qty_in_stock" value="<%= data[0].product_variation.Qty_in_stock %>">
            </div>
        </div>
        <div class="col-lg-12">
            <div class="form-group">
                <label>Description</label>
                <textarea class="form-control" name="product_description" id="productDescription"><%= data[0].product.product_description %></textarea>
            </div>
        </div>
        <div class="col-lg-3 col-sm-6 col-12">
            <div class="form-group">
                <label>Price</label>
                <input type="text" name="price" value="<%= data[0].product_item.Original_price %>">
            </div>
        </div>
        
        <div class="col-lg-12">
  <div class="form-group">
    <label> Product Images</label>
    <div class="main-container">
    <div class="img-container">
        <img id="image" src=""> <!-- Initial image or placeholder -->
    </div>
    <div class="cropped-container">
        <img src="" id="output"> <!-- Display cropped image here -->
    </div>
    <button id="btn-crop" type="button">Crop</button><!-- Button for cropping -->
</div>

   <div class="image-upload">
    <input type="file" id="product_image_input" onchange="displayThumbnails(event)" name="product_images" multiple>
    <div class="image-uploads">
        <img id="thumbnail" src="../assets/img/icons/upload.svg" alt="img">
        <h4>Drag and drop files to upload</h4>
    </div>
</div>
  </div>
</div>


<!-- GET IT -->
<div class="col-12" id="productListSection" style="display: visible;">
  <div class="product-list">
    <ul class="row" id="imageList">
              <!-- Existing images will be appended here -->
          <% data[0].Image_filename.forEach(image => { %>
            <li>
              <div class="productviews">
                <div class="productviewsimg">
                  <img src="<%= image %>" alt="img">
                </div>
                <div class="productviewscontent">
                  <div class="productviewsname"></div>
                <a href="javascript:void(0);" class="hideset" onclick="removeImage(this, '<%= image %>')">x</a>
                </div>
              </div>
            </li>
          <% }); %>
            </ul>
  </div>
</div>
<div class="col-12 justify-content-center pb-4 mx-auto">
<h6 id="error-message" class="text-center"></h6>
</div>
<div class="col-lg-12">
        <div class="col-lg-12">
            <input type="hidden" name="id" value="<%= data[0]._id %>">
            <button type="submit" class="btn btn-submit me-2">Update</button>
            <a href="/admin/products" class="btn btn-cancel">Cancel</a>
        </div>
    </div>
</form>

  </div>
</div>







<script src="/assets/js/jquery-3.6.0.min.js"></script>

<script src="/assets/js/feather.min.js"></script>

<script src="/assets/js/jquery.slimscroll.min.js"></script>

<script src="/assets/js/jquery.dataTables.min.js"></script>
<script src="/assets/js/dataTables.bootstrap4.min.js"></script>

<script src="/assets/js/bootstrap.bundle.min.js"></script>

<script src="/assets/plugins/select2/js/select2.min.js"></script>

<script src="/assets/plugins/sweetalert/sweetalert2.all.min.js"></script>
<script src="/assets/plugins/sweetalert/sweetalerts.min.js"></script>

<script src="/assets/js/script.js"></script>


<script>
      let croppedLength = 0
       let initialImageCount = <%= data[0].Image_filename.length %>;
     // Function to check the number of images
        function checkImageCount() {
        //    const imageCount = productImageContainer.find('li').length; // Get the number of <li> elements
            const imageCount =croppedLength+ initialImageCount; // Get the number of <li> elements
                console.log(croppedLength);
                console.log("Initial image count:",initialImageCount);
            if (imageCount < 3 || imageCount > 5) {
                document.getElementById('error-message').textContent = 'Please upload a minimum of 3 images and a maximum of 5 images.';
                return false;
            } else {
                document.getElementById('error-message').textContent = '';
               
                return true;
            }
        } 
          

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

</body>
</html>