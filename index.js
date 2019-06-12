import Postmate from "postmate";

class BenefitJS {
  constructor({ publicKey, onComplete = () => { }, onCancel = null, onClose = null, checkoutUrl = null, amount, transactionId }) {
    const elem = document.createElement('div')

    this.publicKey = publicKey
    this.checkoutUrl = checkoutUrl || process.env.CHECKOUT_URL || "https://checkout.benefitjs.com/"
    this.amount = amount
    this.transactionId = transactionId
    this.onComplete = onComplete
    this.onCancel = onCancel
    this.onClose = onClose

    // hide to prevent flash of unstyled content
    elem.style.display = 'none'
    document.body.appendChild(elem)

    // handshake with our child
    const handshake = new Postmate({
      container: elem,
      url: this.checkoutUrl // this url better have postmate.js installed
    });

    handshake.then(child => {
      this.child = child
      this.iframe = child.frame

      // handle events originating from child
      child.on('cancel', this.onCancel)
      child.on('complete', this.onComplete)
      child.on('close', this.hide) // hide, then trigger callback

      // let our child know we're all set..
      child.call('init', { publicKey, amount, transactionId })

      if (this.openRequested) { this.show() }
    });

    // bind to prevent referencing issues
    this.show = this.show.bind(this)
    this.hide = this.hide.bind(this)
  }

  show() {
    if (!this.iframe) {
      // not ready yet..
      this.openRequested = true;
      return;
    }

    window.requestAnimationFrame(() => {
      this.child.call('open')
    });
  }

  hide() {
    this.child.call('reset')

    // trigger the close callback after closing the iframe
    this.onClose()
  }
}

// Attach to the window
window.BenefitJS = BenefitJS