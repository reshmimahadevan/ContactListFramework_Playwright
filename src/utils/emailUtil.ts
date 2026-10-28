//makes an email unique per run so sign-up never hits "Email address is already in use"
export function uniqueEmail(base: string): string {
  const [name, domain] = base.split('@');
  return `${name}${Date.now()}${Math.floor(Math.random() * 1000)}@${domain}`;
}
