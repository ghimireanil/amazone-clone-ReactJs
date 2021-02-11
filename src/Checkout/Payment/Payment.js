import React, { useState, useEffect } from 'react';
import CheckoutProduct from '../CheckoutProduct/CheckoutProduct';
import './Payment.css';
import { useStateValue } from '../../StateProvider';
import { Link, useHistory } from 'react-router-dom';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import CurrencyFormat from 'react-currency-format';
import { getBasketTotal } from '../../reducer';
import axios from '../../axios';
import { db } from '../../Firebase';

function Payment() {
  const [{ basket, user }, dispatch] = useStateValue();
  const history = useHistory();

  const stripe = useStripe();
  const elements = useElements();

  const [error, setError] = useState(null);
  const [disabled, setDisabled] = useState(true);

  const [processing, setProcessing] = useState('');
  const [succeeded, setSucceeded] = useState(false);
  const [clientSecret, setClientSecret] = useState(true);

  useEffect(() => {
    // generatesspecial stripe secret to charge customers
    const getClientSecret = async () => {
      const response = await axios({
        method: 'post',
        // stripe expects the total in currency subtotals
        url: `/payments/create?total=${getBasketTotal(basket) * 100}`,
      });
      setClientSecret(response.data.clientSecret);
    };
    getClientSecret();
  }, [basket]);

  console.log('The secret is >>>>', clientSecret);

  const handleSubmit = async (event) => {
    // do all fancy stripe stuffs
    event.preventDefault();
    setProcessing(true);

    const payload = await stripe
      .confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      })
      .then(({ paymentIntent }) => {
        //payment intent = payment confirmation
        db.collection('users')
          .doc(user?.uid)
          .collection('orders')
          .doc(paymentIntent.id)
          .set({
            basket: basket,
            amount: paymentIntent.amount,
            created: paymentIntent.created,
          });

        setSucceeded(true);
        setError(null);
        setProcessing(false);

        dispatch({
          type: 'EMPTY_BASKET',
        });

        history.replace('/orders');
      });
  };

  const handleChange = (event) => {
    // listen for changes in card and display error as customer tpes card details
    setDisabled(event.empty);
    setError(event.error ? event.error.message : '');
  };

  return (
    <div className='payment'>
      <div className='payment_container'>
        <h1>
          Checkout (<Link to='/checkout'>{basket?.length} items</Link>)
        </h1>

        {/* payment section - delvery address */}
        <div className='payment_section'>
          <div className='payment_title'>
            <h3>Delivery Address</h3>
          </div>
          <div className='payment_address'>
            <p>{user?.email}</p>
            <p>84th St, Northern Blvd</p>
            <p>New York, NY, 11372</p>
          </div>
        </div>

        {/* payment section - review Items */}
        <div className='payment_section'>
          <div className='payment_title'>
            <h3>Review Items and delivery</h3>
          </div>
          <div className='payment_items'>
            {basket.map((item) => (
              <CheckoutProduct
                id={item.id}
                title={item.title}
                image={item.image}
                price={item.price}
                rating={item.rating}
              />
            ))}
          </div>
        </div>
      </div>

      {/* payment section - payment method */}
      <div className='payment_section'>
        <div className='payment_title'>
          <h3>Payment Method</h3>
        </div>
        <div className='payment_details'>
          {/* stripe will go here */}
          <form onSubmit={handleSubmit}>
            <CardElement onChange={handleChange} />

            <div className='payment_priceContainer'>
              <CurrencyFormat
                renderText={(value) => <h3>Order Total: {value}</h3>}
                decimalScale={2}
                value={getBasketTotal(basket)}
                displayType={'text'}
                thousandSeperator={true}
                prefix={'$'}
              />
              <button disabled={processing || disabled || succeeded}>
                <span>{processing ? <p>Processing</p> : 'Buy Now'}</span>
              </button>
            </div>
            {/* If there is any error */}
            {error && <div>{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Payment;
