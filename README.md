![BenefitJS](./assets/benefit-js.png)

> Congratulations! You just found the *easiest* way to integrate with the BENEFIT payment system in Bahrain!

## 👋 About

BenefitJS¹ is a simple, open-source library that allows you to accept BENEFIT payments through a modern, reliable interface that is optimized around the User Experience. 

It was born out of a frustration with the verbose, cryptic and unappealing integration process that comes standard with BENEFIT integrations.

BenefitJS provides:
- 📱 A stunning **mobile-first** user experience that massively improves upon the default Benefit integration
- 🙌 **Same-page checkout** (finally!) using a sleek, modern modal dialog
- 😍 Additional features, including support for one-click checkout (or "Tokenization", in payments lingo)
- 📧 **Premium support**, available to Enterprise customers (more [below](#-premium-support))

## 👉 How it looks

This is what the default (and rather distasteful) Benefit integration looks like:

![Benefit - Before](./assets/benefit-before.png)

.. and here's what the BenefitJS checkout page looks like:

![Benefit - After](./assets/benefit-after.png)

## ⚡ Getting Started

This project consists of two main parts:

1. An `index.js` that creates an `<iframe>` in the parent window, or opens a separate window on mobile devices.
2. Checkout, a Vue application with the actual Checkout form, is added as a submodule at [`inner/`](https://github.com/benefit-js/inner/tree/). 

Since the two projects are tightly coupled, we track them jointly through this repository.

### Using Benefit.js

To integrate using Benefit.js, you'll need an account with BENEFIT. If you don't already have one, [sign up for a BENEFIT account through Credimax](https://www.credimax.com.bh/en/e_payment_gateway)

Assuming you have an account, you can now:

1. Register for a BenefitJS account at [https://benefitjs.com](https://benefitjs.com/?utm_source=github)
2. Upload your `resource.cgn` file to the Dashboard, and receive your public key.
3. Integrate BenefitJS into your website using the sample code below:

```html
<form action="/pay" method="POST">
  <script 
    src="https://fast.benefitjs.com/benefit.js"
    data-key="key_..."
    data-transaction-id="19201"
    data-amount="12.345">
  </script>
  <!-- renders 'pay' button, submits form when done -->
</form>
```

.. or the more advanced custom mode:

```javascript
const benefitHandler = new BenefitJS({
  publicKey: 'pk_abc123',
  transactionId: '12910',
  amount: 1.2,
  onClose: () => {
    console.warn('onClose() called')
  },
  onCancel: () => {
    console.warn('onCancel() called')
  },
  onComplete: () => {
    console.info('onComplete() called')
  }
})
```

### First-time local setup

1. Create a `.env.development` file with the following keys:
    - `CHECKOUT_URL=http://localhost:8080`, or whatever the local server URL is for your [`inner`](https://github.com/benefit-js/benefit-js) repository
    - `DEBUG_MODE=true`, to enable debug messages in the browser console
2. Run `yarn run serve`

This should open up the `demo.html` file in your browser. Editing the `index.js` script should automagically reload your browser and keep things in sync!

To update to the latest version of `inner`, simply run `git submodule update --remote` from the `inner/` directory.

### Deployment

The wrapper `index.js` script is deployed to `https://fast.benefitjs.com/benefit.js`, our global static CDN-hosted endpoint. 

Checkout is deployed at a separate endpoint at `https://checkout.benefitjs.com/`.

## 📩 Premium Support

Enterprise users are welcome to contact us at [sales@benefitjs.com](mailto:sales@benefitjs.com) for priority support plans for your organization. All other users may open an issue on this repository.

--

¹ **Note:** BenefitJS is not affiliated with The BENEFIT Company in Bahrain. This open source library is provided by contributors to help improve the payment experience for customers and companies in Bahrain. 

If you would like to contribute to this project, please review the CONTRIBUTING guidelines.
