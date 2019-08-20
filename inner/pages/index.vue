<template>
  <div id="modal" :class="{ 'open': isOpen, 'processing': isProcessing, 'error': isError }">
    <div class="dialog">
      <div class="container">
        <div class="headboard">
          <div class="item--title">{{title}}</div>
          <div class="item--subtitle">{{subtitle}}</div>
          <div class="close">
            <img src="~/static/images/close.svg" alt="Close modal" @click="onCancel" />
          </div>
        </div>
        <div class="main">
          <div class="field" :class="{ 'error': !!numberError }">
            <label for="card-number">Debit Card Number</label>
            <MaskedInput
              mask="card"
              id="card-number"
              type="tel"
              name="number"
              placeholder="•••• •••• •••• ••••"
              v-model="cardNumber"
              @blur="validateField('number')"
              autofocus
            />
            <!-- to handle on change, use @input -->
            <div class="field--error">{{ numberError }}</div>
          </div>
          <div class="field field--half" :class="{ 'error': !!expiryError }">
            <label>Expiry Date</label>
            <MaskedInput
              mask="expiry"
              id="card-expiry"
              type="tel"
              name="number"
              placeholder="MM/YY"
              v-model="cardExpiry"
              @blur="validateField('expiry')"
            />
            <div class="field--error">{{ expiryError }}</div>
          </div>
          <div class="field field--half" :class="{ 'error': !!pinError }">
            <label for="card-pin">
              ATM PIN
              <img src="~/static/images/question.svg" />
            </label>
            <input
              id="card-pin"
              type="password"
              name="number"
              placeholder="••••"
              v-model="cardPin"
              @blur="validateField('pin')"
            />
            <div class="field--error">{{ pinError }}</div>
          </div>
          <div class="field">
            <button
              class="btn btn-primary"
              @click="submit"
              :disabled="isProcessing || isError"
            >Pay BHD{{amount}}</button>
          </div>
        </div>

        <div class="benefit">
          <div class="benefit--text">
            This payment will be processed by
            <div class="large">The BENEFIT Company B.S.C</div>
          </div>
          <div class="benefit--img">
            <img src="~/static/images/benefit.svg" alt="BENEFIT" />
          </div>
        </div>

        <div class="secure">
          <img src="~/static/images/icon-lock.svg" alt="Connection encrypted" />
          Secured using 256 bit SSL encryption
        </div>
      </div>
    </div>
    <div class="backdrop"></div>
  </div>
</template>

<script>
import Postmate from "postmate";
import MaskedInput from "../components/masked-input";

export default {
  data() {
    return {
      isOpen: false,
      handshakeComplete: false,
      // Form params
      key: null,
      amount: null,
      cardNumber: null,
      cardExpiry: null,
      cardPin: null,
      transactionId: null,
      title: "",
      subtitle: "",
      // State flags, for styling
      isProcessing: false, // set after "Pay" button is clicked
      // Error state handling
      keyError: null,
      numberError: null,
      expiryError: null,
      pinError: null
    };
  },
  created() {
    if (process.client) {
      const handshake = new Postmate.Model({
        init: ({ key, amount, transactionId, title, subtitle }) => {
          this.handshakeComplete = true;
          this.key = key;
          this.amount = amount;
          this.transactionId = transactionId;
          this.title = title;
          this.subtitle = subtitle;
        },
        open: () => {
          this.isOpen = true;
        },
        reset: () => {
          // Hide and reset our state for the next potential run
          this.close();
          this.$router.go();
        }
      });

      handshake.then(parent => {
        this.parent = parent;
      });
    }
  },
  methods: {
    validateField(field) {
      let valid = false;
      let error = "Invalid field";

      switch (field) {
        case "number":
          valid = /^\d{16}$/.test(this.cardNumber);
          error = "Invalid card number";
          break;
        case "expiry":
          valid = /^1[0-2]|0[1-9]19|[2-9][0-9]$/.test(this.cardExpiry);
          error = "Invalid expiry";
          break;
        case "pin":
          valid = /^\d{4,}$/.test(this.cardPin);
          error = "Invalid PIN";
          break;
      }

      this[`${field}Error`] = valid ? null : error;
    },
    onCancel() {
      this.close();

      this.parent.emit("cancel");
    },
    onComplete() {
      this.close();

      this.parent.emit("complete"); // TODO: Return payment result
    },
    close() {
      this.isOpen = false;
      setTimeout(() => this.parent.emit("close"), 1000); // animation out
    },
    async submit() {
      if (this.cardExpiry.length != 4) return false;

      let month = parseInt(this.cardExpiry.substr(0, 2));
      let year = 2000 + parseInt(this.cardExpiry(2, 2));
      this.isProcessing = true;

      this.$axios.setHeader("Public-Key", this.key);
      this.$axios
        .$post("/pay", {
          amount: this.amount,
          transaction_id: this.transactionId,
          card_number: this.cardNumber,
          expiry_month: month,
          expiry_year: year,
          name: "Ahmed",
          pin: this.cardPin
        })
        .then(response => {
          this._onSuccess();
        })
        .catch(error => {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that was outside the 2xx range
            this._onError(error.response.data);
          } else if (error.request) {
            // The request was made but no response was received
            this._onError(
              "The request timed out. Please check your internet connection and try again"
            );
          } else {
            // Something happened in setting up the request that triggered an Error
            alert(error.message);
          }
          // `error.config` contains the original request sent
        })
        .finally(() => {
          this.isProcessing = false;
        });
    },
    _onError(body) {
      let param = body.param || "number";
      this[`${param}Error`] = body.message;
    },
    _onSuccess() {
      console.log("success!");
      this.onComplete();
    }
  },
  computed: {
    isError() {
      return (
        this.keyError || this.numberError || this.expiryError || this.pinError
      );
    }
  },
  components: {
    MaskedInput
  }
};
</script>

