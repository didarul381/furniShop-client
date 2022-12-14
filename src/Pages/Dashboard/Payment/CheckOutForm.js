import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import React, { useEffect, useState } from 'react';

const CheckOutForm = ({boking}) => {
    const[cardError,setCardError]=useState('');
    const[success,setSuccess]=useState('');
    const[transactionId,setTransactionId]=useState('');
    const [clientSecret, setClientSecret] = useState("");
    const[processing,setProcessing]=useState(false)
    const stripe = useStripe();
    const elements = useElements();
    const{price,email,  customerName ,_id}=boking;
    // const priceInt=price;

    useEffect(() => {
        // Create PaymentIntent as soon as the page loads
        //authorization:`bearer ${localStorage.getItem('accessToken')}`

        fetch("https://y-pearl-one.vercel.app/create-payment-intent", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            authorization:`bearer ${localStorage.getItem('accessToken')}`
         },
          body: JSON.stringify({price}),
        })
          .then((res) => res.json())
          .then((data) => setClientSecret(data.clientSecret));
      }, [price]);
    const handleSubmit= async(event)=>{
        event.preventDefault();
        if(!stripe || !elements){
            return
        }
        const card = elements.getElement(CardElement);

        if(card==null){
            return;
        }
        
    // Use your card Element with other Stripe.js APIs
    const {error, paymentMethod} = await stripe.createPaymentMethod({
        type: 'card',
        card,
      });
      if (error) {
        console.log( error);
        setCardError(error.message);
      } else {
        // console.log('[PaymentMethod]', paymentMethod);
        setCardError('');
      }
      setSuccess('');
      setProcessing(true)

      const {paymentIntent, error:confirmError} = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: card,
            billing_details: {
              name: customerName,
              
              email:email,
            },
          },
        },
      );

      if(confirmError){
        setCardError(confirmError.message);
        return;

      }
      console.log(paymentIntent)
      if( paymentIntent.status==="succeeded"){
               
      //  setSuccess('Congrates');
      //  setTransactionId(paymentIntent.id);
      //   //store data

        const payment={
          price,
          transactionId:paymentIntent.id,
          email,
          bookingId:_id
      
        }
        fetch('https://y-pearl-one.vercel.app/payments',{
          method:'POST',
          headers:{
            'content-type':'application/json',
            authorization:`bearer ${localStorage.getItem('accessToken')}`
        },
        body:JSON.stringify(payment)
        })
        .then(res=>res.json())
        .then(data=>{
            console.log(data);
            if(data.insertedId){
              setSuccess('Congartes!..')
              setTransactionId( paymentIntent.id)
      

            }
          
           
        })
       
      } setProcessing(false)
      
    }
    return (
     <>
        <form onSubmit={handleSubmit}>
      <CardElement
        options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            invalid: {
              color: '#9e2146',
            },
          },
        }}
      />
      <button className='btn btn-sm mt-4' type="submit" disabled={!stripe || !clientSecret || processing }>
        Pay
      </button>
    </form>
    <p>{cardError}</p>
    {
        success && <div>
            <p>{success}</p>
            <p>Your transactionId : {transactionId}</p>
        </div>
    } 
     </>
    );
};

export default CheckOutForm;