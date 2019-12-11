var displayedElementIds = {};
var elemCount = 0;
var UserFormEvents = {
	formGenerated : () => {},
	formCleared: () => {}
};

var GroupFormEvents = {
	formGenerated : () => {}
};

var RoleFormEvents = {
	formGenerated : () => {}
};

var ActiveFormElems = {
	"Id" : null,
	"First Name" : null,
	"Last Name" : null,
	"Email" : null,
	"Password" : null,
	"Resource Name": null,
	"Roles" : {},
	"Groups" : {},
	"Users" : {},
	"Save Button": null,
	"Cancel Button": null
};

function GetInfo(url, callback, container){
	var request = new XMLHttpRequest();

	if (request == undefined){
		console.log("I was not able to create the request");
	}
	request.withCredentials = true;

	request.open('GET', url)
	request.onload = function(){
		var data = JSON.parse(this.response);
		callback(data, container);
	}

	request.send();
}

function PostInfo(url, body, callback){
	var request = new XMLHttpRequest();

	if (request == undefined){
		console.log("I was not able to create the request");
	}
	request.withCredentials = true;
	request.open('POST', url, true)
	request.setRequestHeader("Content-Type", "application/json");
	request.onload = function(){
		if(this.status == 201){
			callback();
		}
		else{
			console.log("There was an issue creating the user.")
		}
		
	}

	request.send(body);
}

function PutInfo(url, body){
	var request = new XMLHttpRequest();

	if (request == undefined){
		console.log("I was not able to create the request");
	}
	request.withCredentials = true;
	request.open('PUT', url, true)
	request.setRequestHeader("Content-Type", "application/json");
	request.onload = function(){
		if(this.status == 200 || this.status == 201){
			ShowAlert("The resource was updated successfully!");
		}
		else{
			console.log("There was an issue creating the user.")
		}
		
	}

	request.send(body);
}

function GetUsers(){
	var userUrl = 'http://localhost:5000/users/';
	contentArea = document.getElementById('ContentArea');
	while(contentArea.hasChildNodes()){
		contentArea.removeChild(contentArea.firstChild);	
	}

	container = document.createElement('div');
	container.setAttribute('id', 'Container');
	contentArea.appendChild(container);

	GetInfo(userUrl, BindUsersToPage, container);	
}

function BindUsersToPage(data, container){

	addUserButton = document.createElement('input');
	addUserButton.setAttribute('type', 'button');
	addUserButton.setAttribute('id', "AddUserButton");
	addUserButton.setAttribute('value', 'Add User');
	addUserButton.setAttribute('onclick', 'NewUserForm()');
	container.appendChild(addUserButton);

	data.forEach(user =>{
		elemCount++;
		const userContainer = document.createElement('div');
		userContainer.setAttribute('class', 'UserInfo');
		userContainer.setAttribute('id', 'User' + elemCount);

		deleteButton = document.createElement('input');
		deleteButton.setAttribute('type', 'button');
		deleteButton.setAttribute('value', 'Delete User');
		deleteButton.setAttribute('onclick', 'DeleteUser(' + elemCount + ')');

		editButton = document.createElement('input');
		editButton.setAttribute('type', 'button');
		editButton.setAttribute('value', 'Edit User');
		editButton.setAttribute('onclick', 'EditUser('+ elemCount +')');

		newKey = 'User' + elemCount;
		displayedElementIds[newKey] = user.UserId;

		nameLabel = document.createElement('label');
		nameLabel.innerHTML = "Name: " + user.FirstName + " " + user.LastName;

		emailLabel = document.createElement('label');
		emailLabel.innerHTML = "Email: " + user.Email;

		passwordLabel = document.createElement('label');
		passwordLabel.innerHTML = "Password: ******************";

		container.appendChild(userContainer);

		userContainer.appendChild(deleteButton);
		userContainer.appendChild(editButton);
		userContainer.appendChild(nameLabel);
		userContainer.appendChild(emailLabel);
		userContainer.appendChild(passwordLabel);
	})
}
function NewUserForm(){
	UserFormEvents.formGenerated = (form) => {console.log(ActiveFormElems)};
	generateUserForm();
}

