const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = '123456789';
const someOtherPlaintextPassword = '123';



const app = async () => {
  let salt = bcrypt.genSalt(5);
  let result = await bcrypt.hash(myPlaintextPassword, 10);

  console.log(result);
};

app();
