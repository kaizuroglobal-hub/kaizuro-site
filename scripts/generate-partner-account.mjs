import { randomBytes, createHash } from 'node:crypto';

const [,, usernameArg, dealerNameArg, partnerIdArg, regionArg = 'Australia', referralCodeArg = ''] = process.argv;

if (!usernameArg || !dealerNameArg || !partnerIdArg) {
  console.error('Usage: node scripts/generate-partner-account.mjs <username> "<dealer name>" <partner-id> [region] [referral-code]');
  process.exit(1);
}

const password = randomBytes(15).toString('base64url');
const salt = randomBytes(12).toString('hex');
const passwordHash = createHash('sha256').update(`${salt}:${password}`).digest('hex');
const referralCode = referralCodeArg || `${partnerIdArg.replace(/[^a-z0-9]/gi, '').toUpperCase()}-KZ`;

const record = {
  username: usernameArg,
  salt,
  passwordHash,
  dealerName: dealerNameArg,
  partnerId: partnerIdArg,
  region: regionArg,
  status: 'Authorised KAIZURO Partner',
  referralCode
};

console.log('\nKAIZURO DEALER CREDENTIALS');
console.log('--------------------------');
console.log(`Username: ${usernameArg}`);
console.log(`Password: ${password}`);
console.log('\nAdd this record to the PARTNER_ACCOUNTS Worker secret:');
console.log(JSON.stringify(record, null, 2));
console.log('\nImportant: send the password to the dealer securely. The plaintext password is not stored in the account record.');
