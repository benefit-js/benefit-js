<template>
  <input v-model="curValue" @input="onInput" @blur="onBlur" @keyup="applyMask($event)" />
</template>

<script>
const MASKS = {
  // Define your custom masks below
  card: raw => {
    let output = "";
    for (let i = 0; i < raw.length; i++) {
      output += raw[i];
      if ((i + 1) % 4 == 0 && i < 15) output += " ";
    }
    return output;
  },
  expiry: raw => {
    let output = "";
    for (let i = 0; i < raw.length; i++) {
      if (i == 0 && parseInt(raw[0]) > 1) output += "0";
      output += raw[i];

      if (output.length == 2) output += "/";
    }
    return output;
  }
};

// More context here: https://stackoverflow.com/a/52314934/2022751
export default {
  props: ["value", "mask"],
  data() {
    return {
      prevValue: null,
      curValue: ""
    };
  },
  methods: {
    onInput(e) {
      // We choose to emit the raw value, not the actual visible value since
      // that simplifies the parent component (no need to know about format)
      this.$emit("input", this.rawValue);
    },
    onBlur(e) {
      this.$emit("blur", e);
    },
    applyMask(e) {
      let lastChar = this.getLastChar();
      let rawInput = this.rawValue;
      const SPACERS = " /".split("");

      if (SPACERS.includes(lastChar) && e.keyCode == 8) {
        // backspace deleted the spacer but the user actually wanted to delete
        // the character *before* it
        rawInput = rawInput.slice(0, -1);
      }

      this.curValue = MASKS[this.mask](rawInput);
      this.prevValue = this.curValue;
    },
    getLastChar() {
      // in order to get the last character, we need to keep track of the
      // previous value of the input field. We use data-attrs to do this
      let lastChar = null;
      if (this.prevValue != this.curValue) {
        lastChar =
          this.prevValue && this.prevValue.length > this.curValue.length
            ? this.prevValue.substr(-1)
            : this.curValue.substr(-1);
      }
      return lastChar;
    }
  },
  computed: {
    rawValue() {
      return this.curValue.replace(/\D/g, "");
    }
  }
};
</script>