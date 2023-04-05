const express = require('express');
const { helpers } = require('handlebars');
const router = express.Router();
const productHelper = require('../helpers/product-helpers')
const userHelper = require('../helpers/user-helpers')

const verifyLogin = (req, res, next) => {
  if(req.session.user.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/', async (req, res) => {
  let user = req.session.user
  let cartCount = null
  if(req.session.user){
    cartCount = await userHelper.getCartCount(req.session.user._id)
  }
  
  productHelper.getAllProducts().then((products) => {
    res.render('user/view-products', {products, user, cartCount});
  })
 
  
});

router.get('/login', (req, res) => {
  if(req.session.user){
    res.redirect('/')
  }else{
    res.render('user/login', {loginError:req.session.userLoginError})
    req.session.userLoginError = false
  }
  
})

router.get('/signup', (req, res) => {
  res.render('user/signup')
})

router.post('/signup', (req, res) => {
  console.log(req.body)
  userHelper.doSignup(req.body).then((response) => {
    
    req.session.user = response   //now we can't get inserted doc detail as return so i have to change later
    req.session.user.loggedIn = true
    res.redirect('/')
  })
})

router.post('/login', (req, res) => {
  userHelper.doLogin(req.body).then((response) => {
    if(response.status){
      req.session.user = response.user
      req.session.user.loggedIn = true
      res.redirect('/')
    }else{
      req.session.userLoginError = "Invalid username or password"
      res.redirect('/login')
    }
  })
})

router.get('/logout', (req, res) => {
  req.session.user = null
  req.session.userLoggedIn = false
  res.redirect('/')
})

router.get('/cart', verifyLogin, async (req, res) => {
  let products = await userHelper.getCartProducts(req.session.user._id)
  let totalValue = 0;
  if(products.length>0){
    totalValue = await userHelper.getTotalAmount(req.session.user._id)
  }
  
  res.render('user/cart',{products, user: req.session.user, totalValue})
})


router.get('/add-to-cart/:id', (req, res) => {
  console.log("api call");
  userHelper.addToCart(req.params.id, req.session.user._id).then((response) => {
    res.json({status:true})
  })
})

router.post('/change-product-quantity', (req, res) => {
  userHelper.changeProductQuantity(req.body).then( async (response) => {
    response.total = await userHelper.getTotalAmount(req.body.user)
   res.json(response)
  })
})


router.post('/delete-Product', (req, res) => {
  userHelper.deleteProduct(req.body).then((response) => {
    res.json(response)
  })
})

router.get('/place-order', verifyLogin, async (req, res) => {
  let total = await userHelper.getTotalAmount(req.session.user._id)
  res.render('user/place-order',{total, user:req.session.user})
})

router.post('/place-order', async (req, res) => {
  let  products = await userHelper.getCartProductList(req.body.userId)
  let  totalPrice = await userHelper.getTotalAmount(req.body.userId)
     userHelper.placeOrder(req.body, products, totalPrice).then((orderId) => {
      if(req.body['payment-method'] === 'COD'){
      res.json({codSuccess: true})
      }else{
        userHelper.generateRazorpay(orderId, totalPrice).then((response) => {
          res.json(response)
        })
      }
     })
  
})

router.get('/order-success', verifyLogin, async (req, res) => {
  res.render('user/order-success', {user: req.session.user})
})

router.get('/orders', verifyLogin, async (req, res) => {
    await userHelper.getUserOrders(req.session.user._id).then((orders) => {
    res.render('user/orders', {orders, user: req.session.user})
  })
  
})

router.get('/view-order-products/:orderId', verifyLogin, (req, res) => {
    userHelper.viewOrderProducts(req.params.orderId).then((orderItems) => {
      res.render('user/view-order-products', {orderItems, user: req.session.user})
    })
})

router.post('/verify-payment', (req, res) => {
  console.log(req.body);
  userHelper.verifyPayment(req.body).then(() => {
    userHelper.changePaymentStatus(req.body['order[receipt]']).then(() => {
      console.log('Payment successfull');
      res.json({status:true})
    })
  }).catch((err) => {
    console.log(err);
    res.json({status: false, errMsg: ''})
  })
})

module.exports = router;
