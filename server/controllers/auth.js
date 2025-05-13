exports.register = async (req, res) => {
	try {
		const { email, password } = req.body
		if (!email || !password) {
			return res.status(400).json({message: "Email and Password is required"})
		}

		res.send("Hello Register")
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: "Server Error" })
	}
}

exports.login = async (req, res) => {
	try {
		res.send("Hello Login")
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: "Server Error" })
	}
}

exports.currentUser = async (req, res) => {
	try {
		res.send("Hello Current User")
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: "Server Error" })
	}
}