function generateUserForm(){
	contentArea = document.getElementById('ContentArea');
	while(contentArea.hasChildNodes()){
		contentArea.removeChild(contentArea.firstChild);
	}

	userInfoFields = ['First Name', 'Last Name', 'Email', 'Password']

	container = document.createElement('div');
	container.setAttribute('id', 'UserFormContainer');
	userForm = document.createElement('form');
	userForm.setAttribute('id', 'UserForm');
	userForm.setAttribute('class', 'UserForm');

	for(let i = 0; i < userInfoFields.length; i++){
		infoContainer = document.createElement('div');
		infoLabel = document.createElement('label');
		infoLabel.setAttribute('for', userInfoFields[i] + " Field");
		infoLabel.innerHTML = userInfoFields[i];
		infoInput = document.createElement('input')
		infoInput.setAttribute('type', 'text');
		infoInput.setAttribute('id', userInfoFields[i] + " Field");

		if(userInfoFields[i] == 'First Name'){
			cancelButton = document.createElement('input');
			cancelButton.setAttribute('type', 'button');
			cancelButton.setAttribute('value', 'Cancel');
			cancelButton.setAttribute('class', 'formButtons');
			cancelButton.setAttribute('onclick', 'GetUsers()');

			saveButton = document.createElement('input');
			saveButton.setAttribute('type', 'button');
			saveButton.setAttribute('value', 'Save');
			saveButton.setAttribute('class', 'formButtons');
			saveButton.setAttribute('onclick',  'AddUser()')
			ActiveFormElems["Save Button"] = saveButton;
			infoContainer.appendChild(cancelButton);
			infoContainer.appendChild(saveButton);
		}

		ActiveFormElems[userInfoFields[i]] = infoInput;

		infoContainer.appendChild(infoLabel);
		infoContainer.appendChild(infoInput);
		userForm.appendChild(infoContainer);
	}

	GetInfo('http://localhost:5000/roles/', BindSimpleRoleToUserForm, userForm);
	GetInfo('http://localhost:5000/groups/', BindSimpleGroupToUserForm, userForm);

}

function BindSimpleRoleToUserForm(roleData, userForm){

	roleTable = document.createElement('table');
	roleHeadRow = document.createElement('tr');
	roleHeader = document.createElement('th');
	roleHeader.innerHTML = "Roles";
	roleHeadRow.appendChild(roleHeader);
	roleTable.appendChild(roleHeadRow);
	userForm.appendChild(roleTable);

	roleData.forEach(role =>{
		itemRow = document.createElement('tr');
		checkboxItemData = document.createElement('td');
		checkboxElem = document.createElement('input');
		checkboxElem.setAttribute('type', 'checkbox');
		checkboxElem.setAttribute('id', role.RoleName + " box");
		checkboxItemData.appendChild(checkboxElem);
		roleData = document.createElement('td');
		roleData.innerHTML = role.RoleName;
		itemRow.appendChild(checkboxItemData);
		itemRow.appendChild(roleData);
		roleTable.appendChild(itemRow);
		ActiveFormElems.Roles[role.Id] = checkboxElem;
	});
}

function BindSimpleGroupToUserForm(groupData, userForm){
	groupTable = document.createElement('table');
	groupHeadRow = document.createElement('tr');
	groupHeader = document.createElement('th');
	groupHeader.innerHTML = "Groups";
	groupHeadRow.appendChild(groupHeader);
	groupTable.appendChild(groupHeadRow);
	userForm.appendChild(groupTable);

	groupData.forEach(group =>{
		itemRow = document.createElement('tr');
		checkboxItemData = document.createElement('td');
		checkboxElem = document.createElement('input');
		checkboxElem.setAttribute('type', 'checkbox');
		checkboxElem.setAttribute('id', group.GroupName + " box");
		checkboxItemData.appendChild(checkboxElem);
		groupData = document.createElement('td');
		groupData.innerHTML = group.GroupName;
		itemRow.appendChild(checkboxItemData);
		itemRow.appendChild(groupData);
		groupTable.appendChild(itemRow);
		ActiveFormElems.Groups[group.Id] = checkboxElem;
	});

	contentArea.appendChild(container);
	container.appendChild(userForm);
	console.log(ActiveFormElems);

	UserFormEvents.formGenerated(userForm);
}

