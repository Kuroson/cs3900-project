describe("Admin Workflow", () => {
  before(() => {
    // indexedDB.deleteDatabase("firebaseLocalStorageDb"); // Reset firebase localstorage login
  });

  beforeEach(() => {
    cy.viewport(1920, 1080);
  });

  const firstName = "Cypress";
  const lastName = "Workflow";
  const dateNow = Date.now();
  const email = `${firstName}${dateNow}@${lastName}.com`.toLowerCase();
  const adminEmail = `${firstName}${dateNow}@admin.com`.toLowerCase();
  const password = "cypress1234!";

  const pageWeek1 = "Week 1";
  const pageWeek2 = "Week 2";
  const pageWeek3 = "Week 3"; // To be deleted

  const description = `OOPs\n${dateNow}`;
  const courseCode = `COMP2511${dateNow}`;
  const title = "Art of Software";
  const session = "23T1";

  const resource1Title = "Resource 1";
  const resource1Description = "Resource 1 Description";
  const resource1FileName = "cs251123t1-SetupTroubleshooting.pdf";

  const resource2Title = "Resource 2";
  const resource2Description = "Resource 2 Description";
  const resource2TitleEdited = "Resource 2 Edited";
  const resource2DescriptionEdited = "Resource 2 Description Edited";

  const resource3Title = "Resource 3"; // eventually deleted
  const resource3Description = "Resource 3 Description"; // eventually deleted

  it("Sign up for a student account", () => {
    indexedDB.deleteDatabase("firebaseLocalStorageDb"); // Reset firebase localstorage login
    cy.visit("http://localhost:3000/signup");
    cy.get("#first-name-input").focus().type(firstName);
    cy.get("#last-name-input").focus().type(lastName);
    cy.get("#email-input").focus().type(email);
    cy.get("#outlined-password-input").focus().type(password);
    cy.get("#outlined-confirm-password-input").focus().type(password);
    cy.get("#submit-form-button").click();
    cy.wait(2000);
    cy.location("pathname").should("eq", "/");
    cy.get("h1").contains(`Welcome, ${firstName} ${lastName}`);
    cy.get("#userRole").contains("Student");
    cy.wait(1000);
  });

  it("Sign up for an instructor account", () => {
    indexedDB.deleteDatabase("firebaseLocalStorageDb"); // Reset firebase localstorage login
    cy.visit("http://localhost:3000/signup");
    cy.get("#first-name-input").focus().type(firstName);
    cy.get("#last-name-input").focus().type(lastName);
    cy.get("#email-input").focus().type(adminEmail);
    cy.get("#outlined-password-input").focus().type(password);
    cy.get("#outlined-confirm-password-input").focus().type(password);
    cy.get("#submit-form-button").click();
    cy.wait(2000);
    cy.location("pathname").should("eq", "/instructor");
    cy.get("h1").contains(`Welcome, ${firstName} ${lastName}`);
    cy.get("#userRole").contains("Instructor");
    cy.wait(1000);
  });

  it("Test dashboard nav buttons after signup", () => {
    cy.visit("http://localhost:3000");
    cy.location("pathname").should("eq", "/instructor");
    // Click Dashboard
    cy.get("#navbar").contains("Dashboard").click();
    cy.location("pathname").should("eq", "/instructor");
    // Click Instructor Allocation
    cy.get("#navbar").contains("Instructor allocation").click();
    cy.location("pathname").should("eq", "/instructor/instructor-allocation");
    // Click Create Course
    cy.get("#navbar").contains("Create Course").click();
    cy.location("pathname").should("eq", "/instructor/create-course");
    // Go back to dashboard
    cy.get("#navbar").contains("Dashboard").click();
    cy.location("pathname").should("eq", "/instructor");
  });

  // it("Create a course and add details", () => {
  //   cy.visit("http://localhost:3000/instructor");
  //   // Click create course button
  //   cy.get('[data-cy="createCourseDiv"]').click();
  //   cy.location("pathname").should("eq", "/instructor/create-course");

  //   // Create course
  //   cy.get("#CourseCode").focus().type(courseCode);
  //   cy.get("#Title").focus().type(title);
  //   cy.get("#Session").focus().type(session);
  //   cy.get("#Description").focus().type(description);
  //   cy.get("#Tags").type("hello,world");
  //   cy.get("#create-course-button").click();
  //   cy.wait(500);
  //   cy.get(".Toastify__toast-body").contains("Course created successfully");

  //   // // Check page has details
  //   cy.get("h1").contains(title);

  //   // Go back to dashboard and check course is there
  //   cy.get("#navbar").contains("Dashboard").click();
  //   cy.location("pathname").should("eq", "/instructor");
  //   cy.get("h3").contains(courseCode).click();
  //   // cy.location("pathname").should("not.eq", location);
  //   cy.get("h1").contains(title);

  //   // Add student to course
  //   cy.get("#navbar").contains("Students").click();
  //   cy.location("pathname").should("contain", "/students");
  //   cy.get("#student-email").focus().type(email);
  //   cy.get("button").contains("Add Student").click();
  //   cy.get(".Toastify__toast-body").contains("Student added successfully");

  //   // Go back to course home page
  //   cy.get("#navbar").contains("Home").click();
  //   // cy.location("pathname").should("eq", `${location}`);

  //   // Add new page "Week 1"
  //   cy.get("#addNewPage").click();
  //   cy.get("#RadioOtherPage").click(); // Select other page
  //   cy.get("#OtherPageName").focus().type(pageWeek1);
  //   cy.get("button").contains("Add new page").click(); // Create
  //   cy.get("#navbar").contains(pageWeek1);

  //   // Create week2
  //   cy.get("#addNewPage").click();
  //   cy.get("#RadioOtherPage").click(); // Select other page
  //   cy.get("#OtherPageName").focus().type(pageWeek2);
  //   cy.get("button").contains("Add new page").click(); // Create
  //   cy.get("#navbar").contains(pageWeek2);

  //   // Create week2
  //   cy.get("#addNewPage").click();
  //   cy.get("#RadioOtherPage").click(); // Select other page
  //   cy.get("#OtherPageName").focus().type(pageWeek3);
  //   cy.get("button").contains("Add new page").click(); // Create
  //   cy.get("#navbar").contains(pageWeek3);

  //   // Click on week1
  //   cy.get("#navbar").contains(pageWeek1).click();

  //   // Create Resource1 for Week 1
  //   cy.get("button").contains("Add New Resource").click();
  //   cy.get("#ResourceTitle").focus().type(resource1Title);
  //   cy.get("#ResourceDescription").focus().type(resource1Description);
  //   cy.get("#uploadResourceMaterial").selectFile(`cypress/fixtures/${resource1FileName}`);
  //   cy.get("#createResourceButton").click();

  //   // Check Resource1 Created
  //   cy.get("span").contains(resource1Title);
  //   cy.get("p").contains(resource1Description);
  //   // check if file download exists
  //   cy.get(`[data-cy="section-${resource1Title}"] > div > a > button`).contains("Download File");
  //   cy.get(`[data-cy="section-${resource1Title}"] > div > a`).should("have.attr", "href");

  //   // Create Resource2 for Week 1
  //   cy.get("button").contains("Add New Resource").click();
  //   cy.get("#ResourceTitle").focus().type(resource2Title);
  //   cy.get("#ResourceDescription").focus().type(resource2Description);
  //   cy.get("#createResourceButton").click();

  //   // Check Resource2 Created
  //   cy.get("span").contains(resource2Title);
  //   cy.get("p").contains(resource2Description);

  //   // Create Resource3 for Week 1
  //   cy.get("button").contains("Add New Resource").click();
  //   cy.get("#ResourceTitle").focus().type(resource3Title);
  //   cy.get("#ResourceDescription").focus().type(resource3Description);
  //   cy.get("#createResourceButton").click();

  //   // Check Resource3 Created
  //   cy.get("span").contains(resource3Title);
  //   cy.get("p").contains(resource3Description);

  //   // Edit Resource 2
  //   cy.get(
  //     `[data-cy="section-${resource2Title}"] > [data-cy="edit-button-section"] > div > [data-cy="edit-button"]`,
  //   ).click();
  //   cy.get("#ResourceTitle").focus().clear().type(resource2TitleEdited);
  //   cy.get("#ResourceDescription").focus().clear().type(resource2DescriptionEdited);
  //   cy.get('[data-cy="current-edit"] > div > div > [data-cy="edit-button"]').click();

  //   // Check Resource2 Edited
  //   cy.get("span").contains(resource2TitleEdited);
  //   cy.get("p").contains(resource2DescriptionEdited);

  //   // Delete resource3
  //   cy.get(
  //     `[data-cy="section-${resource3Title}"] > [data-cy="edit-button-section"] > div > [data-cy="delete-button"]`,
  //   ).click();
  //   cy.get("span").contains(resource3Title).should("not.exist");
  //   cy.get("p").contains(resource3Description).should("not.exist");

  //   // Delete a page (pageWeek3)
  //   cy.get("#navbar").contains(pageWeek3).click();
  //   cy.wait(1000);
  //   // cy.location("pathname").should("not.eq", `${location}`);
  //   cy.get("#deletePageButton").click();

  //   // Check deleted and redirected
  //   cy.get("#navbar").contains(pageWeek3).should("not.exist");
  //   // cy.location("pathname").should("eq", `${location}`);
  //   cy.wait(2000);
  // });

  // it("Login as student", () => {
  //   indexedDB.deleteDatabase("firebaseLocalStorageDb"); // Reset firebase localstorage login
  //   cy.visit("http://localhost:3000/login");
  //   cy.get("#email-input").focus().type(email);
  //   cy.get("#outlined-password-input").focus().type(password);
  //   cy.get("#submit-form-button").click();
  //   cy.wait(250);
  //   cy.get(".Toastify > div").should("not.exist"); // Error
  //   cy.location("pathname").should("eq", "/");
  // });

  // it("Check course details match students perspective", () => {
  //   cy.visit("http://localhost:3000");
  //   cy.location("pathname").should("eq", "/");
  //   cy.get("h3").contains(courseCode).click();
  //   cy.location("pathname").should("not.eq", "/");
  //   cy.visit("http://localhost:3000");
  //   cy.get("#navbar").contains(courseCode).click();
  //   cy.location("pathname").should("not.eq", "/");

  //   // Check navbar has week1 and week2
  //   cy.get("#navbar").contains(pageWeek1).should("exist");
  //   cy.get("#navbar").contains(pageWeek2).should("exist");
  //   cy.get("#navbar").contains(pageWeek3).should("not.exist");

  //   // Go to week 2
  //   cy.get("h1").contains(pageWeek2).should("not.exist");
  //   cy.get("#navbar").contains(pageWeek2).click();
  //   cy.wait(2000);
  //   cy.get("h1").contains(pageWeek2).should("exist");

  //   // Go back to home page to test route
  //   cy.get("#navbar").contains("Dashboard").click();
  //   cy.get("h1").contains(pageWeek2).should("not.exist");
  //   cy.location("pathname").should("eq", "/");

  //   // Go back to course page
  //   cy.get("h3").contains(courseCode).click();

  //   // Go to week 1
  //   cy.get("#navbar").contains(pageWeek1).click();
  //   cy.get("h1").contains(pageWeek1).should("exist");

  //   // Check resource 1 exists
  //   cy.get(`[data-cy="${resource1Title}"] > [data-cy="resource-title"]`)
  //     .contains(resource1Title)
  //     .should("exist");
  //   cy.get(`[data-cy="${resource1Title}"] > [data-cy="resource-description"]`)
  //     .contains(resource1Description)
  //     .should("exist");
  //   cy.get(`[data-cy="${resource1Title}"]`).contains("Download File").should("exist");

  //   // Check resource 2 exists
  //   cy.get(`[data-cy="${resource2TitleEdited}"] > [data-cy="resource-title"]`)
  //     .contains(resource2TitleEdited)
  //     .should("exist");
  //   cy.get(`[data-cy="${resource2TitleEdited}"] > [data-cy="resource-description"]`)
  //     .contains(resource2DescriptionEdited)
  //     .should("exist");

  //   // Check old version of resource 2 doesn't exist
  //   cy.get('[data-cy="resource-description"]').contains(resource2Description).should("not.eq");
  //   cy.get('[data-cy="resource-title"]').contains(resource2Title).should("not.equal");
  // });
});

// Prevent TypeScript from reading file as legacy script
export {};
