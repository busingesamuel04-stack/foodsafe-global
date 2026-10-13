// SafeFood Global Input Validation & Abuse Prevention Helpers

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Simple email regex RFC 5322 compatible
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function validateEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  return EMAIL_REGEX.test(email.trim());
}

export function validateTestEnquiry(data: {
  name: string;
  email: string;
  phone?: string;
  foodType: string;
  concern: string;
  honeypot?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  // Honeypot check: If the hidden honeypot field is filled, treat as bot
  if (data.honeypot && data.honeypot.trim().length > 0) {
    errors.honeypot = 'Automated bot submission detected.';
    return { isValid: false, errors };
  }

  const name = data.name?.trim() || '';
  if (name.length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  } else if (name.length > 100) {
    errors.name = 'Name cannot exceed 100 characters.';
  }

  if (!validateEmail(data.email)) {
    errors.email = 'Please provide a valid email address.';
  }

  if (data.phone) {
    const cleanedPhone = data.phone.replace(/[\s\-\(\)\+]/g, '');
    if (cleanedPhone.length > 0 && (cleanedPhone.length < 7 || cleanedPhone.length > 16 || !/^\d+$/.test(cleanedPhone))) {
      errors.phone = 'Please provide a valid phone number (7-15 digits).';
    }
  }

  const foodType = data.foodType?.trim() || '';
  if (foodType.length < 2 || foodType.length > 100) {
    errors.foodType = 'Please select or specify a valid food matrix (2-100 characters).';
  }

  const concern = data.concern?.trim() || '';
  if (concern.length < 5) {
    errors.concern = 'Please describe the testing requirement or suspected hazard (at least 5 characters).';
  } else if (concern.length > 2500) {
    errors.concern = 'Description exceeds maximum allowed length of 2500 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateIncidentReport(data: {
  productName: string;
  vendorOrBrand?: string;
  location: string;
  purchaseDate: string;
  incidentDescription: string;
  reporterName?: string;
  contactEmail?: string;
  honeypot?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  // Honeypot check
  if (data.honeypot && data.honeypot.trim().length > 0) {
    errors.honeypot = 'Automated bot submission detected.';
    return { isValid: false, errors };
  }

  const productName = data.productName?.trim() || '';
  if (productName.length < 2) {
    errors.productName = 'Product name must be at least 2 characters.';
  } else if (productName.length > 150) {
    errors.productName = 'Product name cannot exceed 150 characters.';
  }

  const location = data.location?.trim() || '';
  if (location.length < 2) {
    errors.location = 'Purchase location is required (at least 2 characters).';
  } else if (location.length > 250) {
    errors.location = 'Location cannot exceed 250 characters.';
  }

  if (!data.purchaseDate) {
    errors.purchaseDate = 'Please specify the date of purchase or incident.';
  } else {
    const parsedDate = new Date(data.purchaseDate);
    const now = new Date();
    if (isNaN(parsedDate.getTime()) || parsedDate > now) {
      errors.purchaseDate = 'Incident date cannot be in the future.';
    }
  }

  const description = data.incidentDescription?.trim() || '';
  if (description.length < 10) {
    errors.incidentDescription = 'Please provide detailed incident observations (at least 10 characters).';
  } else if (description.length > 3500) {
    errors.incidentDescription = 'Incident description cannot exceed 3500 characters.';
  }

  if (data.contactEmail && data.contactEmail.trim().length > 0) {
    if (!validateEmail(data.contactEmail)) {
      errors.contactEmail = 'Please provide a valid contact email.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Client-side rate-limit / throttle check (cooldown protection against rapid repeat form submissions)
export function checkSubmissionCooldown(storageKey: string, cooldownSeconds = 30): { allowed: boolean; remainingSeconds: number } {
  if (typeof window === 'undefined') return { allowed: true, remainingSeconds: 0 };

  const lastSubmitted = localStorage.getItem(`cooldown_${storageKey}`);
  if (!lastSubmitted) {
    return { allowed: true, remainingSeconds: 0 };
  }

  const elapsedSeconds = Math.floor((Date.now() - parseInt(lastSubmitted, 10)) / 1000);
  if (elapsedSeconds < cooldownSeconds) {
    return {
      allowed: false,
      remainingSeconds: cooldownSeconds - elapsedSeconds,
    };
  }

  return { allowed: true, remainingSeconds: 0 };
}

export function recordSubmissionCooldown(storageKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`cooldown_${storageKey}`, Date.now().toString());
  }
}
