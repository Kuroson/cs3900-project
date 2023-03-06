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

  it("Login", () => {
    cy.location("pathname").should("eq", "/login");
    cy.get("#email-input").focus().type("cypress@test.com");
    cy.get("#outlined-password-input").focus().type("cypress1234"); // TODO: convert to env variable maybe
    cy.get("#submit-form-button").click();
    cy.wait(250);
    cy.get(".Toastify > div").should("not.exist"); // Error
    cy.location("pathname").should("eq", "/");
  });
});

// Prevent TypeScript from reading file as legacy script
export {};
