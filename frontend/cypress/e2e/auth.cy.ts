describe("Login tests", () => {
  beforeEach(() => {
    indexedDB.deleteDatabase("firebaseLocalStorageDb"); // Reset firebase localstorage login
    cy.viewport(1920, 1080);
    cy.visit("http://localhost:3000/signup");
  });

  const firstName = "Cypress";
  const lastName = "Testing";
  const email = `${firstName}${Date.now()}@${lastName}.com`;
  const adminEmail = `${firstName}${Date.now()}@admin.com`;
  const password = "cypress1234!";

  it("Try to login before sign up", () => {
    cy.visit("http://localhost:3000/login");
    cy.get("#email-input").focus().type(email);
    cy.get("#outlined-password-input").focus().type(password);
    cy.get("#submit-form-button").click();
    cy.wait(250);
    cy.get(".Toastify > div").should("exist"); // Error
    cy.get(".Toastify > div").contains("User not found");
  });

  it("Sign up for an instructor account", () => {
    cy.get("#first-name-input").focus().type(firstName);
    cy.get("#last-name-input").focus().type(lastName);
    cy.get("#email-input").focus().type(adminEmail);
    cy.get("#outlined-password-input").focus().type(password);
    cy.get("#outlined-confirm-password-input").focus().type(password);
    cy.get("#submit-form-button").click();
    cy.wait(2000);
    cy.location("pathname").should("eq", "/instructor");
    cy.get("h1").contains("Welcome, Cypress Testing");
    cy.get("#userRole").contains("Instructor");
  });

  it("Sign up for a student account", () => {
    cy.get("#first-name-input").focus().type(firstName);
    cy.get("#last-name-input").focus().type(lastName);
    cy.get("#email-input").focus().type(email);
    cy.get("#outlined-password-input").focus().type(password);
    cy.get("#outlined-confirm-password-input").focus().type(password);
    cy.get("#submit-form-button").click();
    cy.wait(2000);
    cy.location("pathname").should("eq", "/");
    cy.get("h1").contains("Welcome, Cypress Testing");
    cy.get("#userRole").contains("Student");
  });
});

// Prevent TypeScript from reading file as legacy script
export {};
