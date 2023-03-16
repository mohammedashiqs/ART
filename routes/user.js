const express = require('express');
const { helpers } = require('handlebars');
const router = express.Router();
const productHelper = require('../helpers/product-helpers')
const userHelper = require('../helpers/user-helpers')

/* GET home page. */
router.get('/', (req, res) => {

  productHelper.getAllProducts().then((products) => {
    res.render('user/view-products', {products});
  })
 
  
});

router.get('/login', (req, res) => {
  res.render('user/login')
})

router.get('/signup', (req, res) => {
  res.render('user/signup')
})

router.post('/signup', (req, res) => {
  console.log(req.body)
  userHelper.doSignup(req.body).then((response) => {
    console.log(response)
  })
})

router.post('/login', (req, res) => {
  userHelper.doLogin(req.body).then((response) => {
    if(response.status){
      res.redirect('/')
    }else{
      res.redirect('/login')
    }
  })
})

module.exports = router;
