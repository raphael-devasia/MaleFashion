<div class="card">
<div class="card-body">
<div class="row">
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
    <select class="select" name="size">
      <option>Choose Size</option>
      <% sizeOptions.forEach((row, index) => { %>
        <option value="<%= row.Size_name %>"><%= row.Size_name %></option>
      <% }); %>
    </select>
  </div>
</div>

<div class="col-lg-3 col-sm-6 col-12">
  <div class="form-group">
    <label>Current Colour</label>
    <input type="text" class="form-control" value="<%= data[0].colour.Colour_name %>" readonly>
    <label>Colour</label>
    <select class="select" name="Colour_name">
      <option>Choose Colour</option>
      <% colourOptions.forEach((row, index) => { %>
        <option value="<%= row.Colour_name %>"><%= row.Colour_name %></option>
      <% }); %>
    </select>
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
    <label>Product Images</label>
    <div class="image-upload">
      <input type="file" id="product_image_input" onchange="displayThumbnails(event)" name="product_images" multiple>
      <div class="image-uploads">
        <img id="thumbnail" src="/assets/img/icons/upload.svg" alt="img">
        <h4>Drag and drop files to upload</h4>
      </div>
    </div>
  </div>
</div>
<div class="col-12" id="productListSection" style="display: none;">
  <div class="product-list">
    <ul class="row" id="imageList">
      <!-- Images will be appended here -->
    </ul>
  </div>
</div>

<div class="col-12">
  <div class="product-list">
    <ul class="row">
      <% data[0].Image_filename.forEach(element => { %>
      <li>
        <div class="productviews">
          <div class="productviewsimg">
            <img src="<%= element %>" alt="img">
          </div>
          <div class="productviewscontent">
            <div class="productviewsname"></div>
            <a href="javascript:void(0);" class="hideset">x</a>
          </div>
        </div>
      </li>
      <% }) %>
    </ul>
  </div>
</div>

<div class="col-lg-12">
    <input type="hidden" name="id" value="<%= data[0]._id %>">
  <a href="javascript:void(0);" class="btn btn-submit me-2">Update</a>
  <a href="/admin/products" class="btn btn-cancel">Cancel</a>
</div>