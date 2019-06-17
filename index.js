import Postmate from "postmate";

class BenefitJS {
  constructor(options, parentElem = null) {
    console.debug("constructor()", options, parentElem)
    let REQUIRED = ['key', 'amount', 'transactionId']
    for (let i = 0; i < REQUIRED.length; i++) {
      if (!options.hasOwnProperty(REQUIRED[i])) {
        console.error(`BenefitJS: Missing required parameter: ${REQUIRED[i]}`)
        return false
      }
    }

    // TODO: Validation

    this.key = options['key']
    this.checkoutUrl = options['checkoutUrl'] || process.env.CHECKOUT_URL || "https://checkout.benefitjs.com/"
    this.amount = options['amount']
    this.transactionId = options['transactionId']
    this.onComplete = options['onComplete'] || this.submitForm
    this.onCancel = options['onCancel']
    this.onClose = options['onClose']
    this.parentElem = parentElem

    // bind to prevent referencing issues
    this.show = this.show.bind(this)
    this._hide = this._hide.bind(this)

    // Trigger onLoad when DOM is ready
    if (document.readyState === "complete") {
      console.debug("document already loaded")
      this.loaded()
    } else {
      console.debug("wait for document to load")
      document.addEventListener("DOMContentLoaded", e => {
        console.debug("onload called", e.originalTarget.nodeName)
        if (e.originalTarget.nodeName == "#document") {
          // onload also triggers for IFRAMES, etc. We're only interested in
          // hooking to the document's onload
          // See: https://stackoverflow.com/a/3473876/2022751
          this.loaded()
        }
      })
    }
  }

  loaded() {
    console.debug("loaded()")
    const elem = document.createElement('div')
    elem.style.display = "none" // Prevent flash of unstyled content
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
      elem.style.display = "block" // restore, after styling it

      // handle events originating from child
      child.on('cancel', this.onCancel)
      child.on('complete', this.onComplete)
      child.on('close', this._hide) // hide, then trigger callback

      // let our child know we're all set..
      child.call('init', { key: this.key, amount: this.amount, transactionId: this.transactionId })

      if (this.openRequested) { this.show() }
    });
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

  // private methods
  _hide() {
    this.iframe.style.display = 'none'
    if (this.onClose) this.onClose()
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

  _submitForm() {
    if (!this.parentElem) {
      return false
    }

    if (this.parentElem.tagName.toUpperCase != "FORM") {
      console.error("BenefitJS: The parent element is not a FORM element. Aborting auto-submit")
    }

    this.parentElem.submit()
  }
}

// Attach to the window
window.BenefitJS = BenefitJS

if (document.currentScript && document.currentScript.dataset && document.currentScript.dataset.hasOwnProperty('key')) {
  // When 'data-key' attribute is set, trigger auto-initialize flow with data-* attributes
  (new BenefitJS(document.currentScript.dataset, document.currentScript.parentElement)).show()
}