// empty
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  // This is especially useful to ignore WebSocket connection errors when testing frontend in isolation
  return false
});
