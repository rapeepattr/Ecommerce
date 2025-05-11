exports.create = async (req, res) => {
	try {
		res.send("Hello Create Category")
	} catch (error) {
		console.error(error)
		res.status(500).json({message: "Server Error"})
	}
}

exports.list = async (req, res) => {
	try {
		res.send("Hello Show Category")
	} catch (error) {
		console.error(error)
		res.status(500).json({message: "Server Error"})
	}
}

exports.remove = async (req, res) => {
	try {
		res.send("Hello Remove Category")
	} catch (error) {
		console.error(error)
		res.status(500).json({message: "Server Error"})
	}
}