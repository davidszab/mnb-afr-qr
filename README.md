# MNB AFR QR
## Library for generating QR code payloads based on the standard by the Hungarian National Bank.

### Example
```js
  const transferPayload = InstantTransferQR.newHCTQR({
    bic: "BIC",
    iban: "IBAN",
    name: "John Doe",
    validUntil: new Date()
    });
  transferPayload.getPayload();
```