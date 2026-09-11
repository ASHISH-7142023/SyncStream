describe('Authentication Flow', () => {
  beforeEach(() => {
    // Mock the backend API calls so the frontend can be tested in isolation
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 200,
      body: {
        token: 'mock-jwt-token',
        user: { id: '1', username: 'testuser', email: 'test@example.com' }
      }
    }).as('register');

    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'mock-jwt-token',
        user: { id: '1', username: 'testuser', email: 'test@example.com' }
      }
    }).as('login');

    cy.intercept('GET', '/api/rooms', {
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
    cy.get('input[placeholder*="Username"]').type(username);
    cy.get('input[placeholder*="Email"]').type(email);
    cy.get('input[placeholder*="Password"]').type(password);
    cy.get('button[type="submit"]').click();

    cy.wait('@register');

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

    cy.wait('@login');

    // Verify successful login
    cy.url().should('include', '/dashboard');
  });
});
