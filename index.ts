//BASED ON: https://www.mnb.hu/letoltes/qr-kod-utmutato-20190712.pdf
const AFR_QR_STANDARD_VERSION = "001";
const AFR_QR_MAX_LENGTH = 345;

const customInspectSymbol = Symbol.for("nodejs.util.inspect.custom");

interface QRCodeDetails {
  bic: string;
  name: string;
  iban: string;

  amount?: number;
  validUntil: Date;
  purpose?: string;
  description?: string;
  shopID?: string;
  merchDevID?: string;
  invoiceID?: string;
  customerID?: string;
  credTranID?: string;
  loyaltyID?: string;
  navCheckID?: string;
}

type QRCodeType = "HCT" | "RTP";

/*
 * Represents the content of an Instant Transfer QR code according to the standard created by the Hungarian National Bank.
 */
class InstantTransferQR {
  readonly type: QRCodeType;
  readonly version: string;
  readonly charset: "1";

  readonly bic: string;
  readonly name: string;
  readonly iban: string;

  readonly amount?: number;
  readonly validUntil?: Date;

  readonly purpose?: string;
  readonly description?: string;
  readonly shopID?: string;
  readonly merchDevID?: string;
  readonly invoiceID?: string;
  readonly customerID?: string;
  readonly credTranID?: string;
  readonly loyaltyID?: string;
  readonly navCheckID?: string;

  private constructor(type: QRCodeType, data: QRCodeDetails) {
    this.type = type;
    this.version = AFR_QR_STANDARD_VERSION;
    this.charset = "1";
    this.bic = data.bic;
    this.name = data.name;
    this.iban = data.iban;
    this.amount = data.amount;
    if (this.amount && this.amount <= 0) {
      throw new Error("Amount has to be greater than 0.");
    }
    this.validUntil = data.validUntil;
    this.purpose = data.purpose;
    this.description = data.description;
    if (this.description && this.description.length > 70) {
      throw new Error("The description cannot be longer than 70 characters.");
    }
    this.shopID = data.shopID;
    this.merchDevID = data.merchDevID;
    this.invoiceID = data.invoiceID;
    this.customerID = data.customerID;
    this.credTranID = data.credTranID;
    this.loyaltyID = data.loyaltyID;
    this.navCheckID = data.navCheckID;
  }

  /**
   * Returns a new InstantTransferQR object with type set to HCT.
   * Use this, if you would like to generate a QR that can be used to initiate a transfer.
   * @param {QRCodeDetails} data
   * @returns {InstantTransferQR}
   */
  public static newHCTQR(data: QRCodeDetails): InstantTransferQR {
    return new InstantTransferQR("HCT", data);
  }

  /**
   * Returns a new InstantTransferQR object with type set to RTP.
   * Use this, if you woud like to generate a QR that the beneficary can use to send a payment request.
   * @param {QRCodeDetails} data
   * @returns {InstantTransferQR}
   */
  public static newRTPQR(data: QRCodeDetails): InstantTransferQR {
    return new InstantTransferQR("RTP", data);
  }

  public getPayload(): string {
    const amountToString = (a?: number) =>
      a ? `HUF${a.toString().padStart(12, "0")}` : "";

    function dateToString(d?: Date): string {
      if (!d) return "";

      const padDigits = (n: number) => (n < 10 ? `0${n}` : n.toString());
      const month = padDigits(d.getMonth() + 1);
      const day = padDigits(d.getDate());
      const hour = padDigits(d.getHours());
      const minutes = padDigits(d.getMinutes());
      const seconds = padDigits(d.getSeconds());
      const offset = (d.getTimezoneOffset() / 60) * -1;
      const offsetString = offset > 0 ? `+${offset}` : offset.toString();
      return `${d.getFullYear()}${month}${day}${hour}${minutes}${seconds}${offsetString}`;
    }

    const content = [
      this.type,
      this.version,
      this.charset,
      this.bic,
      this.name,
      this.iban,
      amountToString(this.amount),
      dateToString(this.validUntil),
      this.purpose,
      this.description,
      this.shopID,
      this.merchDevID,
      this.invoiceID,
      this.customerID,
      this.credTranID,
      this.loyaltyID,
      this.navCheckID,
    ];

    const payload =
      content.reduce((acc, e) => (e ? acc + `${e}\n` : acc + "\n"), "") || "";
    if (payload.length > AFR_QR_MAX_LENGTH)
      throw new Error(
        `Maximum length of ${AFR_QR_MAX_LENGTH} characters reached. Reduce the content of the fields.`
      );
    return payload;
  }

  public toString(): string {
    return `${this.type} QR-code (BIC: ${this.bic}, IBAN: ${this.iban}, Name: ${this.name})`;
  }

  [customInspectSymbol](depth: number, inspectOptions: any, inspect: boolean) {
    return this.toString();
  }
}
