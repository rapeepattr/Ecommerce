const prisma = require('../config/prisma')

exports.listUsers = async (req, res) => {
	try {
		const users = await prisma.user.findMany({
			select: {
				id: true,
				email: true,
				role: true,
			}
		})
		res.json(users)
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: "Server Error" })
	}
}

exports.changeStatus = async (req, res) => {
	try {
		const { id, enabled } = req.body
		const user = await prisma.user.update({
			where: {
				id: Number(id)
			},
			data: {
				enabled: enabled
			}
		})
		res.send("Change status successfully")
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: "Server Error" })
	}
}

exports.changeRole = async (req, res) => {
	try {
		const { id, role } = req.body
		const user = await prisma.user.update({
			where: {
				id: Number(id)
			},
			data: {
				role: role
			}
		})
		res.send("Change role successfully")
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: "Server Error" })
	}
}

exports.userCart = async (req, res) => {
	try {
		const { cart } = req.body
		const user = await prisma.user.findFirst({
			where: {
				id: Number(req.user.id)
			}
		})

		await prisma.productOnCart.deleteMany({
			where: {
				cart: {
					orderedById: user.id
				}
			}
		})

		await prisma.cart.deleteMany({
			where: {
				orderedById: user.id
			}
		})

		let products = cart.map((item) => ({
			productId: item.id,
			count: item.count,
			price: item.price
		}))

		let cartTotal = products.reduce((sum, item) => sum + item.price * item.count, 0)

		const newCart = await prisma.cart.create({
			data: {
				products: {
					create: products
				},
				cartTotal: cartTotal,
				orderedById: user.id
			}
		})
		res.send("Add Cart Successfully")
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: "Server Error" })
	}
}

exports.getUserCart = async (req, res) => {
	try {
		const cart = await prisma.cart.findFirst({
			where: {
				orderedById: Number(req.user.id)
			},
			include: {
				products: {
					include: {
						product: true
					}
				}
			}
		})
		res.json({
			products: cart.products,
			cartTotal: cart.cartTotal
		})
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: "Server Error" })
	}
}

exports.emptyCart = async (req, res) => {
	try {
		const cart = await prisma.cart.findFirst({
			where: {
				orderedById: Number(req.user.id)
			}
		})

		if (!cart) {
			return res.status(400).json({ message: "No Cart" })
		}

		await prisma.productOnCart.deleteMany({
			where: {
				cartId: cart.id
			}
		})

		const result = await prisma.cart.deleteMany({
			where: {
				orderedById: Number(req.user.id)
			}
		})

		res.json({
			message: "Clear Cart Successfully",
			deletedCount: result.count
		})
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: "Server Error" })
	}
}

exports.saveAddress = async (req, res) => {
	try {
		const { address } = req.body
		const userAddress = await prisma.user.update({
			where: {
				id: Number(req.user.id)
			},
			data: {
				address: address
			}
		})
		res.send({ message: "Update Address Successfully" })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: "Server Error" })
	}
}

exports.saveOrder = async (req, res) => {
	try {
		const { id, amount, status, currency } = req.body.paymentIntent;

		const userCart = await prisma.cart.findFirst({
			where: {
				orderedById: Number(req.user.id),
			},
			include: { products: true },
		});

		if (!userCart || userCart.products.length === 0) {
			return res.status(400).json({ ok: false, message: "Cart is Empty" });
		}

		const amountTHB = Number(amount) / 100;
		const order = await prisma.order.create({
			data: {
				products: {
					create: userCart.products.map((item) => ({
						productId: item.productId,
						count: item.count,
						price: item.price,
					})),
				},
				orderedBy: {
					connect: { id: req.user.id },
				},
				cartTotal: userCart.cartTotal,
				stripePaymentId: id,
				amount: amountTHB,
				status: status,
				currentcy: currency,
			},
		});
		const update = userCart.products.map((item) => ({
			where: { id: item.productId },
			data: {
				quantity: { decrement: item.count },
				sold: { increment: item.count },
			},
		}));

		await Promise.all(update.map((updated) => prisma.product.update(updated)));

		await prisma.cart.deleteMany({
			where: { orderedById: Number(req.user.id) },
		});
		res.json({ ok: true, order });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server Error" });
	}
};
exports.getOrder = async (req, res) => {
	try {
		const orders = await prisma.order.findMany({
			where: { orderedById: Number(req.user.id) },
			include: {
				products: {
					include: {
						product: true,
					},
				},
			},
		});
		if (orders.length === 0) {
			return res.status(400).json({ ok: false, message: "No orders" });
		}

		res.json({ ok: true, orders });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server Error" });
	}
};