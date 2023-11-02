/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
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
    test("Then newbill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("icon-mail"));
      const windowIcon = screen.getByTestId("icon-mail");
      expect(windowIcon).toHaveClass("active-icon");
    });
  });

  describe("When I am on NewBill Page and I filled all required inputs and add a jpg", () => {
    test("Then it should open bills page", () => {
      // init page test
      jest.spyOn(mockStore, "bills");

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
      const store = null;
      const newBillPage = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();

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

      jest.spyOn(newBillPage, "onNavigate");
      newBillPage.fileUrl = "https://my-url.com/image.jpg";
      newBillPage.fileName = "image.jpg";
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

      newBillPage.handleSubmit(fakeEvent);
      expect(newBillPage.onNavigate).toHaveBeenCalledWith("#employee/bills");
    });
  });

  describe("When I am on Newbill page and I upload an invalid image format", () => {
    test("Then it should open an window.alert ", () => {
      // setup / Given
      jest.spyOn(mockStore, "bills");

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

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();

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

      // When / action
      newBillPage.handleChangeFile(fakeEvent);

      // Then / ce que je veux tester
      expect(window.alert).toHaveBeenCalledWith(
        "Vous devez ajouter un fichier .jpg ou .jpeg ou .png"
      );
      expect(newBillPage.store.bills).not.toHaveBeenCalled();
    });
  });

  describe("When I am on Newbill page and I upload an valid image format", () => {
    test("Then it should create the bills", () => {
      // init page test
      jest.spyOn(mockStore, "bills");

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

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();

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
    test("should POST a new bill", async () => {
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
      const store = null;
      const newBillPage = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();

      newBillPage.fileUrl = "https://my-url.com/image.jpg";
      newBillPage.fileName = "image.jpg";
      const fakeEvent = {
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

      newBillPage.handleSubmit(fakeEvent);

      await waitFor(() => screen.getByText("Mes notes de frais"));
      const contentPending = screen.getByText("Mes notes de frais");
      expect(contentPending).toBeTruthy();
      expect(screen.getByTestId("btn-new-bill")).toBeTruthy();
    });
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "a@a",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });
      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            create: (bill) => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.NewBill);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      //     test("fetches messages from an API and fails with 500 message error", async () => {
      //       mockStore.bills.mockImplementationOnce(() => {
      //         return {
      //           list: () => {
      //             return Promise.reject(new Error("Erreur 500"));
      //           },
      //         };
      //       });

      //       window.onNavigate(ROUTES_PATH.Bills);
      //       await new Promise(process.nextTick);
      //       const message = await screen.getByText(/Erreur 500/);
      //       expect(message).toBeTruthy();
      //     });
    });
  });
});