function DeleteUser(userNum){
	var containerId = 'User' + userNum;
	var userId = displayedElementIds[containerId];
	var deleteUrl = 'http://localhost:5000/users/' + userId;

	DeleteResource(deleteUrl, containerId, deleteWebObject);
}

function EditUser(userNum){
	var containerId = 'User' + userNum;
	var userId = displayedElementIds[containerId];
	var userUrl = 'http://localhost:5000/users/' + userId;
	UserFormEvents.formGenerated = (form) => GetInfo(userUrl, MapUserInfoToUserForm, form);
	generateUserForm();

}

function MapUserInfoToUserForm(userInfo, form){
	console.log(userInfo);
	ActiveFormElems["Id"] = userInfo["UserId"];
	ActiveFormElems["Save Button"].setAttribute('onclick', 'UpdateUser()');
	ActiveFormElems["First Name"].value = userInfo["FirstName"];
	ActiveFormElems["Last Name"].value = userInfo["LastName"];
	ActiveFormElems["Email"].value = userInfo["Email"];
	ActiveFormElems["Password"].value = userInfo["Password"];

	userInfo["Roles"].forEach(role => {
		checkbox = ActiveFormElems["Roles"][role['Id']].checked = true;
	});

	userInfo["Groups"].forEach(group => {
		ActiveFormElems["Groups"][group['Id']].checked = true;
	});
}

function AddUser(){
	userUrl = 'http://localhost:5000/users/';

	body = {
		"FirstName": ActiveFormElems["First Name"].value,
		"LastName" : ActiveFormElems["Last Name"].value,
		"Email" : ActiveFormElems["Email"].value,
		"Password" : ActiveFormElems["Password"].value,
		"Roles" : [],
		"Groups" : []
	};

	for (var key in ActiveFormElems["Roles"]){
		if (ActiveFormElems["Roles"][key].checked){
			body["Roles"].push({"Id": key})
		}
	}

	for (var key in ActiveFormElems["Groups"]){
		if (ActiveFormElems["Groups"][key].checked){
			body["Groups"].push({"Id": key})
		}
	}

	var jsonBody = JSON.stringify(body);

	console.log(jsonBody);
	PostInfo(userUrl, jsonBody, GetUsers);	
}

function UpdateUser(userNum){
	var userUrl = 'http://localhost:5000/users/' + ActiveFormElems["Id"];

	body = {
		"FirstName": ActiveFormElems["First Name"].value,
		"LastName" : ActiveFormElems["Last Name"].value,
		"Email" : ActiveFormElems["Email"].value,
		"Password" : ActiveFormElems["Password"].value,
		"Roles" : [],
		"Groups" : []
	};

	for (var key in ActiveFormElems["Roles"]){
		if (ActiveFormElems["Roles"][key].checked){
			body["Roles"].push({"Id": key})
		}
	}

	for (var key in ActiveFormElems["Groups"]){
		if (ActiveFormElems["Groups"][key].checked){
			body["Groups"].push({"Id": key})
		}
	}

	var jsonBody = JSON.stringify(body);

	PutInfo(userUrl, jsonBody);

}

function ShowAlert(message){
	alert(message);
}

function GetGroups(){
	groupUrl = "http://localhost:5000/groups/";
	contentArea = document.getElementById('ContentArea');
	while(contentArea.hasChildNodes()){
		contentArea.removeChild(contentArea.firstChild);	
	}

	container = document.createElement('div');
	container.setAttribute('id', 'Container');
	contentArea.appendChild(container);

	GetInfo(groupUrl, BindGroupInfosToPage, container);
}

