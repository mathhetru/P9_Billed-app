/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import Bills from "../containers/Bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import "@testing-library/jest-dom/extend-expect";

import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
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
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //TEST : Ajout de l'expect
      expect(windowIcon).toHaveClass("active-icon");
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });
});

describe("Given I am connected as an employee and I am on Bills page", () => {
  describe("When I click on 'nouvelle note de frais' button", () => {
    test("I should be sent on 'Envoyer une note de frais' page", () => {
      // init page test
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
      // met en place le body via BillsUI
      document.body.innerHTML = BillsUI({ bills });
      // declare onNavigate
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      // déclare le store
      const store = null;
      // déclare la function Bills pour la page
      const billspage = new Bills({
        document,
        onNavigate,
        store,
        bills,
        localStorage: window.localStorage,
      });

      // on déclare la simulation de la function handleClickNewBill
      const handleClickNewBill = jest.fn(billspage.handleClickNewBill);

      // on cherche le newBillButton sur la page et on écoute le click sur handleClickNewBill
      const newBillButton = screen.getByTestId("btn-new-bill");
      newBillButton.addEventListener("click", handleClickNewBill);
      userEvent.click(newBillButton);

      // Au click, expect que la fonction handleClickNewBill a été appelé et que l'on est bien sur la page "envoyer une note de frais"
      expect(handleClickNewBill).toHaveBeenCalled();
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    });
  });

  describe("When I click on the icon eye", () => {
    test("A modal should open", () => {
      beforeAll(() => {
        jQuery.fn.modal = jest.fn();
      });
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      document.body.innerHTML = BillsUI({
        data: bills,
      });
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const store = null;
      const billspage = new Bills({
        document,
        onNavigate,
        store,
        bills,
        localStorage: window.localStorage,
      });

      const iconEye = screen.getAllByTestId("icon-eye");
      const handleClickIconEye = jest.fn(() =>
        billspage.handleClickIconEye(iconEye[0])
      );

      if (iconEye)
        iconEye.forEach((icon) => {
          icon.addEventListener("click", handleClickIconEye);
        });
      userEvent.click(iconEye[0]);

      expect(handleClickIconEye).toHaveBeenCalled();
      expect(handleClickIconEye).toHaveReturnedTimes(1);
    });
  });
});

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills page", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByText("Mes notes de frais"));
      const contentPending = screen.getByText("Transports");
      expect(contentPending).toBeTruthy();
      const contentRefused = screen.getByText("Services en ligne");
      expect(contentRefused).toBeTruthy();
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

      // Error 404
      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      // Error 500
      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});
