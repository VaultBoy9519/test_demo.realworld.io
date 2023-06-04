const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    defaultCommandTimeout: 10000,
    baseUrl: "https://demo.realworld.io/",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    }
  }
});
