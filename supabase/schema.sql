-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  balance DECIMAL(15, 2) DEFAULT 1000.00,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stocks table
CREATE TABLE IF NOT EXISTS stocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_id UUID NOT NULL UNIQUE REFERENCES skills(id) ON DELETE CASCADE,
  current_price DECIMAL(15, 2) NOT NULL DEFAULT 10.00,
  previous_price DECIMAL(15, 2) DEFAULT 10.00,
  total_shares INTEGER DEFAULT 1000,
  volume_24h DECIMAL(15, 2) DEFAULT 0,
  market_cap DECIMAL(15, 2) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  investor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  shares INTEGER NOT NULL CHECK (shares > 0),
  average_price DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(investor_id, skill_id)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  investor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
  shares INTEGER NOT NULL CHECK (shares > 0),
  price DECIMAL(15, 2) NOT NULL,
  total DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements table (proofs of progress)
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proof_type TEXT NOT NULL CHECK (proof_type IN ('photo', 'link', 'certificate')),
  proof_url TEXT NOT NULL,
  experience_awarded INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_skills_user_id ON skills(user_id);
CREATE INDEX IF NOT EXISTS idx_skills_status ON skills(status);
CREATE INDEX IF NOT EXISTS idx_stocks_skill_id ON stocks(skill_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_investor_id ON portfolios(investor_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_skill_id ON portfolios(skill_id);
CREATE INDEX IF NOT EXISTS idx_transactions_investor_id ON transactions(investor_id);
CREATE INDEX IF NOT EXISTS idx_transactions_skill_id ON transactions(skill_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_achievements_skill_id ON achievements(skill_id);
CREATE INDEX IF NOT EXISTS idx_achievements_status ON achievements(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create stock when skill is approved
CREATE OR REPLACE FUNCTION create_stock_on_skill_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    INSERT INTO stocks (skill_id, current_price, previous_price, total_shares)
    VALUES (NEW.id, 10.00, 10.00, 1000)
    ON CONFLICT (skill_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_stock_on_approval AFTER UPDATE ON skills
  FOR EACH ROW EXECUTE FUNCTION create_stock_on_skill_approval();

-- Function to update stock price when experience changes
CREATE OR REPLACE FUNCTION update_stock_price()
RETURNS TRIGGER AS $$
DECLARE
  new_price DECIMAL(15, 2);
BEGIN
  -- Calculate price: base (10) + level * 2 + experience / 100
  new_price := 10.00 + (NEW.level * 2) + (NEW.experience / 100.0);
  
  UPDATE stocks
  SET 
    previous_price = current_price,
    current_price = new_price,
    updated_at = NOW()
  WHERE skill_id = NEW.id;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_stock_on_experience AFTER UPDATE OF level, experience ON skills
  FOR EACH ROW
  WHEN (OLD.level IS DISTINCT FROM NEW.level OR OLD.experience IS DISTINCT FROM NEW.experience)
  EXECUTE FUNCTION update_stock_price();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (true);

-- Skills policies
CREATE POLICY "Anyone can view approved skills" ON skills
  FOR SELECT USING (status = 'approved' OR user_id IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "Users can create their own skills" ON skills
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own skills" ON skills
  FOR UPDATE USING (true);

-- Stocks policies
CREATE POLICY "Anyone can view stocks" ON stocks
  FOR SELECT USING (true);

-- Portfolios policies
CREATE POLICY "Users can view their own portfolio" ON portfolios
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own portfolio" ON portfolios
  FOR ALL USING (true);

-- Transactions policies
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (true);

CREATE POLICY "Users can create transactions" ON transactions
  FOR INSERT WITH CHECK (true);

-- Achievements policies
CREATE POLICY "Users can view achievements for their skills" ON achievements
  FOR SELECT USING (
    skill_id IN (SELECT id FROM skills WHERE user_id IN (SELECT id FROM users))
    OR skill_id IN (SELECT id FROM skills WHERE status = 'approved')
  );

CREATE POLICY "Users can create achievements" ON achievements
  FOR INSERT WITH CHECK (true);

-- Admin users policies
CREATE POLICY "Only admins can view admin_users" ON admin_users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = (SELECT id FROM users WHERE role = 'admin'))
  );


