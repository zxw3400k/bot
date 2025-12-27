const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");
const input = require("input");
const fs = require("fs");
const { displayBanner } = require("./console/banner");
const TrueMoneyWallet = require("./api/TrueMoneyWallet");
const config = JSON.parse(fs.readFileSync("config.json", "utf8"));
const { apiId, apiHash, sessionFile } = config.telegram;
const { phoneNumber } = config.wallet;
const { connectionRetries, reconnectDelay } = config.settings;
const wallet = new TrueMoneyWallet({
  apiUrl: config.wallet.apiUrl,
  phoneNumber: config.wallet.phoneNumber,
  webhookSuccess: config.webhooks.success,
  webhookFail: config.webhooks.fail
});

let sessionString = "";
if (fs.existsSync(sessionFile)) {
  sessionString = fs.readFileSync(sessionFile, "utf8").trim();
}

const stringSession = new StringSession(sessionString);
const client = new TelegramClient(stringSession, apiId, apiHash, {
  connectionRetries: connectionRetries,
});

async function startClient() {
  try {

    displayBanner();

    await client.start({
      phoneNumber: async () => await input.text("Enter phone: "),
      password: async () => await input.text("Enter 2FA password: "),
      phoneCode: async () => await input.text("Enter the code you received: "),
      onError: (err) => console.error("Login error:", err),
    });

    console.log("Login successful!");
    fs.writeFileSync(sessionFile, client.session.save(), "utf8");
    console.log("The session has been saved.");
    console.log("Start listening to messages from Telegram...\n");

    client.addEventHandler(async (event) => {
      const msg = event.message;
      if (!msg || !msg.message) return;

      const text = msg.message;
      const voucherMatch = text.match(/https:\/\/gift\.truemoney\.com\/campaign\/\?v=[\w]+/);

      if (voucherMatch) {
        const voucherLink = voucherMatch[0];
        console.log("เจอซอง:", voucherLink);

        setImmediate(() => wallet.processVoucher(voucherLink));
      }
    }, new NewMessage({}));

    client.on("disconnected", () => {
      console.log("ขาดการเชื่อมต่อ กำลัง reconnect...");
    });

  } catch (err) {
    console.error("เกิดข้อผิดพลาด:", err.message);
    setTimeout(() => {
      console.log("กำลังรีสตาร์ท...");
      startClient();
    }, reconnectDelay);
  }
}

startClient();