export interface Account {
  id: string;
  name: string;
  hashed_password: string;
  phone: string;
  address_id: string;
  email: string;
  street: string;
  type: string;
}

export interface AccountWithType extends Account {
  type: string;
}

export interface AccountCreate {
  name: string;
  password: string;
  phone: string;
  email: string;
  address_id: string;
  street: string;
}

export interface MerchantCreate {
  company_name: string;
  merchant_description: string;
  registration_date: string;
}
