const axios = require('axios');

class TrueMoneyWallet {
  constructor(config) {
    this.apiUrl = 'https://api.apiparkxd.pro/wallet/topup';
    this.phoneNumber = config.phoneNumber;
    this.webhookSuccess = config.webhookSuccess;
    this.webhookFail = config.webhookFail;
  }

  async sendWebhookNotification(webhook, title, description, color, additionalFields = []) {
    if (!webhook) return;
    
    try {
      const payload = {
        embeds: [{
          title: title,
          description: description,
          color: color,
          fields: additionalFields,
          footer: { text: 'Dev: Chicken | ดักซอง' },
          timestamp: new Date()
        }]
      };

      await axios.post(webhook, payload);
    } catch (error) {
      console.error('ส่ง webhook ไม่สำเร็จ:', error.message);
    }
  }

  async processVoucher(voucherLink) {
    const startTime = Date.now();
    console.log(`กำลังดักซอง: ${voucherLink}`);

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: this.phoneNumber,
          voucher: voucherLink
        })
      });

      const result = await response.json();
      const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);

      console.log('API Response:', result);

      if (result.status === 'success' || (result.data && result.data.amount)) {
        const amount = result.data?.amount || result.amount || 'ไม่ทราบจำนวน';
        console.log(`รับเงินสำเร็จ ${amount} บาท จาก ${voucherLink} (${elapsedTime}s)`);

        await this.sendWebhookNotification(
          this.webhookSuccess,
          '[\`\`✅\`\`] **ดักซองสำเร็จแล้วงับบ!**',
          '',
          0x00ff00,
          [
            { name: '[\`\`💰\`\`] **จำนวนเงิน**', value: `**${amount} บาท**`, inline: true },
            { name: '[\`\`⏱️\`\`] **เวลารับซอง**', value: `**${elapsedTime} s**`, inline: true },
            { name: '[\`\`🔗\`\`] **ลิงก์ซอง**', value: voucherLink, inline: false }
          ]
        );

        return { success: true, amount, elapsedTime };
      } else {
        console.log(`รับไม่สำเร็จ ${voucherLink}`, result);
        
        await this.sendWebhookNotification(
          this.webhookFail,
          '[\`\`❌\`\`] **รับเงินไม่สำเร็จ**',
          `ซอง: ${voucherLink}\nเหตุผล: ${result.message || 'ไม่ทราบสาเหตุ'}`,
          0xff0000
        );

        return { success: false, message: result.message };
      }
    } catch (error) {
      console.log(`เกิดข้อผิดพลาด: ${error.message}`);
      
      await this.sendWebhookNotification(
        this.webhookFail,
        '[\`\`❌\`\`] **รับไม่สำเร็จ**',
        `ซอง: ${voucherLink}\nเหตุผล: ${error.message}`,
        0xff0000
      );

      return { success: false, error: error.message };
    }
  }
}

module.exports = TrueMoneyWallet;
