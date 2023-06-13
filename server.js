require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());
const bodyParser = require('body-parser');
// Middleware to parse JSON data
app.use(bodyParser.json());
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// console.log(process.env.STRIPE_SECRET_KEY)

app.get('/get-user', async (req, res) => {
  res.json({"users": ['one', 'two', 'three']});
});

app.post('/payment-sheet', async (req, res) => {
  // Use an existing Customer ID if this is a returning customer.
  const {amount} = req.body ;
  const amountInPence = Math.round(parseFloat(amount) * 100);
  const customer = await stripe.customers.create();
  const ephemeralKey = await stripe.ephemeralKeys.create(
    {customer: customer.id},
    {apiVersion: '2020-08-27'}
  );
  try {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInPence,
    currency: 'gbp',
    customer: customer.id,
    payment_method_types: ['card'],
    // automatic_payment_methods: {
    //   enabled: true,
    // },
  });
  res.json({
    paymentIntent: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
    publishableKey: process.env.STRIPE_PUBlISHABLE_KEY
  });
} catch (error) {
  console.log('Error', error);
  res.status(500).json({error: 'Failed to create payment'});
}
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
