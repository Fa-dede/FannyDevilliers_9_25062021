import { screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import firebase from "../__mocks__/firebase.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then ...", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      //to-do write assertion
    });
  });

  describe("When user is on NewBill Page and click on Submit", () => {
    test.only("it should create a new Bill", async () => {
      //Create a newBill Datas
      const newBill = {
        id: "qcCK3SzECmaZAGRrHjaC",
        status: "refused",
        pct: 20,
        amount: 200,
        email: "a@a",
        name: "test unitaire POST new Bill",
        vat: "40",
        fileName: "preview-facture-free-201801-pdf-1.jpg",
        date: "2005-02-02",
        commentAdmin: "Ceci est un test d'intégration",
        commentary: "test POST",
        type: "Restaurants et bars",
        fileUrl:
          "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=4df6ed2c-12c8-42a2-b013-346c1346f732",
      };

      //SpyOn the So Called Firebase Mock - post
      const postSpy = jest.spyOn(firebase, "post");

      //Values return after Firebase called
      const bills = await firebase.post(newBill);

      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(bills.data.length).toBe(5);
    });
  });
});
