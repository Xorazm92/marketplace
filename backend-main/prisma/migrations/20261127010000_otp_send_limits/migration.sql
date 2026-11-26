-- OTP yuborish chegaralari (SMS balansini yoqishga qarshi). Faqat qo'shadi, hech narsa o'chirmaydi.
-- ip_hash: so'rov IP'sining HMAC'i — bitta manzildan turli raqamlarga yuborishni sanash uchun.
ALTER TABLE "otp_verification" ADD COLUMN     "ip_hash" TEXT;

-- Umumiy soatlik/kunlik chegara barcha raqamlar bo'yicha createdAt oralig'ini sanaydi.
CREATE INDEX "otp_verification_createdAt_idx" ON "otp_verification"("createdAt");

CREATE INDEX "otp_verification_ip_hash_createdAt_idx" ON "otp_verification"("ip_hash", "createdAt");
