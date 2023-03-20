describe("Login tests", () => {
  beforeEach(() => {
    indexedDB.deleteDatabase("firebaseLocalStorageDb"); // Reset firebase localstorage login
    cy.viewport(1920, 1080);
    cy.visit("http://localhost:3000/");
  });

  it("Try to login with bad password", () => {
    cy.location("pathname").should("eq", "/login");
    cy.get("#email-input").focus().type("cypress@test.com");
    cy.get("#outlined-password-input").focus().type("password");
    cy.get("#submit-form-button").click();
    cy.wait(250);
    cy.get(".Toastify > div").should("exist"); // Error
  });

  // NOTE: This test is kinda bad, assumes that this account already exists.
  // Should remove this
  it("Login", () => {
    cy.location("pathname").should("eq", "/login");
    cy.get("#email-input").focus().type("cypressloginaccount@cypress.com");
    cy.get("#outlined-password-input").focus().type("Password123!"); // TODO: convert to env variable maybe
    cy.get("#submit-form-button").click();
    cy.wait(250);
    cy.get(".Toastify > div").should("not.exist"); // Error
    cy.location("pathname").should("eq", "/");
    cy.get("h1").contains("Welcome, Cypress Account");
  });
});

// Prevent TypeScript from reading file as legacy script
export {};
