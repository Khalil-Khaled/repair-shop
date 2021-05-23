const bcrpyt = require("bcryptjs");

exports.crpytpass = async function crpytpass(password) {
  try {
    const salt = await bcrpyt.genSalt(10);
    const hash = await bcrpyt.hash(password, salt);
    return hash;
  } catch (err) {
    return err;
  }
};

exports.compare = async function compare(newpassword, password) {
  return await bcrpyt.compare(newpassword, password);
};
