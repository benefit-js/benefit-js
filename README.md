![BenefitJS](./assets/benefit-js.png)

> Congratulations! You just found the *easiest* way to integrate with the BENEFIT payment system in Bahrain!

## 👋 About BenefitJS

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

## 💻 Local environment setup

1. Create a `.env.development` file with the following keys:
  - `CHECKOUT_URL=http://localhost:8080`, or whatever the local server URL is for your `[inner](https://github.com/benefit-js/benefit-js)` repository
2. Run `yarn run serve`

This should open up the `demo.html` file in your browser. Editing the `index.js` script should automagically reload your browser and keep things in sync!

### Deployment

The wrapper `index.js` script is deployed to `https://fast.benefitjs.com/benefit.js`, our global static CDN-hosted endpoint. 

Checkout is deployed at a separate endpoint at `https://checkout.benefitjs.com/`.

## 📩 Premium Support

Enterprise users are welcome to contact us at [sales@benefitjs.com](mailto:sales@benefitjs.com) for priority support plans for your organization. All other users may open an issue on this repository.

--

¹ **Note:** BenefitJS is not affiliated with The BENEFIT Company in Bahrain. This open source library is provided by contributors to help improve the payment experience for customers and companies in Bahrain. 

If you would like to contribute to this project, please review the CONTRIBUTING guidelines.
