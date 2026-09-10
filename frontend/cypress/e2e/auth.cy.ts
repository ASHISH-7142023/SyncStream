describe('Authentication Flow', () => {
  it('should allow a user to register and login', () => {
    // Generate a random username for testing
    const username = `testuser_${Math.floor(Math.random() * 100000)}`;
    const email = `${username}@example.com`;
    const password = 'Password123!';

    // Register
    cy.visit('/register');
    cy.get('input[placeholder*="Username"]').type(username);
    cy.get('input[placeholder*="Email"]').type(email);
    cy.get('input[placeholder*="Password"]').type(password);
    cy.get('button[type="submit"]').click();

    // The app should auto-login and redirect to /dashboard
    cy.url().should('include', '/dashboard');
    cy.contains('Rooms').should('be.visible');

    // Logout
    cy.contains('Sign Out', { matchCase: false }).click();
    cy.url().should('include', '/login');

    // Login
    cy.get('input[placeholder*="Username"]').type(username);
    cy.get('input[placeholder*="Password"]').type(password);
    cy.get('button[type="submit"]').click();

    // Verify successful login
    cy.url().should('include', '/dashboard');
  });
});
