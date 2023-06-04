import { login } from "../../support/shared";
import { faker } from "@faker-js/faker";

describe("Global Feed", () => {
  beforeEach(() => {
    cy.visit("/");
    login();
    cy.get(".navbar").should("be.visible").as("appHeader");
    cy.get("article-list").as("articleList");
  });


  const clickGlobalFeed = () => {
    cy.get("ul.nav-pills").as("articlesNavbar");
    cy.get("@articlesNavbar").find("a.nav-link:contains('Global Feed')")
      .should("exist")
      .click()
      .should("have.class", "active");
  };

  it("should display article list", () => {
    clickGlobalFeed();

    cy.get("@articleList").find("article-preview")
      .should("have.length", 10)
      .each(article => {
        cy.wrap(article).within(() => {
          cy.get("article-meta").within(() => {
            cy.get(".date").should("be.visible");
            cy.get("a[ui-sref*=profile] img").should("be.visible");
            cy.get(".author").should("be.visible");
            cy.get("favorite-btn")
              .invoke("text")
              // TODO: learn jquery trim
              .invoke("trim")
              // TODO: learn more about regular expressions
              .should("match", /^[0-9]+$/);
          });
          cy.get("h1").should("be.visible");
          cy.get("[ng-bind*=description]").should("be.visible");
          cy.get(".tag-list li").should("have.length.greaterThan", 0);
        });
      });
  });

  const getRandomNumber = () => {
    return Math.floor(Math.random() * 10);
  };

  const checkAndGetArticle = () => {
    cy.get("@articleList").find("article-preview")
      .should("have.length", 10)
      .as("article");

    const rand = getRandomNumber();
    cy.get("@article")
      // TODO: add waiting for elements
      .eq(rand)
      .as("randomArticle");
  };

  it("should open article detail page", () => {
    clickGlobalFeed();
    checkAndGetArticle();

    cy.get("@randomArticle")
      .find("h1")
      .invoke("text")
      .invoke("trim")
      .then(randomTitle => {
        cy.get("@randomArticle").click();
        cy.url().should("include", "/#/article/");
        cy.get("h1")
          .should("be.visible")
          .should("have.text", randomTitle);
      });
  });

  it("should be like article", () => {
    clickGlobalFeed();
    checkAndGetArticle();

    cy.get("@randomArticle")
      .find("favorite-btn button")
      .as("likeButton");

    cy.get("@likeButton")
      .invoke("text")
      .invoke("trim")
      .then(likes => parseInt(likes))
      .as("likesBefore");

    cy.get("@likeButton")
      .invoke("hasClass", "btn-primary")
      .then(likedBefore => {
        cy.get("@likeButton")
          .click()
          .should("not.have.class", "disabled");

        cy.get("@likesBefore").then(likesBefore => {
          const expectingLikes = likesBefore + (likedBefore ? -1 : 1);
          cy.get("@likeButton")
            .invoke("text")
            .invoke("trim")
            .then(likes => parseInt(likes))
            .should("eq", expectingLikes);
        });
      });
  });

  it("should navigate in list by paging", () => {
    clickGlobalFeed();
    checkAndGetArticle();
    cy.get("@randomArticle")
      .find("h1")
      .invoke("text")
      .invoke("trim")
      .then(randomTitle => {
        const rand = getRandomNumber() + 1;

        cy.get("ul.pagination a.page-link")
          .eq(rand)
          .as("newPageLink");

        cy.get("@newPageLink")
          .click()
          .parent()
          .should("have.class", "active");

        cy.get("div.home-page")
          .should("be.visible")
          .as("homePage");

        cy.get("ul.pagination a.page-link")
          .eq(0)
          .as("firstPageLink");

        cy.get("@homePage")
          .should("not.contain.text", randomTitle);

        cy.get("@firstPageLink")
          .click()
          .parent()
          .should("have.class", "active");

        cy.get("@homePage")
          .should("contain.text", randomTitle);
      });
  });

  it("should do filter articles by tag", () => {

    cy.get(".tag-list").as("tagList");

    const rand = getRandomNumber();

    cy.get("@tagList").find("[ng-bind='tagName']")
      .its("length")
      .should("be.greaterThan", 5);


    cy.get("@tagList").find("[ng-bind='tagName']")
      .eq(rand)
      .as("randomTag");

    cy.get("@randomTag")
      .click()
      .invoke("text")
      .invoke("trim")
      .then(randomTagText => {
        cy.get("li[ng-show*='filters.tag'] a")
          .should("have.class", "active")
          .should("contain.text", randomTagText);

        cy.get("article-list").as("articleList");
        cy.get("@articleList").find("article-preview")
          .each(article => {
            cy.wrap(article).within(() => {
              cy.get(".tag-list").should("contain.text", randomTagText);
            });

          });
      });
  });

  const commentText = faker.lorem.paragraph();

  const addAndCheckComment = () => {
    cy.get("@randomArticle").click();
    cy.get("form.comment-form").as("commentForm");
    cy.get("@commentForm")
      .find("textarea[ng-model*='commentForm']")
      .as("commentInput");

    cy.get("@commentForm").scrollIntoView();

    cy.get("@commentInput").type(commentText);

    cy.get("@commentForm").find("button").click();
    cy.get(".offset-md-2").as("comments");
    cy.get("@comments")
      .should("be.visible")
      .should("contain.text", commentText);
  };

  it("should add comment", () => {
    clickGlobalFeed();
    checkAndGetArticle();

    addAndCheckComment();
  });

  it("should delete comment", () => {
    clickGlobalFeed();
    checkAndGetArticle();

    addAndCheckComment();
    cy.get("@comments")
      .find("div.card")
      .should("contain.text", commentText)
      .as("commentForDelete")
      .find("i.ion-trash-a")
      .click();

    cy.get("@commentForDelete").should("not.exist");
  });

});