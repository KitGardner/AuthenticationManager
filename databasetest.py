from dataModels import User, Group, Role, UserGroup, GroupRole, UserRole, Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import uuid

engine = create_engine("sqlite:///db/Authentication.db")
Base.metadata.bind = engine;

DBSession = sessionmaker();
DBSession.bind = engine


session = DBSession()

adminUser = User(
	UserId=str(uuid.uuid4()),
	FirstName="Kit",
	LastName="Gardner",
	Email="Gamesdevkit@gmail.com",
	Password="tsukiyomi",
	UserGroups=[],
	UserRoles=[])

roles = [
	Role(RoleId=str(uuid.uuid4()),RoleName='User'),
	Role(RoleId=str(uuid.uuid4()),RoleName='Sys Admin'),
	Role(RoleId=str(uuid.uuid4()),RoleName='Group Manager'),
	Role(RoleId=str(uuid.uuid4()),RoleName='Role Manager'),
	Role(RoleId=str(uuid.uuid4()),RoleName='Data Manager')
]

groups = [
	Group(GroupId=str(uuid.uuid4()),GroupName="Administrator", groupRoles=roles),
	Group(GroupId=str(uuid.uuid4()),GroupName="Data Admin", groupRoles=[roles[0], roles[1], roles[4]]),
	Group(GroupId=str(uuid.uuid4()),GroupName="Tester", groupRoles=[roles[0]])
]

for role in roles:
	session.add(role)

for group in groups:
	session.add(group)

session.commit()

adminUser.UserGroups = groups
adminUser.UserRoles = roles


session.add(adminUser)

#adminGroup = session.query(Group).filter(Group.GroupName == "Administrator").one()

#adminGroupRoles = []
#for role in roles:
	#session.add(GroupRoles(GroupId=adminGroup.GroupId, RoleId=role.RoleId))

#session.add(UserGroup(UserId=adminUser.UserId, GroupId=adminGroup.GroupId))
session.commit();
session.close()


