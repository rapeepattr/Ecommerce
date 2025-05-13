const prisma = require('../config/prisma')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.register = async (req, res) => {
	try {
		const { email, password } = req.body
		if (!email || !password) {
			return res.status(400).json({ message: "Email and Password is required" })
		}

		const user = await prisma.user.findFirst({
			where: {
				email: email,
			}
		})

		if (user) {
			return res.status(400).json({ message: "Email is already exist" })
		} else {
			const hashPassword = await bcrypt.hash(password, 10)
			await prisma.user.create({
				data: {
					email: email,
					password: hashPassword
				}
			})
			res.send("Register Successfully")
		}
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: "Server Error" })
	}
}

exports.login = async (req, res) => {
	try {
		const { email, password } = req.body
		const user = await prisma.user.findFirst({
			where: {
				email: email,
			}
		})

		if (!user || !user.enabled) {
			return res.status(400).json({message: "User not found"})
		}

		const isMatch = await bcrypt.compare(password, user.password)
		
		if (!isMatch) {
			return res.status(400).json({message: "Invalid password"})
		} else {
			const payload = {
				id: user.id,
				email: user.email,
				role: user.role
			}

			jwt.sign(payload, process.env.SECRET_KEY, {
				expiresIn: '1d'
			}, (error, token) => {
				if (error) {
					return res.status(500).json({ message: "Server Error" })
				}
				res.json({ payload, token })
			})
		}
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
