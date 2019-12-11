from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, backref
from sqlalchemy import create_engine
import uuid


Base = declarative_base()

class User(Base):
	__tablename__ = "Users"
	UserId = Column(String(), primary_key=True)
	FirstName = Column(String(250))
	LastName = Column(String(250))
	Email = Column(String(250))
	Password = Column(String(250))
	UserGroups = relationship("Group", secondary='UserGroups')
	UserRoles = relationship("Role", secondary='UserRoles')

	def ToDict(self):
		userDict = {
					"UserId" : self.UserId,
					"FirstName" : self.FirstName,
					"LastName" : self.LastName,
					"Email" : self.Email,
					"Password" : self.Password,
					}

		return userDict

	def GetFullInfo(self):
		userDict = self.ToDict();

		groupsDictionaries = []
		roleDictionaries = []
		for group in self.UserGroups:
			groupsDictionaries.append(group.ToDict())

		for role in self.UserRoles:
			roleDictionaries.append(role.ToDict())

		userDict["Groups"] = groupsDictionaries
		userDict["Roles"] = roleDictionaries

		return userDict

class Group(Base):
	__tablename__ = "Groups"
	GroupId = Column(String(), primary_key=True)
	GroupName = Column(String(250))
	users = relationship("User", secondary='UserGroups')
	groupRoles = relationship("Role", secondary="GroupRoles")

	def SimpleInfo(self):
		groupDict = { 
					  "Id" : self.GroupId,
					  "GroupName" : self.GroupName
					}

		return groupDict;
	def ToDict(self):
		groupDict = { 
					  "Id" : self.GroupId,
					  "GroupName" : self.GroupName,
					  "GroupRoles" : [],
					  "GroupUsers" : []
					}

		roleDictionaries = []
		userDictionaries = []


		for role in self.groupRoles:
			roleDictionaries.append(role.ToDict())

		for user in self.users:
			userDictionaries.append(user.ToDict());

		groupDict["GroupRoles"] = roleDictionaries			

		return groupDict

	def FullInfo(self):
		groupDict = { 
					  "Id" : self.GroupId,
					  "GroupName" : self.GroupName,
					  "Users" : [],
					  "GroupRoles" : []
					}

		userAbridgedInfos = []
		roleDictionaries = []

		for user in self.users:
			userAbridgedInfos.append(user.ToDict())

		for role in self.groupRoles:
			roleDictionaries.append(role.ToDict())

		groupDict["Users"] = userAbridgedInfos;
		groupDict["GroupRoles"] = roleDictionaries			

		return groupDict


class Role(Base):
	__tablename__ = "Roles"
	RoleId = Column(String(), primary_key=True)
	RoleName = Column(String(250))
	users = relationship("User", secondary='UserRoles')
	groups = relationship("Group", secondary='GroupRoles')


	def ToDict(self):
		roleDict = { 
					 "Id" : self.RoleId,
					 "RoleName" : self.RoleName
					}

		return roleDict

	def FullInfo(self):
		roleDict = { 
					 "Id" : self.RoleId,
					 "RoleName" : self.RoleName,
					 "Groups" : [],
					 "Users" : []
					}

		groupDictionaries = []
		userDictionaries = []

		for group in self.groups:
			groupDictionaries.append(group.SimpleInfo())

		for user in self.users:
			userDictionaries.append(user.ToDict())

		roleDict["Groups"] = groupDictionaries
		roleDict["Users"] = userDictionaries

		return roleDict

class UserGroup(Base):
	__tablename__ = "UserGroups"
	UserId = Column(String(), ForeignKey("Users.UserId"), primary_key=True)
	GroupId = Column(String(), ForeignKey("Groups.GroupId"), primary_key=True)


class UserRole(Base):
	__tablename__ = "UserRoles"
	UserId = Column(String(), ForeignKey("Users.UserId"), primary_key=True)
	RoleId = Column(String(), ForeignKey("Roles.RoleId"), primary_key=True)

class GroupRole(Base):
	__tablename__ = "GroupRoles"
	GroupId = Column(String(), ForeignKey("Groups.GroupId"), primary_key=True)
	RoleId = Column(String(), ForeignKey("Roles.RoleId"), primary_key=True)

engine = create_engine("sqlite:///db/Authentication.db")

Base.metadata.create_all(engine)

