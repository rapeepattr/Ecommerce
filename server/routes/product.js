const express = require('express')
const { create, list, remove, listby, searchFilter, update, read } = require('../controllers/product')
const router = express.Router()

router.post('/product', create)
router.get('/products/:count', list)
router.get('/product/:id', read)
router.put('/product/:id', update)
router.delete('/product/:id', remove)
router.post('/productby', listby)
router.post('/search/filters', searchFilter)

module.exports = router