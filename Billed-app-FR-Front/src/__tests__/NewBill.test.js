/**
 * @jest-environment jsdom
 */

import { userEvent } from "@testing-library/user-event";
import { fireEvent, screen, waitFor } from "@testing-library/dom";
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
      /*
      // const inputExpenseType = screen.getAllByTestId("expense-type");
      // fireEvent.change(inputExpenseType, {
      //   target: { value: "Services en ligne" },
      // });
      fireEvent.click(screen.getAllByText("Services en ligne")[0]);
      // expect(inputExpenseType.value).toBe("Services en ligne");
      console.log(screen.getAllByText("Services en ligne"));
      // expect(screen.getAllByText("Services en ligne")).toBeInTheDocument();

      const inputDate = screen.getByTestId("datepicker");
      fireEvent.change(inputDate, {
        target: { value: "1989-05-26" },
      });
      expect(inputDate.value).toBe("1989-05-26");

      const inputAmount = screen.getByTestId("amount");
      fireEvent.change(inputAmount, {
        target: { value: "380" },
      });
      expect(inputAmount.value).toBe("380");

      const inputPCT = screen.getByTestId("pct");
      fireEvent.change(inputPCT, {
        target: { value: "15.5" },
      });
      expect(inputPCT.value).toBe("15.5");

      const inputFile = screen.getByTestId("file");
      const handleChangeFile = jest.fn(() => newBillPage.handleChangeFile());
      inputFile.addEventListener("change", handleChangeFile);
      const f = new File(["(--[IMG]--)"], "fixture-cat.jpg", {
        type: "image/jpg",
      });
      console.log(f);
      userEvent.upload(
        inputFile,
        new File(["(--[IMG]--)"], "fixture-cat.jpg", {
          type: "image/jpg",
        })
      );
      expect(inputFile.files[0].type).toMatch(/^image\/(jpg|jpeg|png)$/);
      expect(inputFile).not.toHaveClass("invalid");
      
      */
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
    test("Then it ...", () => {
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
    })
  })
});
