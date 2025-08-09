import crypto from "crypto";

export const hashEncrypt = (text: string, salt?: string) => {
  const hash = crypto.createHash("md5");
  if (salt) {
    hash.update(text + salt);
  } else {
    hash.update(text);
  }

  return hash.digest("hex");
};

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 1024,
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
  },
});

const decryptToPassword = (base64: string) => {
  const result = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(base64, "base64")
  );
  return result.toString();
};

export { publicKey, decryptToPassword };
