from flask import Flask, jsonify, request
from flask_restful import Resource


class SaveFile(object):

	def __init__(self, Id, difficulty, fileName, level, health):
		self.Id = Id
		self.Difficulty = difficulty
		self.FileName = fileName
		self.Level = level
		self.Health = health


class GameSave(Resource):

	

	def get(self, Id=None):
		if Id:
			for saveFile in saveFiles:
				if Id == saveFile.Id:
					return saveFile.__dict__, 200

			return "Save File Not Found", 404

		else:

			formattedSaveFiles = []

			for saveFile in saveFiles:
				formattedSaveFiles.append(saveFile.__dict__);

			return formattedSaveFiles, 200

	def post(self):

		payload = request.get_json();

		newSave = SaveFile(payload["Id"], payload["Difficulty"], payload["FileName"], payload["Level"], payload["Health"])

		saveFiles.append(newSave)

		return newSave.__dict__, 201


saveFiles = [
		SaveFile(1, "Easy", "/SaveFile1", "Level1", 100),
		SaveFile(2, "Medium", "/SaveFile2", "Level 4", 150),
		SaveFile(3, "Hard", "/SaveFile3", "Level 2", 75)
	]