function BindGroupInfosToPage(groupData, container){
	elemCount = 0;
	displayedElementIds = {};
	addGroupButton = document.createElement('input');
	addGroupButton.setAttribute('type', 'button');
	addGroupButton.setAttribute('id', "AddGroupButton");
	addGroupButton.setAttribute('value', 'Add Group');
	addGroupButton.setAttribute('onclick', 'NewGroupForm()');
	container.appendChild(addGroupButton);

	groupData.forEach(group => {
		elemCount++;
		const groupContainer = document.createElement('div');
		groupContainer.setAttribute('class', 'ResourceDisplay');
		groupContainer.setAttribute('id', 'Group' + elemCount);
		groupContainer.innerHTML = "Group Name:";

		groupNameLabel = document.createElement('label');
		groupNameLabel.setAttribute('id', "Group Name Label");
		groupNameLabel.innerHTML = group.GroupName;

		deleteButton = document.createElement('input');
		deleteButton.setAttribute('type', 'button');
		deleteButton.setAttribute('value', 'Delete Group');
		deleteButton.setAttribute('onclick', 'DeleteGroup(' + elemCount + ')');

		editButton = document.createElement('input');
		editButton.setAttribute('type', 'button');
		editButton.setAttribute('value', 'Edit Group');
		editButton.setAttribute('onclick', 'EditGroup('+ elemCount +')');

		newKey = 'Group' + elemCount;
		displayedElementIds[newKey] = group.Id;

		groupContainer.appendChild(groupNameLabel);
		groupContainer.appendChild(deleteButton);
		groupContainer.appendChild(editButton);

		rolesList = document.createElement('ul');
		rolesList.setAttribute('id', "GroupRolesList");
		rolesList.innerHTML = "Roles:"

		group.GroupRoles.forEach(role => {
			listItem = document.createElement('li');
			listItem.setAttribute('id', role.RoleName + " listing");
			listItem.innerHTML = role.RoleName;
			rolesList.appendChild(listItem);
		});

		userList = document.createElement('ul');
		userList.setAttribute('id', "GroupUsersList");
		userList.innerHTML = "Users:";

		group.Users.forEach(user => {
			listItem = document.createElement('li');
			listItem.setAttribute('id', user.FirstName + user.LastName + " listing");
			listItem.innerHTML = user.FirstName + " " + user.LastName;
			userList.appendChild(listItem);
		});

		groupContainer.appendChild(rolesList);
		groupContainer.appendChild(userList);

		container.appendChild(groupContainer);
		contentArea.appendChild(container);
	});

	console.log(displayedElementIds);
}


// I think this info is already included in the returned group info
function BindRolesToGroupDisplay(roleData, container){
	rolesList = document.createElement('table');
	rolesList.setAttribute('id', "GroupRolesList");
	headerRow = document.createElement('tr');
	header = document.createElement('th');
	header.innerHTML = "Group Roles";
	headerRow.appendChild(header);
	rolesList.appendChild(headerRow);

	roleData.forEach(role => {
		listRow = document.createElement('tr');
		listItem = document.createElement('td');
		itemCheckbox = document.createElement('input');
		itemCheckbox.setAttribute('type', 'checkbox');
		itemLabel = document.createElement('label');
		itemLabel.innerHTML = role.RoleName;
		ActiveFormElems['Roles'][role.Id] = itemCheckbox;
		listItem.appendChild(itemCheckbox);
		listItem.appendChild(itemLabel);
		listRow.appendChild(listItem);
		rolesList.appendChild(listRow);
	});

	container.appendChild(rolesList);
	container.appendChild(document.createElement('span'));
}

