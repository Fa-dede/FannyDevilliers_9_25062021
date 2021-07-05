import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
  constructor({ document, onNavigate, firestore, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.firestore = firestore;
    const formNewBill = this.document.querySelector(
      `form[data-testid="form-new-bill"]`
    );
    formNewBill.addEventListener("submit", this.handleSubmit);
    const file = this.document.querySelector(`input[data-testid="file"]`);
    file.addEventListener("change", this.handleChangeFile);
    this.fileUrl = null;
    this.fileName = null;
    new Logout({ document, localStorage, onNavigate });
  }
  handleChangeFile = (e) => {
    const extensionsAllowed = ["jpg", "jpeg", "png"];
    const file = this.document.querySelector(`input[data-testid="file"]`)
      .files[0];

    //Retrieve extension dot
    const selectedFileCurrentExtension = file.name.split(".").pop();

    //Supprime le message d'erreur 'extension' s'il est présent
    let errorMessage = this.document.querySelector(".error-extension");
    if (errorMessage) {
      errorMessage.remove();
    }

    //allow File if its extension is jpg jpeg or png
    if (extensionsAllowed.includes(selectedFileCurrentExtension)) {
      const filePath = e.target.value.split(/\\/g);
      const fileName = filePath[filePath.length - 1];

      //Creation firestore database si condition ok
      this.firestore.storage
        .ref(`justificatifs/${fileName}`)
        .put(file)
        .then((snapshot) => snapshot.ref.getDownloadURL())
        .then((url) => {
          this.fileUrl = url;
          this.fileName = fileName;
          console.log("file uploaded");
        });
    } else {
      //récupère la valeur du fichier selectionné si extension non conforme
      let titleOfSelectedFile = this.document.querySelector(
        `input[data-testid="file"]`
      );
      //supprime la valeur du fichier
      titleOfSelectedFile.value = null;

      titleOfSelectedFile.insertAdjacentHTML(
        "afterEnd",
        "<span class = 'error-extension'> Vous devez selectionner un fichier avec une extension <em>.jpg, .jpg </em> ou <em>.png </em></span>"
      );
    }
  };

  handleSubmit = (e) => {
    console.log("submit");
    e.preventDefault();
    // console.log(
    //   'e.target.querySelector(`input[data-testid="datepicker"]`).value',
    //   e.target.querySelector(`input[data-testid="datepicker"]`).value
    // );
    console.log(e.target.querySelector(`input[data-testid="datepicker"]`));
    const email = JSON.parse(localStorage.getItem("user")).email;
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(
        e.target.querySelector(`input[data-testid="amount"]`).value
      ),
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct:
        parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) ||
        20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`)
        .value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: "pending",
    };
    this.createBill(bill);
    this.onNavigate(ROUTES_PATH["Bills"]);
  };

  // not need to cover this function by tests
  createBill = (bill) => {
    if (this.firestore) {
      this.firestore
        .bills()
        .add(bill)
        .then(() => {
          this.onNavigate(ROUTES_PATH["Bills"]);
        })
        .catch((error) => error);
    }
  };
}
