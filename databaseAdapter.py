from dataModels import User, Group, Role, UserGroup, GroupRole, UserRole, Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, joinedload
from passlib.hash import sha256_crypt

class DatabaseAdapter(object):


	def GetUsers(self, userId=None):
		engine = create_engine("sqlite:///db/Authentication.db")
		Base.metadata.bind = engine;
		DBSession = sessionmaker();
		DBSession.bind = engine
		s = DBSession()

		if userId:
			dbUser = s.query(User).filter(User.UserId == userId).first()

			if dbUser == None:
				return dbUser

			userinfo = dbUser.GetFullInfo()
			s.close()
			return userinfo
		else:
			users = s.query(User)

			userDictionaries = []

			for user in users:
				userDictionaries.append(user.ToDict())
			s.close()
			return userDictionaries

	def GetUsersInSession(self, session, userId=None):
		users = None

		if userId:
			users = session.query(User).filter(User.UserId == userId).first();

		else:
			users = session.query(User)

		return users

	def CreateUser(self, Id, userInfo):

		newUser = User(
            UserId = Id,
            FirstName = userInfo['FirstName'],
            LastName = userInfo['LastName'],
            Email = userInfo['Email'].upper(),
            Password = sha256_crypt.hash(userInfo['Password']),
            UserGroups = [],
            UserRoles = [])

		session = self.GetDbSession()

		for group in userInfo["Groups"]:
			newUser.UserGroups.append(self.GetGroupsInSession(session, group["Id"]))

		for role in userInfo["Roles"]:
			newUser.UserRoles.append(self.GetRolesInSession(session, role["Id"]))

		result = self.InsertIntoDatabase(newUser, session)

		session.close()
		return result

	def UpdateUser(self, userId, changes):
		session = self.GetDbSession()
		user = session.query(User).filter(User.UserId == userId).first()
		if user is None:
			return user

		user.FirstName = changes["FirstName"]
		user.LastName = changes["LastName"]
		user.Email = changes["Email"]
		user.Password = changes["Password"]

		user.UserGroups.clear()
		for group in changes["Groups"]:
			user.UserGroups.append(self.GetGroupsInSession(session, group["Id"]))


		user.UserRoles.clear()
		for role in changes["Roles"]:
			user.UserRoles.append(self.GetRolesInSession(session, role["Id"]))

		session.add(user)
		session.commit()

		updatedUser = user.GetFullInfo()
		session.close()

		return updatedUser

	def DeleteUser(self, userId):
		session = self.GetDbSession();
		user = session.query(User).filter(User.UserId == userId).first()

		if user is None:
			return False

		session.delete(user)
		session.commit()
		session.close()

		return True

	def FindUserByEmailAndPassword(self, email, password):
		session = self.GetDbSession()

		user = session.query(User).filter(User.Email == email.upper()).first();
		userDict = user.ToDict();

		if sha256_crypt.verify(password, userDict["Password"]):
			return userDict;

		else:
			return None;

	def GetGroups(self, groupId=None):
		session = self.GetDbSession()

		if groupId:
			group = session.query(Group).filter(Group.GroupId == groupId).first()

			if group == None:
				return group
			groupInfo = group.FullInfo()
			session.close()
			return groupInfo

		else:
			groups = session.query(Group)

			groupDictionaries = []

			for group in groups:
				groupDictionaries.append(group.FullInfo())
			session.close()
			return groupDictionaries


	def GetGroupsInSession(self, session, groupId=None):

		groups = None 
		if groupId:
			groups = session.query(Group).filter(Group.GroupId == groupId).one()

		else:
			groups = session.query(Group)

		#This method is ment to be called and return with an already existing session, so the logic to close the session must be handled by the caller

		return groups


	def CreateGroup(self, Id, groupInfo):
		session = self.GetDbSession()

		newGroup = Group(
						 GroupId=Id,
						 GroupName=groupInfo["GroupName"],
						 users=[],
						 groupRoles=[])

		for role in groupInfo["GroupRoles"]:
			newGroup.groupRoles.append(self.GetRolesInSession(session, role["Id"]))

		for user in groupInfo["Users"]:
			newGroup.users.append(self.GetUsersInSession(session, user["Id"]))

		result = self.InsertIntoDatabase(newGroup, session)

		session.close()
		return result	

	def UpdateGroup(self, groupId, changes):
		session = self.GetDbSession()
		existingGroup = session.query(Group).filter(Group.GroupId == groupId).first()

		if existingGroup is None:
			return existingGroup

		existingGroup.GroupName = changes["GroupName"]

		existingGroup.groupRoles.clear()
		for role in changes["GroupRoles"]:
			existingGroup.groupRoles.append(self.GetRolesInSession(session, role["Id"]))

		existingGroup.users.clear()
		for user in changes["Users"]:
			existingGroup.users.append(self.GetUsersInSession(session, user["Id"]))

		session.add(existingGroup)
		session.commit()

		updatedGroup = existingGroup.FullInfo()
		session.close()
		return updatedGroup


	def DeleteGroup(self, groupId):
		session = self.GetDbSession()

		group = session.query(Group).filter(Group.GroupId == groupId).first()

		if group is None:
			return False

		session.delete(group)
		session.commit()
		session.close()

		return True

	def GetRoles(self, roleId=None):
		session = self.GetDbSession()
		if roleId:
			role = session.query(Role).filter(Role.RoleId == roleId).first()

			if role == None:
				return role 
				
			roleInfo = role.FullInfo()
			session.close()
			return roleInfo
		else:
			roles = session.query(Role)

			roleDictionaries = []

			for role in roles:
				roleDictionaries.append(role.FullInfo())
			session.close()
			return roleDictionaries

	def GetRolesInSession(self, session, roleId=None):
		roles = None;
		if roleId:
			roles = session.query(Role).filter(Role.RoleId == roleId).one()

		else:
			roles = session.query(Role)

		#This method is ment to be called and return with an already existing session, so the logic to close the session must be handled by the caller	
		return roles

	def CreateRole(self, Id, roleInfo):
		session = self.GetDbSession()

		newRole = Role(RoleId=Id,
					   RoleName=roleInfo["RoleName"],
					   users=[],
					   groups=[])

		for user in roleInfo["Users"]:
			newRole.users.append(self.GetUsersInSession(session, user["Id"]))

		for group in roleInfo["Groups"]:
			newRole.groups.append(self.GetGroupsInSession(session, group["Id"]))

		result = self.InsertIntoDatabase(newRole, session)

		session.close()
		return result

	def UpdateRole(self, roleId, changes):
		session = self.GetDbSession()
		existingRole = session.query(Role).filter(Role.RoleId == roleId).first()

		if existingRole == None:
			return existingRole

		existingRole.RoleName = changes["RoleName"]

		existingRole.users.clear()
		for user in changes["Users"]:
			existingRole.users.append(self.GetUsersInSession(session, user["Id"]))

		existingRole.groups.clear()
		for group in changes["Groups"]:
			existingRole.groups.append(self.GetGroupsInSession(session, group["Id"]))

		session.add(existingRole)
		session.commit()

		updatedRoleInfo = existingRole.FullInfo()
		session.close()

		return updatedRoleInfo

	def DeleteRole(self, roleId):
		session = self.GetDbSession()

		role = session.query(Role).filter(Role.RoleId == roleId).first()

		if role is None:
			return False

		session.delete(role)
		session.commit()
		session.close()

		return True

	def InsertIntoDatabase(self, item, session):

		session.add(item)
		session.commit()
		return True


	def GetDbSession(self):
		engine = create_engine("sqlite:///db/Authentication.db")
		Base.metadata.bind = engine;
		DBSession = sessionmaker();
		DBSession.bind = engine
		s = DBSession()

		return s

