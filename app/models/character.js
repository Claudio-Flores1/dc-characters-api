const mongoose = require('mongoose')

const characSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		affiliation: {
			type: String,
			required: true,
		},
	},
)

module.exports = mongoose.model('Character', characSchema)