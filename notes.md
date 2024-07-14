<%- include('navigationbar') %>
    <!-- Header Section End -->
<link rel="stylesheet" href="css/adress-book.css" type="text/css">
    <!-- Breadcrumb Section Begin -->
    <section class="breadcrumb-option">
        <div class="container">
            <div class="row">
                <div class="col-lg-12">
                    <div class="breadcrumb__text">
                        <h4>Shop</h4>
                        <div class="breadcrumb__links">
                            <a href="./index.html">Home</a>
                            <span>User</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <!-- Breadcrumb Section End -->
    <main class="main">
        <section class="section-parent">
            <div class="profile-details">
                <div class="profile-inner">
    
                    <div class="account-management">
                        <div class="container mb-4 main-container">
                            <div class="row">
                                <div class="col-lg-4 pb-5">
                                    <!-- Account Sidebar-->
                                   <%- include('profilesidebar') %>
                                </div>
                                <!-- Orders Table-->
                                <form id="profile-form" class="edit-profile" method="POST" action="updateprofile">
                                    <div class="edit-your-profile">Edit Your Profile</div>
                                    <div class="profile-form">
                                        <div class="name-fields-parent">
                                            <div class="name-fields">
                                                <div class="name-containers">
                                                    <div class="first-name">First Name</div>
                                                    <div class="placebox-info">
                                                        <div class="place-to-info-box"></div>
                                                        <input class="md" type="text" value="<%= user.firstName %>" name="firstName">
                                                    </div>
                                                </div>
                                                <div class="name-containers1">
                                                    <a class="email">Email</a>
                                                    <div class="placebox-info1">
                                                        <div class="place-to-info-box1"></div>
                                                        <input class="md1" placeholder="<%= user.email %>" type="text" readonly
                                                            value="<%= user.email %>" name="email">
                                                    </div>
                                                </div>
                                               
                                            </div>
                                            <div class="address-fields-parent">
                                                <div class="address-fields">
                                                    <div class="last-name">Last Name</div>
                                                    <div class="placebox-info2">
                                                        <div class="place-to-info-box2"></div>
                                                        <input class="md2" value="<%= user.lastName %>" name="lastName" type="text" required>
                                                    </div>
                                                </div>
                                                <div class="address-fields1">
                                                    <div class="address">Address</div>
                                                    <div class="placebox-info3">
                                                        <div class="place-to-info-box3"></div>
                                                        <% if (billingAddress) { %>
                                                        <input class="md3"
                                                            value="<%= billingAddress.Address_id.House_number %> <%= billingAddress.Address_id.Address_line_1 %> <%= billingAddress.Address_id.Postal_code %> "
                                                            type="text" readonly>
                                                        <% } %>
                                                       
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="placebox-info-parent">
                                            <div class="placebox-info4">
                                                <input id="currentPassword" class="md4 form-control" placeholder="Current Password" type="password"
                                                    required>
                                                <div class="invalid-feedback" id="currentPasswordError"></div>
                                            </div>
                                            <div class="placebox-info5">
                                                <input id="newPassword" class="md5 form-control" placeholder="New Password" type="password"
                                                    name="password">
                                                <div class="invalid-feedback" id="newPasswordError"></div>
                                
                                            </div>
                                
                                            <div class="placebox-info6">
                                                <input id="confirmPassword" class="md6 form-control" placeholder="Confirm New Password" type="password">
                                                <div class="invalid-feedback" id="confirmPasswordError"></div>
                                            </div>
                                        </div>
                                        <div class="form-text text-muted">
                                            <div>
                                                <p id="passwordCriteria">
                                                    Password must be at least 8 characters long and contain:
                                                    <br>
                                                    <span class="password-criteria">* At least one uppercase letter</span>
                                                    <br>
                                                    <span class="password-criteria">* At least one lowercase letter</span>
                                                    <br>
                                                    <span class="password-criteria">* At least one number or special character</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div class="form-group m-0">
                                
                                        </div>
                                    </div>
                                    <div id="error-message" class="m-auto" style="color: red;"></div>
                                    <div class="form-buttons">
                                        <div class="button-container" id="buttonContainer">
                                            <!-- <div class="cancel-button">
                                                <a class="cancel">Cancel</a>
                                            </div> -->
                                            <div class="form-buttons">
                                                <button type="submit" class="button1" id="saveChangesButton">Save Changes</button>
                                
                                            </div>
                                
                                        </div>
                                    </div>
                                </form>
    
                            </div>
                        </div>
    
                        <div id="passwordCriteria" class="mt-2"></div>
                        <div class="alert alert-success" id="userSuccessMessage" style="display: none;"></div>
                    </div>
                </div>
            </div>
        </section>
    </main>
   
      <!-- Footer Section Begin -->
       
    <footer class="footer">
        <div class="container">
            <div class="row">
                <div class="col-lg-3 col-md-6 col-sm-6">
                    <div class="footer__about">
                        <div class="footer__logo">
                            <a href="#"><img src="img/footer-logo.png" alt=""></a>
                        </div>
                        <p>The customer is at the heart of our unique business model, which includes design.</p>
                        <a href="#"><img src="img/payment.png" alt=""></a>
                    </div>
                </div>
                <div class="col-lg-2 offset-lg-1 col-md-3 col-sm-6">
                    <div class="footer__widget">
                        <h6>Shopping</h6>
                        <ul>
                            <li><a href="#">Clothing Store</a></li>
                            <li><a href="#">Trending Shoes</a></li>
                            <li><a href="#">Accessories</a></li>
                            <li><a href="#">Sale</a></li>
                        </ul>
                    </div>
                </div>
                <div class="col-lg-2 col-md-3 col-sm-6">
                    <div class="footer__widget">
                        <h6>Shopping</h6>
                        <ul>
                            <li><a href="#">Contact Us</a></li>
                            <li><a href="#">Payment Methods</a></li>
                            <li><a href="#">Delivary</a></li>
                            <li><a href="#">Return & Exchanges</a></li>
                        </ul>
                    </div>
                </div>
                <div class="col-lg-3 offset-lg-1 col-md-6 col-sm-6">
                    <div class="footer__widget">
                        <h6>NewLetter</h6>
                        <div class="footer__newslatter">
                            <p>Be the first to know about new arrivals, look books, sales & promos!</p>
                            <form action="#">
                                <input type="text" placeholder="Your email">
                                <button type="submit"><span class="icon_mail_alt"></span></button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-lg-12 text-center">
                    <div class="footer__copyright__text">
                        <!-- Link back to Colorlib can't be removed. Template is licensed under CC BY 3.0. -->
                        <p>Copyright ©
                            <script>
                                document.write(new Date().getFullYear());
                            </script>2020
                            All rights reserved | This template is made with <i class="fa fa-heart-o"
                            aria-hidden="true"></i> by <a href="https://colorlib.com" target="_blank">Colorlib</a>
                        </p>
                        <!-- Link back to Colorlib can't be removed. Template is licensed under CC BY 3.0. -->
                    </div>
                </div>
            </div>
        </div>
    </footer>
    <!-- Footer Section End -->

    <!-- Search Begin -->
    <div class="search-model">
        <div class="h-100 d-flex align-items-center justify-content-center">
            <div class="search-close-switch">+</div>
            <form class="search-model-form">
                <input type="text" id="search-input" placeholder="Search here.....">
            </form>
        </div>
    </div>
    <!-- Search End -->

    <!-- Js Plugins -->
    <script src="js/jquery-3.3.1.min.js"></script>
    <script src="js/bootstrap.min.js"></script>
    <script src="js/jquery.nice-select.min.js"></script>
    <script src="js/jquery.nicescroll.min.js"></script>
    <script src="js/jquery.magnific-popup.min.js"></script>
    <script src="js/jquery.countdown.min.js"></script>
    <script src="js/jquery.slicknav.js"></script>
    <script src="js/mixitup.min.js"></script>
    <script src="js/owl.carousel.min.js"></script>
    <script src="js/main.js"></script>
