describe("empty spec", () => {
  it("passes", () => {
    cy.visit("http://localhost:3000");
  });
});

// Prevent TypeScript from reading file as legacy script
export {};