function BindUsersToGroupDisplay(userData, container){
	userList = document.createElement('table');
	userList.setAttribute('id', "GroupUsersList");
	headerRow = document.createElement('tr');
	header = document.createElement('th');
	header.innerHTML = "Users in Group";
	headerRow.appendChild(header);
	userList.appendChild(headerRow);

	userData.forEach(user => {
		listRow = document.createElement('tr');
		listItem = document.createElement('td');
		itemCheckbox = document.createElement('input');
		itemCheckbox.setAttribute('type', 'checkbox');
		itemLabel = document.createElement('label');
		itemLabel.innerHTML = user.FirstName + " " + user.LastName;
		ActiveFormElems['Users'][user.UserId] = itemCheckbox;
		listItem.appendChild(itemCheckbox);
		listItem.appendChild(itemLabel);
		listRow.appendChild(listItem);
		userList.appendChild(listRow);
	});

	container.appendChild(userList);
	contentArea.appendChild(container);

	console.log(ActiveFormElems);
	GroupFormEvents.formGenerated(container);
}

function NewGroupForm(){
	contentArea = document.getElementById('ContentArea');
	while(contentArea.hasChildNodes()){
		contentArea.removeChild(contentArea.firstChild);	
	}

	groupInfoContainer = document.createElement('div');
	groupInfoContainer.setAttribute('id', 'GroupDisplayContainer');
	groupInfoContainer.setAttribute('class', 'ResourceInfo');

	nameLabel = document.createElement('label');
	nameLabel.setAttribute('for', 'GroupNameField');
	nameLabel.setAttribute('class', 'NameLabel');
	nameLabel.innerHTML = "GROUP NAME";

	groupSaveButton = document.createElement('input');
	groupSaveButton.setAttribute('type', 'button');
	groupSaveButton.setAttribute('value', 'Save');
	groupSaveButton.setAttribute('onclick', 'AddGroup()')

	ActiveFormElems["Save Button"] = groupSaveButton

	groupNameField = document.createElement('input');
	groupNameField.setAttribute('type', 'text');
	groupNameField.setAttribute('id', 'GroupNameField');

	ActiveFormElems["Resource Name"] = groupNameField;

	groupCancelButton = document.createElement('input');
	groupCancelButton.setAttribute('type', 'button');
	groupCancelButton.setAttribute('value', 'Cancel');
	groupCancelButton.setAttribute('onclick', 'GetGroups()');

	ActiveFormElems["Cancel Button"] = groupCancelButton;

	groupInfoContainer.appendChild(nameLabel);
	groupInfoContainer.appendChild(groupSaveButton);
	groupInfoContainer.appendChild(groupNameField);
	groupInfoContainer.appendChild(groupCancelButton);

	groupInfoContainer.appendChild(document.createElement('span'));

	GetInfo("http://localhost:5000/roles/", BindRolesToGroupDisplay, groupInfoContainer);

	GetInfo("http://localhost:5000/users/", BindUsersToGroupDisplay, groupInfoContainer);
}

function EditGroup(groupNum){
	while(contentArea.hasChildNodes()){
		contentArea.removeChild(contentArea.firstChild);	
	}

	var containerId = 'Group' + groupNum;
	var groupId = displayedElementIds[containerId];
	var groupUrl = "http://localhost:5000/groups/" + groupId;

	GroupFormEvents.formGenerated = (form) => GetInfo(groupUrl, MapGroupInfoToGroupForm, form);
	NewGroupForm();
}

function AddGroup(){
	groupUrl = "http://localhost:5000/groups/";

	body = {
		"GroupName" : ActiveFormElems["Resource Name"].value,
		"GroupRoles" : [],
		"Users" : []
	};

	for (var key in ActiveFormElems["Roles"]){
		if(ActiveFormElems["Roles"][key].checked){
			body["GroupRoles"].push({"Id": key})
		}
	}

	for (var key in ActiveFormElems["Users"]){
		if(ActiveFormElems["Users"][key].checked){
			body["Users"].push({"Id": key})
		}
	}

	var jsonBody = JSON.stringify(body);

	PostInfo(groupUrl, jsonBody, GetGroups);
}

