import { fireEvent, waitFor, screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import firebase from "../__mocks__/firebase.js";
import { setSessionStorage } from "../../setup-jest";
import { ROUTES_PATH } from "../constants/routes";
import firestore from "../app/Firestore";
import Router from "../app/Router";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";

// Initialize Employee Page
const onNavigate = (pathname) => {
  document.body.innerHTML = pathname;
};

setSessionStorage("Employee");

//Test on wrong extension dot file

describe("Given user have chosen a wrong extension file to upload", () => {
  test("a error message should be displayed", () => {
    //Create HTML New Bill Page for testing
    const html = NewBillUI();
    document.body.innerHTML = html;

    //Initiate NewBill
    const newBill = new NewBill({
      document,
      onNavigate,
      firestore,
      localStorage: window.localStorage,
    });

    //Retrieve & Mock the handleChangeFile function in NewBill
    const handleChangeFile = jest.fn(() => newBill.handleChangeFile);

    //Retrieve file element in DOM and listen the event on it
    const file = screen.getByTestId("file");
    file.addEventListener("change", handleChangeFile);

    //Simulate the choice of a file
    fireEvent.change(file, {
      target: {
        files: [new File(["image.doc"], "image.doc", { type: "image/doc" })],
      },
    });

    expect(handleChangeFile).toHaveBeenCalledTimes(1);

    expect(file.files[0].name).not.toBe("image.png");

    expect(screen.getByText("Type de dépense")).toBeTruthy();

    //test if error message appeared
    expect(screen.getByTestId("error-extension").classList).toBeTruthy();
  });
});

describe("Given a file is chosen by user", () => {
  test("then the extension dot name should be retrieve", () => {
    const html = NewBillUI();
    document.body.innerHTML = html;

    const newBill = new NewBill({
      document,
      onNavigate,
      firestore: null,
      localStorage: window.localStorage,
    });

    // Mock function handleChangeFile
    const handleChangeFile = jest.fn(() => newBill.handleChangeFile);

    //Retrieve file element in DOM and listen the event on it
    const file = screen.getByTestId("file");
    file.addEventListener("change", handleChangeFile);

    fireEvent.change(file, {
      target: {
        files: [new File(["image.png"], "image.png", { type: "image/png" })],
      },
    });

    expect.anything();
  });
});

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then Mail icon in vertical layout should be highlighted", () => {
      // Path for NewBill page
      const pathname = ROUTES_PATH["NewBill"];

      // Mock - parameters for bdd Firebase & data fetching
      firestore.bills = () => ({ bills, get: jest.fn().mockResolvedValue() });

      // HTML DOM
      Object.defineProperty(window, "location", { value: { hash: pathname } });
      document.body.innerHTML = `<div id="root"></div>`;

      // Activate Router function to launch CSS
      Router();
      expect(screen.getByTestId("icon-mail")).toBeTruthy();
      expect(
        screen.getByTestId("icon-mail").classList.contains("active-icon")
      ).toBeTruthy();
    });

    describe("An user submit a valid form", () => {
      test("it should create a new Bill", async () => {
        //Create HTML New Bill Page for testing
        const html = NewBillUI();
        document.body.innerHTML = html;

        const billSample = new NewBill({
          document,
          onNavigate,
          firestore,
          localStorage: window.localStorage,
        });

        // Mock the function of submitting form
        const handleSubmit = jest.fn((e) => billSample.handleSubmit(e));

        billSample.createBill = (billSample) => billSample;

        // Create value of elements in the New Bill Sample
        document.querySelector(`select[data-testid="expense-type"]`).value =
          billSample.type;
        document.querySelector(`input[data-testid="expense-name"]`).value =
          billSample.name;
        document.querySelector(`input[data-testid="amount"]`).value =
          billSample.amount;
        document.querySelector(`input[data-testid="datepicker"]`).value =
          billSample.date;
        document.querySelector(`input[data-testid="vat"]`).value =
          billSample.vat;
        document.querySelector(`input[data-testid="pct"]`).value =
          billSample.pct;
        document.querySelector(`textarea[data-testid="commentary"]`).value =
          billSample.commentary;
        billSample.fileUrl = billSample.fileUrl;
        billSample.fileName = billSample.fileName;

        //Capture button for submitting
        const submitButton = screen.getByTestId("form-new-bill");

        //Add a event listener
        submitButton.addEventListener("click", handleSubmit);

        //Play the event
        fireEvent.click(submitButton);

        expect(handleSubmit).toHaveBeenCalled();
      });
    });
  });
});

// TEST for Firebase POST

describe("When user is on NewBill Page and click on Submit", () => {
  test("it should create a new Bill", async () => {
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

  test("fetches bills from an API and fails with 404 message error", async () => {
    firebase.post.mockImplementationOnce(() =>
      Promise.reject(new Error("Erreur 404"))
    );
    const html = BillsUI({ error: "Erreur 404" });
    document.body.innerHTML = html;
    const message = await screen.getByText(/Erreur 404/);
    expect(message).toBeTruthy();
  });

  test("fetches messages from an API and fails with 500 message error", async () => {
    firebase.post.mockImplementationOnce(() =>
      Promise.reject(new Error("Erreur 500"))
    );
    const html = BillsUI({ error: "Erreur 500" });
    document.body.innerHTML = html;
    const message = await screen.getByText(/Erreur 500/);
    expect(message).toBeTruthy();
  });
});

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then ...", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      //to-do write assertion
    });
  });
});
