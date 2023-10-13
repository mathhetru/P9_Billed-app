/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, userEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page and I filled all required inputs and add a jpg", () => {
    test("Then it should open bills page", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const inputExpenseType = screen.getByTestId("expense-type");
      fireEvent.change(inputExpenseType, {
        target: { value: "Services en ligne" },
      });
      expect(inputExpenseType.value).toBe("Services en ligne");

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

      // const inputFile = screen.getByTestId("file");
      // inputFile.addEventListener("change", handleChangeFile);
      // userEvent.upload(
      //   inputFile,
      //   new File(["(--[IMG]--)"], "fixture-cat.jpg", {
      //     type: "image/jpg",
      //   })
      // );
      // expect(inputFile.files[0].type).toMatch(/^image\/(jpg|jpeg|png)$/);
      // expect(inputFile).not.toHaveClass("invalid");
    });
  });
});
