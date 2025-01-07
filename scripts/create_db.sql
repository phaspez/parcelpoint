-- Table: Address
CREATE TABLE Address (
    id UUID PRIMARY KEY,
    province TEXT NOT NULL,
    district TEXT NOT NULL,
    commune TEXT NOT NULL
);

-- Table: User
CREATE TABLE Account (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    hashed_password TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    address_id UUID references Address(id) NOT NULL,
    street TEXT NOT NULL
);

-- Table: Merchant
CREATE TABLE Merchant (
    account_id UUID PRIMARY KEY REFERENCES Account(id),
    company_name TEXT NOT NULL,
    merchant_description TEXT,
    registration_date DATE NOT NULL
);

-- Table: Staff
CREATE TABLE Staff (
    account_id UUID PRIMARY KEY REFERENCES Account(id),
    department TEXT NOT NULL,
    position TEXT NOT NULL,
    hire_date DATE NOT NULL,
    access_level INT NOT NULL
);

-- Table: StorageBlock
CREATE TABLE StorageBlock (
    block_id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    max_weight FLOAT NOT NULL,
    max_size FLOAT NOT NULL
);

-- Table: Package
CREATE TABLE Package (
    id UUID PRIMARY KEY,
    block_id UUID REFERENCES StorageBlock(block_id),
    merchant_id UUID REFERENCES Merchant(account_id),
    description TEXT NOT NULL,
    address_id UUID REFERENCES Address(id) NOT NULL,
    street TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    width FLOAT NOT NULL,
    height FLOAT NOT NULL,
    length FLOAT NOT NULL,
    weight FLOAT NOT NULL,
    is_fragile BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT false,
    shipping_cost DOUBLE PRECISION DEFAULT 0.0,
    cod_cost DOUBLE PRECISION DEFAULT 0.0
);

-- Table: PackageHistory
CREATE TABLE PackageHistory (
    history_id UUID PRIMARY KEY,
    package_id UUID NOT NULL REFERENCES Package(id),
    staff_id UUID NOT NULL REFERENCES Staff(account_id),
    action TEXT NOT NULL,
    notes TEXT,
    timestamp TIMESTAMPTZ NOT NULL
);

-- Relationships
-- User has one Staff and one Merchant
-- Merchant sends multiple Packages
-- Staff handles multiple PackageHistories
-- Package tracks multiple PackageHistories
-- StorageBlock stores multiple Packages
