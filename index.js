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

    document.body.appendChild(elem)

    // handshake with our child
    const handshake = new Postmate({
      container: elem,
      url: this.checkoutUrl // this url better have postmate.js installed
    });

    handshake.then(child => {
      this.child = child
      this._styleElem(child.frame)
      this.iframe = child.frame

      // handle events originating from child
      child.on('cancel', this.onCancel)
      child.on('complete', this.onComplete)
      child.on('close', this._hide) // hide, then trigger callback

      // let our child know we're all set..
      child.call('init', { publicKey, amount, transactionId })

      if (this.openRequested) { this.show() }
    });

    // bind to prevent referencing issues
    this.show = this.show.bind(this)
    this._hide = this._hide.bind(this)
  }

  show() {
    if (!this.iframe) {
      // not ready yet..
      this.openRequested = true;
      return;
    }

    window.requestAnimationFrame(() => {
      this.iframe.style.display = 'block'
      this.child.call('open')
    });
  }

  _hide() {
    this.iframe.style.display = 'none'
    this.onClose()
  }

  _styleElem(iframe) {
    iframe.allowTransparency = true

    iframe.style.display = 'none'
    iframe.style.position = 'fixed'
    iframe.style.width = '100%'
    iframe.style.height = '100%'
    iframe.style.left = 0
    iframe.style.top = 0
    iframe.style.border = 0
    iframe.style.zIndex = '2147483647'
  }
}

// Attach to the window
window.BenefitJS = BenefitJS