function UpdateGroup(){
	groupId = ActiveFormElems["Id"];
	groupUrl = "http://localhost:5000/groups/" + groupId;

	body = {
		"GroupName" : ActiveFormElems["Resource Name"].value,
		"GroupRoles" : [],
		"Users" : []
	};

	for (var key in ActiveFormElems["Roles"]){
		if(ActiveFormElems["Roles"][key].checked){
			body["GroupRoles"].push({"Id": key})
		}
	}

	for (var key in ActiveFormElems["Users"]){
		if(ActiveFormElems["Users"][key].checked){
			body["Users"].push({"Id": key})
		}
	}

	var jsonBody = JSON.stringify(body);

	PutInfo(groupUrl, jsonBody);
}

function MapGroupInfoToGroupForm(groupInfo, form){
	ActiveFormElems['Id'] = groupInfo["Id"];
	ActiveFormElems['Save Button'].setAttribute('onclick', 'UpdateGroup()');
	ActiveFormElems['Resource Name'].value = groupInfo["GroupName"];

	groupInfo["GroupRoles"].forEach(role => {
		ActiveFormElems["Roles"][role["Id"]].checked = true;
	});

	groupInfo["Users"].forEach(user => {
		ActiveFormElems["Users"][user['UserId']].checked = true;
	});

	GroupFormEvents.formGenerated = () => {};
}

function DeleteGroup(groupNum){
	var containerId = 'Group' + groupNum;
	var groupId = displayedElementIds[containerId];
	var deleteUrl = 'http://localhost:5000/groups/' + groupId;

	DeleteResource(deleteUrl, containerId, deleteWebObject);
}

function GetRoles(){
	roleUrl = "http://localhost:5000/roles/";
	contentArea = document.getElementById('ContentArea');
	while(contentArea.hasChildNodes()){
		contentArea.removeChild(contentArea.firstChild);	
	}

	container = document.createElement('div');
	container.setAttribute('id', 'Container');
	contentArea.appendChild(container);

	GetInfo(roleUrl, BindRoleInfosToPage, container);
}

function BindRoleInfosToPage(roleData, container){
	elemCount = 0;
	displayedElementIds = {};
	addRoleButton = document.createElement('input');
	addRoleButton.setAttribute('type', 'button');
	addRoleButton.setAttribute('id', "AddRoleButton");
	addRoleButton.setAttribute('value', 'Add Role');
	addRoleButton.setAttribute('onclick', 'NewRoleForm()');
	container.appendChild(addRoleButton);

	roleData.forEach(role => {
		elemCount++;
		const roleContainer = document.createElement('div');
		roleContainer.setAttribute('class', 'ResourceDisplay');
		roleContainer.setAttribute('id', 'Role' + elemCount);
		roleContainer.innerHTML = "Role Name:";

		roleNameLabel = document.createElement('label');
		roleNameLabel.setAttribute('id', "Role Name Label");
		roleNameLabel.innerHTML = role.RoleName;

		deleteButton = document.createElement('input');
		deleteButton.setAttribute('type', 'button');
		deleteButton.setAttribute('value', 'Delete Role');
		deleteButton.setAttribute('onclick', 'DeleteRole(' + elemCount + ')');

		editButton = document.createElement('input');
		editButton.setAttribute('type', 'button');
		editButton.setAttribute('value', 'Edit Role');
		editButton.setAttribute('onclick', 'EditRole('+ elemCount +')');

		newKey = 'Role' + elemCount;
		displayedElementIds[newKey] = role.Id;

		roleContainer.appendChild(roleNameLabel);
		roleContainer.appendChild(deleteButton);
		roleContainer.appendChild(editButton);

		groupsList = document.createElement('ul');
		groupsList.setAttribute('id', "GroupsList");
		groupsList.innerHTML = "Groups:"

		role.Groups.forEach(group => {
			listItem = document.createElement('li');
			listItem.setAttribute('id', group.GroupName + " listing");
			listItem.innerHTML = group.GroupName;
			groupsList.appendChild(listItem);
		});

		userList = document.createElement('ul');
		userList.setAttribute('id', "RoleUsersList");
		userList.innerHTML = "Users:";

		role.Users.forEach(user => {
			listItem = document.createElement('li');
			listItem.setAttribute('id', user.FirstName + user.LastName + " listing");
			listItem.innerHTML = user.FirstName + " " + user.LastName;
			userList.appendChild(listItem);
		});

		roleContainer.appendChild(groupsList);
		roleContainer.appendChild(userList);

		container.appendChild(roleContainer);
		contentArea.appendChild(container);
	});

	console.log(displayedElementIds);
}