<style lang="scss" scoped>
html,
body {
  height: 100%;
}

.dialog {
  position: absolute;
  z-index: 100;
  width: 337px;
  height: 595px;
  margin: 0 auto;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -45%) scale(0.95);
  opacity: 0;
  /* applies when moving OUT of open state */
  transition: all 0.2s linear;
}
#modal.open .dialog {
  opacity: 1;
  transform: translate(-50%, -50%);
  /* applies when moving IN to open state */
  transition: all 0.4s cubic-bezier(0.76, -0.54, 0.49, 1.73) 0.25s;
}

.backdrop {
  background: radial-gradient(
    circle at center,
    rgba(0, 0, 0, 0.6) 0,
    rgba(0, 0, 0, 0.8) 100%
  );
  z-index: 99;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  pointer-events: none;
  /* applies when moving OUT of open state */
  transition: all 0.2s linear 0.2s;
}
#modal.open .backdrop {
  visibility: visible;
  opacity: 1;
  /* applies when moving IN to open state */
  transition: all 0.2s linear 0s;
  pointer-events: auto;
}

.container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #fff;
  border-radius: 10px;
}
.headboard {
  height: 126px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;

  background: url("~@/static/images/papyrus.png") repeat top left;
  text-align: center;
  border-radius: 10px 10px 0 0;
  border-bottom: 1px solid #eee;

  .item--title {
    font-size: 28px;
  }
  .item--subtitle {
    padding-top: 10px;
    font-size: 16px;
    color: #999;
  }
  .close {
    position: absolute;
    top: 10px;
    right: 15px;
    cursor: pointer;
  }
}

.main,
.benefit {
  padding: 0 22px;
}

.main {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 25px;

  .field {
    width: 100%;
    margin-bottom: 20px;
  }

  .field--half {
    flex: 0 50%;

    &:nth-child(even) {
      padding-right: 5px;
    }
    &:nth-child(odd) {
      padding-left: 5px;
    }
  }

  .field--error {
    color: #b45054;
    position: relative;
    left: 10px;
    top: 7px;
    max-height: 0; /* We animate max-height (since you can't animate height: auto) */
    /* 
      To animate out of error state, we would need to avoid clearing the error text since
      that will immediately collapse the element to zero-height. To do this, we could have
      and error flag separate from the error text.
      - Only "set" error text, without ever clearing it
      - Use error flag for showing/hiding error text
     */
  }

  .field.error .field--error {
    max-height: 3em;
    transition: max-height 1s cubic-bezier(0.17, 0.67, 0.83, 0.67); // animate-in to error
  }
}

form {
  width: 100%;
}

.btn {
  height: 54px;
  width: 100%;
  display: block;
  margin: 20px 0 30px;
  font-size: 20px;
  background: linear-gradient(to bottom, #ec2029, #d73239);
  border: 0;
  font-family: "OpenSans-Bold", "Helvetica Neue", Arial, sans-serif;
  color: #fff;
  border-radius: 4px;
  text-shadow: 0px 1px 1px rgba(0, 0, 0, 0.25);
  box-shadow: inset 0px 1px 1px #ec2029, inset 0px 2px 1px #ffffff;
  cursor: pointer;

  &:disabled {
    background: #999;
    box-shadow: inset 0 1px 1px #777;
    text-shadow: none;
    color: #ccc;
  }
}

label {
  text-transform: uppercase;
  font-size: 16px;
  display: block;
  line-height: 42px;
  margin-left: 10px;

  &[for="card-pin"] img {
    position: relative;
    top: 4px;
    cursor: pointer;
  }
}

.field input {
  height: 51px;
  width: 100%;
  padding: 3px 10px;
  border-radius: 4px;
  border: 1px solid #aaa;
  background: linear-gradient(to bottom, #fff, #f3f3f3);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.25);
  font-size: 18px;
  color: #666;
  letter-spacing: 2px;
}

.field.error input {
  background: linear-gradient(to bottom, #fef6f7, #f9e6e9);
  border: 2px solid #b45054;
  color: #b45054;
  box-shadow: 0 0 3px 1px rgba(200, 0, 0, 0.3);
}

.benefit {
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
}
.benefit--text {
  padding-top: 5px;
  font-size: 12px;
  width: 100%;
  line-height: 20px;

  .large {
    font-size: 16px;
    line-height: 34px;
  }
}
.benefit--img {
  width: 55px;
}

.secure {
  height: 36px;
  line-height: 36px;
  background: url("~@/static/images/papyrus.png") repeat top left;
  text-align: center;
  font-size: 13px;
  border-radius: 0 0 10px 10px;

  img {
    position: relative;
    top: 4px;
    left: -2px;
  }
}
</style>
