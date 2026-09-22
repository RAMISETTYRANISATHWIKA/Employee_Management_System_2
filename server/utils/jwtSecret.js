import crypto from 'crypto';

export const ensureJwtSecret = () => {
  const secret = process.env.JWT_SECRET?.trim();

  if (!secret) {
    const generated = crypto.randomBytes(32).toString('hex');
    process.env.JWT_SECRET = generated;
    return generated;
  }

  return secret;
};
