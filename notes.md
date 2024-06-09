<form action="/admin/update/<%= row._id %>" method="post" id="aform">
				<div class="modal-header">						
					<h4 class="modal-title">Edit User</h4>
					<button type="button" class="close" data-dismiss="modal" aria-hidden="true" >&times;</button>
				</div>
				<div class="modal-body">					
					<div class="form-group">
						<label>Full Name</label>
						<input type="text" class="form-control" id="editfirstName" name="fullName" value="<%= row.name %>" required>
					</div>
                    <div class="form-group">
						<label>Username</label>
						<input type="text" class="form-control" id="edituserName" name="userName" value="<%= row.user %>" required>
					</div>
                    <div class="form-group">
						<label>Gender</label>
						<input type="text" class="form-control" value="<%= row.gender %>" name="gender"required>
					</div>
					<div class="form-group">
						<label>Email</label>
						<input type="email" class="form-control" id="editemailAddress" name="email" value="<%= row.email %>" required>
					</div>
                    <div class="form-group">
						<label>Phone</label>
						<input type="text" class="form-control" id="editphoneNumber" name="phone" value="<%= row.phone %>" required>
					</div>	 
                    <div class="form-group">
						<label>Password</label>
						<input type="password" class="form-control" id="editpassword" name="password" value="<%= row.password%>" required>
					</div>
					
                   
    
									
				</div>
				<div class="modal-footer">
					<input type="button" class="btn btn-default" data-dismiss="modal" value="Cancel" >
					<input type="submit" class="btn btn-success" value="Add">
				</div>
			</form>





			if (searchData.length > 0) { %>
    <%- include('search') %>
<% } 

///new 
<% if (searchData && searchData.length > 0) { %>
    <%- include('search') %>
<% } else if (data && data.length > 0) { %>
    <%- include('table') %>
    <% } else if (noValue===0) { %>
    <h1 class="text-center text-secondary mt-5">No users found in database...</h1>
<% } else { %>
    <h1 class="text-center text-secondary mt-5">No users found in database...</h1>
<% } %>

