export interface User {
  id: string;
  telegram_id: number;
  username?: string;
  first_name?: string;
  balance: number;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Skill {
  id: string;
  user_id: string;
  name: string;
  level: number;
  experience: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Stock {
  id: string;
  skill_id: string;
  current_price: number;
  previous_price: number;
  total_shares: number;
  updated_at: string;
}

export interface Portfolio {
  id: string;
  investor_id: string;
  skill_id: string;
  shares: number;
  average_price: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  investor_id: string;
  skill_id: string;
  type: 'buy' | 'sell';
  shares: number;
  price: number;
  total: number;
  created_at: string;
}

export interface Achievement {
  id: string;
  skill_id: string;
  proof_type: 'photo' | 'link' | 'certificate';
  proof_url: string;
  experience_awarded: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface AdminUser {
  id: string;
  user_id: string;
  permissions: string[];
  created_at: string;
}