function NewRoleForm(){
	contentArea = document.getElementById('ContentArea');
	while(contentArea.hasChildNodes()){
		contentArea.removeChild(contentArea.firstChild);	
	}

	roleInfoContainer = document.createElement('div');
	roleInfoContainer.setAttribute('id', 'RoleDisplayContainer');
	roleInfoContainer.setAttribute('class', 'ResourceInfo');

	nameLabel = document.createElement('label');
	nameLabel.setAttribute('for', 'RoleNameField');
	nameLabel.setAttribute('class', 'NameLabel');
	nameLabel.innerHTML = "ROLE NAME";

	roleSaveButton = document.createElement('input');
	roleSaveButton.setAttribute('type', 'button');
	roleSaveButton.setAttribute('value', 'Save');
	roleSaveButton.setAttribute('onclick', 'AddRole()')

	ActiveFormElems["Save Button"] = roleSaveButton

	roleNameField = document.createElement('input');
	roleNameField.setAttribute('type', 'text');
	roleNameField.setAttribute('id', 'RoleNameField');

	ActiveFormElems["Resource Name"] = roleNameField;

	roleCancelButton = document.createElement('input');
	roleCancelButton.setAttribute('type', 'button');
	roleCancelButton.setAttribute('value', 'Cancel');
	roleCancelButton.setAttribute('onclick', 'GetRoles()');

	ActiveFormElems["Cancel Button"] = roleCancelButton;

	roleInfoContainer.appendChild(nameLabel);
	roleInfoContainer.appendChild(roleSaveButton);
	roleInfoContainer.appendChild(roleNameField);
	roleInfoContainer.appendChild(roleCancelButton);

	roleInfoContainer.appendChild(document.createElement('span'));

	GetInfo("http://localhost:5000/groups/", BindGroupsToRoleDisplay, roleInfoContainer);

	GetInfo("http://localhost:5000/users/", BindUsersToRoleDisplay, roleInfoContainer);
}

function BindGroupsToRoleDisplay(groupData, container){
	groupsList = document.createElement('table');
	groupsList.setAttribute('id', "RoleGroupsList");
	headerRow = document.createElement('tr');
	header = document.createElement('th');
	header.innerHTML = "Groups";
	headerRow.appendChild(header);
	groupsList.appendChild(headerRow);

	groupData.forEach(group => {
		listRow = document.createElement('tr');
		listItem = document.createElement('td');
		itemCheckbox = document.createElement('input');
		itemCheckbox.setAttribute('type', 'checkbox');
		itemLabel = document.createElement('label');
		itemLabel.innerHTML = group.GroupName;
		ActiveFormElems['Groups'][group.Id] = itemCheckbox;
		listItem.appendChild(itemCheckbox);
		listItem.appendChild(itemLabel);
		listRow.appendChild(listItem);
		groupsList.appendChild(listRow);
	});

	container.appendChild(groupsList);
	container.appendChild(document.createElement('span'));
}

