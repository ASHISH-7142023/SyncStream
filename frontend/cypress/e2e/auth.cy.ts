describe('Authentication Flow', () => {
  beforeEach(() => {
    // Mock the backend API calls so the frontend can be tested in isolation
    cy.intercept('POST', '**/api/auth/register', {
      statusCode: 200,
      body: {
        token: 'mock-jwt-token',
        userId: '1',
        username: 'testuser'
      }
    }).as('register');

    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'mock-jwt-token',
        userId: '1',
        username: 'testuser'
      }
    }).as('login');

    cy.intercept('GET', '**/api/auth/me', {
      statusCode: 200,
      body: {
        id: '1',
        username: 'testuser'
      }
    }).as('authMe');

    cy.intercept('POST', '**/api/crypto/keys', {
      statusCode: 200,
      body: { success: true }
    }).as('cryptoKeys');

    cy.intercept('GET', '**/api/rooms*', {
      statusCode: 200,
      body: []
    }).as('getRooms');
  });

  it('should allow a user to register and login', () => {
    const username = `testuser_${Math.floor(Math.random() * 100000)}`;
    const email = `${username}@example.com`;
    const password = 'Password123!';

    // Register
    cy.visit('/register');
    cy.get('input[id="displayName"]').type('Test User');
    cy.get('input[id="username"]').type(username);
    cy.get('input[id="email"]').type(email);
    cy.get('input[id="password"]').type(password);
    cy.get('input[id="confirmPassword"]').type(password);
    cy.get('input[id="terms"]').check({ force: true });
    cy.get('button[type="submit"]').click();

    cy.wait('@register');

    // The app should auto-login and redirect to /dashboard
    cy.url().should('include', '/dashboard');
    cy.contains('Rooms', { matchCase: false }).should('be.visible');

    // Logout
    cy.get('button[title="Log Out"]').click();
    cy.url().should('include', '/login');

    // Login
    cy.get('input[id="email"]').type(email);
    cy.get('input[id="password"]').type(password);
    cy.get('button[type="submit"]').click();

    cy.wait('@login');

    // Verify successful login
    cy.url().should('include', '/dashboard');
  });
});
