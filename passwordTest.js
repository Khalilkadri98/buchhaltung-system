const bcrypt = require("bcryptjs");

const enteredPassword = "Admin1234";
const storedHash = "$2b$10$DgQonQedmmjybbApF5PRLeUaEMF1BDV7hoQHUddeFZ89XU1Qj7Otq";

bcrypt.compare(enteredPassword, storedHash).then(result => {
  console.log("Match:", result); // false if the hash is corrupted or invalid
});