function BindUsersToRoleDisplay(userData, container){
	userList = document.createElement('table');
	userList.setAttribute('id', "RoleUsersList");
	headerRow = document.createElement('tr');
	header = document.createElement('th');
	header.innerHTML = "Users with Role";
	headerRow.appendChild(header);
	userList.appendChild(headerRow);

	userData.forEach(user => {
		listRow = document.createElement('tr');
		listItem = document.createElement('td');
		itemCheckbox = document.createElement('input');
		itemCheckbox.setAttribute('type', 'checkbox');
		itemLabel = document.createElement('label');
		itemLabel.innerHTML = user.FirstName + " " + user.LastName;
		ActiveFormElems['Users'][user.UserId] = itemCheckbox;
		listItem.appendChild(itemCheckbox);
		listItem.appendChild(itemLabel);
		listRow.appendChild(listItem);
		userList.appendChild(listRow);
	});

	container.appendChild(userList);
	contentArea.appendChild(container);

	console.log(ActiveFormElems);
	RoleFormEvents.formGenerated(container);
	RoleFormEvents.formGenerated = () => {};
}

function MapRoleInfoToRoleForm(roleInfo, form){
	ActiveFormElems['Id'] = roleInfo["Id"];
	ActiveFormElems['Save Button'].setAttribute('onclick', 'UpdateRole()');
	ActiveFormElems['Resource Name'].value = roleInfo["RoleName"];

	roleInfo["Groups"].forEach(group => {
		ActiveFormElems["Groups"][group["Id"]].checked = true;
	});

	roleInfo["Users"].forEach(user => {
		ActiveFormElems["Users"][user['UserId']].checked = true;
	});
}

function EditRole(roleNum){
	while(contentArea.hasChildNodes()){
		contentArea.removeChild(contentArea.firstChild);	
	}

	var containerId = 'Role' + roleNum;
	var roleId = displayedElementIds[containerId];
	var roleUrl = "http://localhost:5000/roles/" + roleId;

	RoleFormEvents.formGenerated = (form) => GetInfo(roleUrl, MapRoleInfoToRoleForm, form);
	NewRoleForm();
}

function AddRole(){
	roleUrl = "http://localhost:5000/roles/";

	body = {
		"RoleName" : ActiveFormElems["Resource Name"].value,
		"Groups" : [],
		"Users" : []
	};

	for (var key in ActiveFormElems["Groups"]){
		if(ActiveFormElems["Groups"][key].checked){
			body["Groups"].push({"Id": key})
		}
	}

	for (var key in ActiveFormElems["Users"]){
		if(ActiveFormElems["Users"][key].checked){
			body["Users"].push({"Id": key})
		}
	}

	var jsonBody = JSON.stringify(body);

	PostInfo(roleUrl, jsonBody, GetRoles);
}

function UpdateRole(){
	roleId = ActiveFormElems['Id'];
	roleUrl = "http://localhost:5000/roles/" + roleId;

	body = {
		"RoleName" : ActiveFormElems["Resource Name"].value,
		"Groups" : [],
		"Users" : []
	};

	for (var key in ActiveFormElems["Groups"]){
		if(ActiveFormElems["Groups"][key].checked){
			body["Groups"].push({"Id": key})
		}
	}

	for (var key in ActiveFormElems["Users"]){
		if(ActiveFormElems["Users"][key].checked){
			body["Users"].push({"Id": key})
		}
	}

	var jsonBody = JSON.stringify(body);

	PutInfo(roleUrl, jsonBody);
}

function DeleteRole(roleNum){
	var containerId = 'Role' + roleNum;
	var roleId = displayedElementIds[containerId];
	var deleteUrl = 'http://localhost:5000/roles/' + roleId;

	DeleteResource(deleteUrl, containerId, deleteWebObject);
}

function deleteWebObject(Id){
	object = document.getElementById(Id);
	parentObject = object.parentElement;
	parentObject.removeChild(object);
}

function DeleteResource(url, objectId, callback){
	var request = new XMLHttpRequest();

	if (request == undefined){
		console.log("I was not able to create the request");
	}
	request.withCredentials = true;

	request.open('DELETE', url)
	request.onload = function(){
		if(this.status == 202){
			callback(objectId)
		}
		else{
			console.log("The resource could not be deleted.")
		}
	}

	request.send();
}
