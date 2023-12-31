/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import BillsUI from "../views/BillsUI.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store.js";
import { bills } from "../fixtures/bills.js";
import "@testing-library/jest-dom/extend-expect";

import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    // TEST : ajout du test de l'icone newbill en surbrillance
    test("Then newbill icon in vertical layout should be highlighted", async () => {
      //initialization
      // definie le localstorage
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      // met en place le body de la page
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      // appelle le router()
      router();
      // on navigue sur la page newBill
      window.onNavigate(ROUTES_PATH.NewBill);
      // on attend que l'icone a testé soit mise en place
      await waitFor(() => screen.getByTestId("icon-mail"));
      const windowIcon = screen.getByTestId("icon-mail");
      // expect que l'icone a la class "active-icon"
      expect(windowIcon).toHaveClass("active-icon");
    });
  });

  describe("When I am on NewBill Page and I filled all required inputs and add a jpg", () => {
    // TEST : ajout du test de l'ouverture de la page bills lors de la complétion du formulaire
    test("Then it should open bills page", () => {
      // init page test
      // on écoute la fonction bills() de mockSotre
      jest.spyOn(mockStore, "bills");

      // definie le localstorage
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      // declare onNavigate
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      // met en place le body via NewBillUI
      document.body.innerHTML = NewBillUI({
        data: bills,
      });
      // déclare le store
      const store = null;
      // déclare la function NewBill pour la page
      const newBillPage = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });
      // implémente la function create() avec un return en resolve
      mockStore.bills.mockImplementationOnce(() => {
        return {
          create: () => {
            return Promise.resolve({
              fileUrl: "https://localhost:3456/images/test.jpg",
              key: "1234",
            });
          },
        };
      });

      // on écoute la function onNavigate de newBillPage
      jest.spyOn(newBillPage, "onNavigate");
      newBillPage.fileUrl = "https://my-url.com/image.jpg";
      newBillPage.fileName = "image.jpg";
      // déclare un evenement fake avec ce dont on a besoin pour faire le test
      const fakeEvent = {
        preventDefault: jest.fn(),
        target: {
          querySelector: jest.fn().mockImplementation((selector) => {
            if (selector === `select[data-testid="expense-type"]`) {
              return { value: "Services en ligne" };
            }
            if (selector === `input[data-testid="amount"]`) {
              return { value: 14 };
            }
            if (selector === `input[data-testid="datepicker"]`) {
              return { value: "1989-05-26" };
            }
            if (selector === `input[data-testid="pct"]`) {
              return { value: 20 };
            }
            return { value: undefined };
          }),
        },
      };

      // on appelle la function handleSubmit en lui passant l'evenement fake
      newBillPage.handleSubmit(fakeEvent);
      // expect que l'on passe à la page Bills car la function onNavigate() a été appelé
      expect(newBillPage.onNavigate).toHaveBeenCalledWith("#employee/bills");
    });
  });

  describe("When I am on Newbill page and I upload an invalid image format", () => {
    test("Then it should open an window.alert ", () => {
      // setup / Given
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      document.body.innerHTML = NewBillUI({
        data: bills,
      });
      const store = mockStore;
      const newBillPage = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      jest
        .spyOn(newBillPage.document, "querySelector")
        .mockImplementation((selector) => {
          if (selector === `input[data-testid="file"]`) {
            const file = new File(["foo"], "foo.txt", {
              type: "text/plain",
            });
            return { files: [file] };
          }
        });

      mockStore.bills.mockImplementationOnce(() => {
        return {
          create: () => {
            return Promise.resolve({
              fileUrl: "https://localhost:3456/images/test.jpg",
              key: "1234",
            });
          },
        };
      });
      const fakeEvent = {
        preventDefault: jest.fn(),
      };

      jest.spyOn(window, "alert").mockImplementation(() => {});

      // When handleChangeFile(fakeEvent)
      newBillPage.handleChangeFile(fakeEvent);

      // Then alert has been called with the expected text
      expect(window.alert).toHaveBeenCalledWith(
        "Vous devez ajouter un fichier .jpg ou .jpeg ou .png"
      );
      expect(newBillPage.store.bills).not.toHaveBeenCalled();
    });
  });

  describe("When I am on Newbill page and I upload an valid image format", () => {
    test("Then it should create the bills", () => {
      // init page test
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      jest.spyOn(document, "querySelector").mockImplementation((selector) => {
        if (selector === `form[data-testid="form-new-bill"]`) {
          return document.createElement("form");
        }

        if (selector === `input[data-testid="file"]`) {
          const file = new File(["foo"], "foo.jpg", {
            type: "image/jpeg",
          });
          return { files: [file], addEventListener: jest.fn() };
        }
      });
      document.body.innerHTML = NewBillUI({
        data: bills,
      });
      const store = mockStore;
      const newBillPage = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      mockStore.bills.mockImplementationOnce(() => {
        return {
          create: () => {
            return Promise.resolve({
              fileUrl: "https://localhost:3456/images/test.jpg",
              key: "1234",
            });
          },
        };
      });
      const fakeEvent = {
        preventDefault: jest.fn(),
      };

      newBillPage.handleChangeFile(fakeEvent);
      expect(newBillPage.store.bills).toHaveBeenCalled();
    });
  });
});

// test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to NewBill page", () => {
    let fakeEvent;
    let newBillPage;

    beforeEach(() => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      document.body.innerHTML = NewBillUI({
        data: bills,
      });
      const store = {
        bills: jest.fn().mockImplementation(() => {
          return {
            create: () => {
              return Promise.resolve({
                fileUrl: "https://localhost:3456/images/test.jpg",
                key: "1234",
              });
            },
            update: () => Promise.resolve(),
          };
        }),
      };
      newBillPage = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      newBillPage.fileUrl = "https://my-url.com/image.jpg";
      newBillPage.fileName = "image.jpg";
      fakeEvent = {
        preventDefault: jest.fn(),
        target: {
          querySelector: jest.fn().mockImplementation((selector) => {
            if (selector === `select[data-testid="expense-type"]`) {
              return { value: "Services en ligne" };
            }
            if (selector === `select[data-testid="expense-name"]`) {
              return { value: "Vol Paris - New York" };
            }
            if (selector === `input[data-testid="amount"]`) {
              return { value: 14 };
            }
            if (selector === `input[data-testid="datepicker"]`) {
              return { value: "1989-05-26" };
            }
            if (selector === `input[data-testid="pct"]`) {
              return { value: 20 };
            }
            return { value: undefined };
          }),
        },
      };
    });

    test("should POST a new bill", async () => {
      newBillPage.handleChangeFile(fakeEvent);
      newBillPage.handleSubmit(fakeEvent);

      await waitFor(() => screen.getByText("Mes notes de frais"));
      const contentPending = screen.getByText("Mes notes de frais");
      expect(contentPending).toBeTruthy();
      expect(screen.getByTestId("btn-new-bill")).toBeTruthy();
    });

    describe("When I submit the form and there's an error with the server", () => {
      //erreur 404
      test("Then there is a mistake and it fails with 404 error message", async () => {
        mockStore.bills(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        const html = BillsUI({ error: "Erreur 404" });
        document.body.innerHTML = html;
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });
      //erreur 500
      test("Then there is a mistake and it fails with 500 error message", async () => {
        mockStore.bills(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });
        const html = BillsUI({ error: "Erreur 500" });
        document.body.innerHTML = html;
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});