</body>

</html>
    </div>

    <script>
    const saveChangesButton = document.getElementById('saveChangesButton');
    const errorMessageDiv = document.getElementById('error-message');

    saveChangesButton.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const currentPassword = document.getElementById('currentPassword').value

        if (currentPassword.length < 8 || !/[A-Z]/.test(currentPassword) || !/[a-z]/.test(currentPassword) || !/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(currentPassword)) {
            errorMessageDiv.textContent = 'Please Enter a Valid Current Password';
            return;
        }
        // Check if current password matches with user's password
        if (currentPassword !== '<%= user.password %>') {
            errorMessageDiv.textContent = 'Current password is incorrect';
            return;
        }

        // Validate password criteria here
        if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
            errorMessageDiv.textContent = 'Password does not meet the criteria';
            return;
        }


        if (newPassword !== confirmPassword) {
            errorMessageDiv.textContent = 'Passwords do not match';
            return;
        }

        // If validation passes, submit the form
        document.getElementById('profile-form').submit();
    });
</script>
<script>
  document.getElementById('addressBookText').addEventListener('click', function() {
    window.location.href = '/user/address';
  });

  document.getElementById('orderdetails').addEventListener('click', function() {
    window.location.href = '/user/orders';
  });
</script>

  </body>
</html>
