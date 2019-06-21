import Postmate from "postmate";

class BenefitJS {
  debug(...args) {
    /**
     * Use this instead of console.debug() as it respects the 'DEBUG_MODE'
     * environment variable
     */
    if (process.env.DEBUG_MODE) {
      console.debug(...args)
    }
  }

  constructor(options) {
    this.debug("constructor()", options)
    let REQUIRED = ['key', 'amount', 'transactionId']
    for (let i = 0; i < REQUIRED.length; i++) {
      if (!options.hasOwnProperty(REQUIRED[i])) {
        this.debug(`BenefitJS: Missing required parameter: ${REQUIRED[i]}`)
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

    // bind to prevent referencing issues
    this.debug = this.debug.bind(this)
    this.show = this.show.bind(this)
    this._hide = this._hide.bind(this)

    // Trigger onLoad when DOM is ready
    if (document.readyState === "complete") {
      this.debug("document already loaded")
      this.onLoad()
    } else {
      this.debug("wait for document to load")
      document.addEventListener("DOMContentLoaded", e => {
        this.debug("onload called", e.originalTarget.nodeName)
        if (e.originalTarget.nodeName == "#document") {
          // onload also triggers for IFRAMES, etc. We're only interested in
          // hooking to the document's onload
          // See: https://stackoverflow.com/a/3473876/2022751
          this.onLoad()
        }
      })
    }
  }

  onLoad() {
    this.debug("onLoad()")
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
      this._styleIframe(child.frame)
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

  _styleIframe(iframe) {
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
    const currentScript = BenefitJS.getCurrentScript();
    const parent = currentScript.parentElement

    if (!parent) {
      return false
    }

    if (parent.tagName.toUpperCase != "FORM") {
      this.debug("BenefitJS: The parent element is not a FORM element. Aborting auto-submit")
    }

    parent.submit()
  }

  // static methods
  static getCurrentScript() {
    var currentScript = document.currentScript || (function () {
      var scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();

    return currentScript
  }

  static autoload() {
    /**
     * Automatically initializes the BenefitJS class if a script element
     * is initialized with `data-*` params (a `data-key` param at minimum)
     */
    const currentScript = BenefitJS.getCurrentScript()

    if (currentScript.dataset && currentScript.dataset.hasOwnProperty('key')) {
      // When 'data-key' attribute is set, trigger auto-initialize flow
      console.debug("Auto-initialize flow starting..")
      const _instance = new BenefitJS(currentScript.dataset)

      let payButton = document.createElement('button')
      payButton.innerText = "Pay me now"
      payButton.style.padding = '10px 20px'
      payButton.style.border = '1px solid #ccc'
      payButton.style.borderRadius = '5px'
      payButton.style.background = 'linear-gradient(to bottom, #fff, #ccc)'
      payButton.style.fontSize = '16px'
      payButton.style.cursor = 'pointer'
      payButton.onclick = () => { _instance.show(); return false; }

      currentScript.parentElement.appendChild(payButton)
    }
  }
}

// Attach to the window
window.BenefitJS = BenefitJS
window.BenefitJS.autoload()