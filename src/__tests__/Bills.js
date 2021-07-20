import { fireEvent, screen } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import firebase from "../__mocks__/firebase.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { setSessionStorage } from "../../setup-jest";
import Firestore from "../app/Firestore";
import Router from "../app/Router.js";
import Bills from "../containers/Bills";

// Initialize Employee Page

const onNavigate = (pathname) => {
  document.body.innerHTML = pathname;
};

setSessionStorage("Employee");

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      const html = BillsUI({ data: [] });
      document.body.innerHTML = html;

      const pathname = ROUTES_PATH["Bills"];

      // Mock
      jest.mock("../app/Firestore");
      Firestore.bills = () => ({ bills, get: jest.fn().mockResolvedValue() });

      // HTML DOM creation - DIV
      Object.defineProperty(window, "location", { value: { hash: pathname } });
      document.body.innerHTML = `<div id="root"></div>`;

      // Initiate Router to put CSS into active status
      Router();

      expect(screen.getByTestId("icon-window")).toBeTruthy();
      expect(
        screen.getByTestId("icon-window").classList.contains("active-icon")
      ).toBeTruthy();
    });

    //Check if Bills are well-sorted by dates

    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);

      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    // TEST ON ICON EYE MODAL

    describe("When I click on the eye icon", () => {
      test("A modal should open", () => {
        // Initiate DOM
        const html = BillsUI({ data: bills });
        document.body.innerHTML = html;

        // Initiate firestore
        const firestore = null;

        // Generate a sample of a new Bill
        const newBillGenerate = new Bills({
          document,
          onNavigate,
          firestore,
          localStorage: window.localStorage,
        });

        // Mock
        $.fn.modal = jest.fn();

        // Retrieve the Eye Button
        const eyeButton = screen.getAllByTestId("icon-eye")[0];

        // Mock handleClickIconEye
        const handleClickIconEye = jest.fn(() =>
          newBillGenerate.handleClickIconEye(eyeButton)
        );
        // Play the Event 'click'
        eyeButton.addEventListener("click", handleClickIconEye);
        fireEvent.click(eyeButton);

        expect(handleClickIconEye).toHaveBeenCalled();

        //Retrieve the modal ID once rendered
        const modalWindow = document.getElementById("modaleFile");

        expect(modalWindow).toBeTruthy();
      });
    });

    // Check when new Bill is created that handleClickNewBill is called
    describe("When user click on the button create a new bill", () => {
      test("A new Bill Page is open", () => {
        const html = BillsUI({ data: [] });
        document.body.innerHTML = html;

        //Generate a new Bill
        const exampleOfaNewBill = new Bills({
          document,
          onNavigate,
          firestore: null,
          localStorage: window.localStorage,
        });

        // Mock a behavior
        const handleClickNewBill = jest.fn(
          exampleOfaNewBill.handleClickNewBill
        );

        //Retrieve button Submit
        const submitNewBill = screen.getByTestId("btn-new-bill");
        submitNewBill.addEventListener("click", handleClickNewBill);

        //Play the event
        fireEvent.click(submitNewBill);
        expect(handleClickNewBill).toBeCalled();
      });
    });

    //Check if Loading Page is rendered if Bills Page's loading

    describe("When user is on Bill Page and it's loading", () => {
      test("Then Loading should be rendered", () => {
        const html = BillsUI({ loading: true });
        document.body.innerHTML = html;

        expect(screen.getByText("Loading...")).toBeTruthy();
      });
    });

    //Check if Error Page is rendered if Bills Page's encounter a problem

    describe("When user is on Bill Page and it encounter a problem", () => {
      test("Then Error Page should be rendered", () => {
        const html = BillsUI({ error: true });
        document.body.innerHTML = html;

        expect(screen.getByText("Erreur")).toBeTruthy();
      });
    });

    // Integration test GET

    describe("When I navigate to Bills UI", () => {
      test("fetches bills from mock API GET", async () => {
        // Spy On The so called Firebase Mock
        const getSpy = jest.spyOn(firebase, "get");

        // Values return after Firebase Mock have been called
        const bills = await firebase.get();

        expect(getSpy).toHaveBeenCalledTimes(1);
        expect(bills.data.length).toBeGreaterThan(1);
      });

      test("fetches bills from an API and fails with 404 message error", async () => {
        //Force the firebase to throw an error
        firebase.get.mockImplementationOnce(() =>
          Promise.reject(new Error("Erreur 404"))
        );

        //Create Error 404 in DOM
        const html = BillsUI({ error: "Erreur 404" });
        document.body.innerHTML = html;

        // Send an asynchronous response
        const message = await screen.getByText(/Erreur 404/);

        //test
        expect(message).toBeTruthy();
      });

      test("fetches messages from an API and fails with 500 message error", async () => {
        //Force the Firebase Mock to throw an Error 500
        firebase.get.mockImplementationOnce(() =>
          Promise.reject(new Error("Erreur 500"))
        );

        //Create an Error 500 in DOM
        const html = BillsUI({ error: "Erreur 500" });
        document.body.innerHTML = html;

        const message = await screen.getByText(/Erreur 500/);

        expect(message).toBeTruthy();
      });
    });
  });
});
