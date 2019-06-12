class BenefitJS {
  constructor({ publicKey, onComplete = () => { }, onCancel = null, onClose = false, checkoutUrl = "https://checkout.benefitjs.com/" }) {

  }
}

// Attach to the window
window.BenefitJS = BenefitJS