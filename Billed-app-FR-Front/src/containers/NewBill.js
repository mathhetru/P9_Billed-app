import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const formNewBill = this.document.querySelector(
      `form[data-testid="form-new-bill"]`
    );
    formNewBill.addEventListener("submit", this.handleSubmit);
    const file = this.document.querySelector(`input[data-testid="file"]`);
    file.addEventListener("change", this.handleChangeFile);
    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;
    new Logout({ document, localStorage, onNavigate });
  }
  handleChangeFile = (e) => {
    e.preventDefault();
    // ajout de l'input
    const input = this.document.querySelector(`input[data-testid="file"]`);
    const file = this.document.querySelector(`input[data-testid="file"]`)
      .files[0];
    const fileName = file.name;
    // on récupère l'extension du fichier envoyé
    const filesWord = fileName.split(".");
    const lastWord = filesWord[filesWord.length - 1];
    const formData = new FormData();
    const email = JSON.parse(localStorage.getItem("user")).email;
    // on crée un array d'extensions de fichier autorisés
    const formatsAutorises = ["jpg", "jpeg", "png"];
    // SI l'extension du fichier envoyé ne fait pas parti de la liste d'extension autorisé
    if (!formatsAutorises.includes(lastWord)) {
      // alert window
      alert("Vous devez ajouter un fichier .jpg ou .jpeg ou .png");
      // on retourne la valeur de l'input à null
      return (input.value = null);
    } else {
      // sinon on envoie la facture avec le fichier 
      formData.append("file", file);
      formData.append("email", email);
      this.store
        .bills()
        .create({
          data: formData,
          headers: {
            noContentType: true,
          },
        })
        .then(({ fileUrl, key }) => {
          this.billId = key;
          this.fileUrl = fileUrl;
          this.fileName = fileName;
        })
        .catch((error) => console.error(error));
    }
  };
  handleSubmit = (e) => {
    e.preventDefault();
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
    this.updateBill(bill);
    this.onNavigate(ROUTES_PATH["Bills"]);
  };

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH["Bills"]);
        })
        .catch((error) => console.error(error));
    }
  };
}
