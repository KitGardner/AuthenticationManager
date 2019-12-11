from flask import Flask, jsonify, request, render_template, Response, redirect, url_for
from flask_restful import Api, Resource, reqparse
from dataModels import User, Group, Role, UserGroup, GroupRole, UserRole, Base
from databaseAdapter import DatabaseAdapter
import uuid

app = Flask(__name__)
api = Api(app)

dba = DatabaseAdapter()

session = {
    "UserLoggedIn": False,
    "LoggedInUser": None
};


@app.route("/")
def home():

    if session["UserLoggedIn"] == True:
        return render_template("Main_Page.html", username=session['LoggedInUser']["FirstName"] + " " + session['LoggedInUser']["LastName"]);
    else:
        return redirect("/login");

@app.route("/login", methods=['GET', 'POST'])
def login():

    if request.method == 'GET':
        return render_template("Login_Page.html")

    elif request.method == 'POST':
        payload = request.get_json()

        incomingUser = dba.FindUserByEmailAndPassword(payload['Email'], payload['Password'])
        if incomingUser is None:
            session["UserLoggedIn"] = False;
            return "No user was found with that name", 404

        else:
            session['UserLoggedIn'] = True
            session['LoggedInUser'] = incomingUser
            return "/", 200

'''
        if payload['UserName'] == 'Kit Gardner' and payload["Password"] == 'tsukiyomi':
            session['UserLoggedIn'] = True
            session['LoggedInUser'] = payload['UserName']
            return "/", 200

        else:
            session["UserLoggedIn"] = False;
            return "No user was found with that name", 404
'''

@app.route("/logout")
def logout():
    session['LoggedInUser'] = None;
    session["UserLoggedIn"] = False;
    print(session["UserLoggedIn"])
    return redirect("/login"); 

class APIUser(Resource):
    def get(self, Id=None):
        if Id:
            #Due to an issue with accessing members that are lazy loaded on an object that is no longer in a session, I have placed the dictionary creation logic inside the adapter
            user = dba.GetUsers(Id)
            
            if user:    
                return user, 200
            else:
                return "No user was found for that provided Id", 404

        else:
            #Following the same pattern as previous
            users = dba.GetUsers()

            return users, 200

    def post(self):
        
        payload = request.get_json()
        if payload is None:
            print("I did not receive anything from the caller.")
            return "No data was provided in the call", 400
        newId = str(uuid.uuid4())

        createResult = dba.CreateUser(newId, payload)

        if createResult:
            createdUser = dba.GetUsers(newId)
            return createdUser, 201
        
        else:
            return "An error occurred while creating the User", 500

    def put(self, Id):

        payload = request.get_json()

        updatedUser = dba.UpdateUser(Id, payload)

        if updatedUser:
            return updatedUser, 200

        else:
            createResult = dba.CreateUser(Id, payload)

            if createResult:
                createdUser = dba.GetUsers(Id)
                return createdUser, 201

    def delete(self, Id):

        result = dba.DeleteUser(Id)

        if result:
            return "User was successfully deleted", 202

        else:
            return "There is no user with that Id", 404



    def head(self):
        print("I made it in here.")
        return {"Message" : "For the User resource the following calls are implemented: Get, Post, Put, delete. The Params are age and occupation"}, 200

    def options(self):
        print("you want some options?")

        apiOptions = {
                "Resource" : "User",
                "Routes" : "/users/, /users/Id(string uuid)",
                "Methods" : "GET, POST, PUT, DELETE",
                "Datatype" : "JSON",
                "Parameters" : {
                                        "FirstName" : "String",
                                        "LastName" : "String",
                                        "Email Address" : "String",
                                        "Password" : "String",
                                        "Groups" : "Collection of Groups. Can be blank",
                                        "Roles" : "Collection of Roles. Can be blank"
                                      }
        }        
        return apiOptions, 200


class APIGroup(Resource):

    def get(self, Id=None):
        if Id:
            groupInfo = dba.GetGroups(Id);
            return groupInfo, 200

        else:
            groups = dba.GetGroups()
            return groups, 200

    def post(self):
        payload = request.get_json()
        newId = str(uuid.uuid4())

        creationResult = dba.CreateGroup(newId, payload)

        if creationResult:
            createdGroup = dba.GetGroups(newId)
            return createdGroup, 201

        else:
            return "There was an issue creating the group with GroupName " + payload["GroupName"], 404 

    def put(self, Id):
        
        payload = request.get_json()

        updatedGroup = dba.UpdateGroup(Id, payload)

        if updatedGroup:
            return updatedGroup, 200

        else:
            creationResult = dba.CreateGroup(Id, payload)

            if creationResult:
                createdGroup = dba.GetGroups(Id)
                return createdGroup, 201

    def delete(self, Id):

        deleteResult = dba.DeleteGroup(Id)

        if deleteResult:
            return "The group was successfully deleted", 202

        else:
            return "No group with that Id does not exist and cannot be deleted", 404


class APIRole(Resource):

    def get(self, Id=None):
        if Id:
            role = dba.GetRoles(Id)

            return role, 200

        else:
            roles = dba.GetRoles()
            return roles, 200

    def post(self):
        payload = request.get_json()
        newId = str(uuid.uuid4())

        creationResult = dba.CreateRole(newId, payload)

        if creationResult:
            createdRole = dba.GetRoles(newId)
            return createdRole, 201

        else:
            return "There was an issue creating the role with RoleName " + payload["RoleName"], 404 

    def put(self, Id):

        payload = request.get_json()

        updatedRole = dba.UpdateRole(Id, payload)

        if updatedRole:
            return updatedRole, 200

        else:
            createdRole = dba.CreateRole(Id, payload)

            if createdRole:
                newRole = dba.GetRoles(Id)
                return newRole, 201

    def delete(self, Id):

        result = dba.DeleteRole(Id)

        if result:
            return "The role was successfully deleted", 202

        else:
            return "No such role exists", 404
      
api.add_resource(APIUser, "/users/<string:Id>", "/users/")
api.add_resource(APIGroup, "/groups/<string:Id>", "/groups/")
api.add_resource(APIRole, "/roles/<string:Id>", "/roles/")

app.run(debug=True, ssl_context='adhoc')




